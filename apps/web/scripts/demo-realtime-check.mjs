import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");

const BASE = process.env.DEMO_BASE || "https://paying-victory-sagging.ngrok-free.dev";
const SLUG = "demo";
const RESTAURANT_ID = "demo-restaurant";
const TABLE_NUMBER = 2;
const KITCHEN_STAFF = { id: "demo-staff-kitchen", pin: "1234" };
const WAITER_STAFF = { id: "demo-staff-waiter", pin: "5678" };

const envPath = join(webRoot, ".env");
const env = {};
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const { PrismaClient } = await import("@prisma/client");
const { io } = await import("socket.io-client");

const prisma = new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } });

const results = [];
function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  [${detail}]` : ""}`);
}

async function api(method, path, { body, cookie } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (cookie) headers["Cookie"] = cookie;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: "manual",
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json, headers: res.headers };
}

function connectRoom(room) {
  return new Promise((resolve, reject) => {
    const s = io(BASE, { transports: ["websocket"], reconnection: false, forceNew: true });
    s.on("connect", () => {
      s.emit("join_room", room);
      resolve(s);
    });
    s.on("connect_error", (e) => reject(e));
    setTimeout(() => reject(new Error(`connect timeout for ${room}`)), 10000);
  });
}

function waiter(socket, eventName, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const handler = (payload) => {
      socket.off(eventName, handler);
      clearInterval(iv);
      resolve({ payload, at: Date.now() - t0 });
    };
    socket.on(eventName, handler);
    const iv = setInterval(() => {
      if (Date.now() - t0 > timeoutMs) {
        clearInterval(iv);
        socket.off(eventName, handler);
        reject(new Error(`timeout waiting ${eventName}`));
      }
    }, 200);
  });
}

const timings = [];
function record(label, ms) {
  timings.push({ label, ms });
  console.log(`  TIMING  ${label}: ${ms} ms`);
}

let kitchenCookie, waiterCookie, orderId;

try {
  // ---- 0. Panel reachability via ngrok
  for (const p of ["/demo", `/demo/staff/kitchen`, `/demo/staff/waiter`, `/demo/t/${TABLE_NUMBER}`]) {
    const r = await fetch(BASE + p);
    check(`page ${p} -> ${r.status}`, r.status === 200, `status=${r.status}`);
  }

  // ---- 1. Demo data sanity
  const restaurant = await prisma.restaurant.findUnique({ where: { id: RESTAURANT_ID } });
  check("demo restaurant exists", !!restaurant, restaurant?.name);
  const table = await prisma.table.findFirst({ where: { restaurantId: RESTAURANT_ID, number: TABLE_NUMBER } });
  check(`table ${TABLE_NUMBER} exists`, !!table, table?.id);
  const menuItem = await prisma.menuItem.findFirst({ where: { restaurantId: RESTAURANT_ID, available: true } });
  check("menu item available", !!menuItem, menuItem?.id);

  // ---- 2. Socket rooms
  const kitchenSock = await connectRoom(`kitchen_${RESTAURANT_ID}`);
  const waiterSock = await connectRoom(`waiter_${RESTAURANT_ID}`);
  const adminSock = await connectRoom(`admin_${RESTAURANT_ID}`);
  check("socket rooms connected (kitchen/waiter/admin)", true);

  // ---- 3. Staff login
  let r = await api("POST", "/api/staff/login", { body: { restaurantSlug: SLUG, staffId: KITCHEN_STAFF.id, pin: "9999" } });
  check("kitchen wrong PIN -> 401", r.status === 401, `got ${r.status}`);

  r = await api("POST", "/api/staff/login", { body: { restaurantSlug: SLUG, staffId: KITCHEN_STAFF.id, pin: KITCHEN_STAFF.pin } });
  const sc = r.headers.get("set-cookie") || "";
  kitchenCookie = (sc.match(/swifttab_staff_session=([^;]+)/) || [])[1];
  check("kitchen login -> 200 + HttpOnly JWT cookie", r.status === 200 && !!kitchenCookie && /HttpOnly/i.test(sc), `status=${r.status} httpOnly=${/HttpOnly/i.test(sc)}`);

  r = await api("POST", "/api/staff/login", { body: { restaurantSlug: SLUG, staffId: WAITER_STAFF.id, pin: WAITER_STAFF.pin } });
  const scw = r.headers.get("set-cookie") || "";
  waiterCookie = (scw.match(/swifttab_staff_session=([^;]+)/) || [])[1];
  check("waiter login -> 200 + cookie", r.status === 200 && !!waiterCookie);

  // ---- 4. Place table order (customer flow) -> kitchen new-order realtime
  const idemKey = `demo-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const evKitchenNew = waiter(kitchenSock, "kitchen_new_order");
  const evWaiterNew = waiter(waiterSock, "new_order");
  const tPost0 = Date.now();
  r = await api("POST", "/api/orders", {
    body: {
      restaurantSlug: SLUG,
      tableNumber: TABLE_NUMBER,
      customerName: "Demo Realtime Check",
      idempotencyKey: idemKey,
      items: [{ menuItemId: menuItem.id, quantity: 2 }],
    },
  });
  const tPost1 = Date.now();
  const order = r.json?.order;
  check("table order created -> 201", r.status === 201 && !!order?.id, `status=${r.status}`);
  if (!order?.id) throw new Error("no order id");
  orderId = order.id;

  let ev = await evKitchenNew;
  check("KITCHEN realtime: got kitchen_new_order", ev.payload.orderId === orderId, `latency=${ev.at}ms`);
  record("place order -> kitchen_new_order event", ev.at);

  ev = await evWaiterNew;
  check("WAITER realtime: got new_order", ev.payload.orderId === orderId, `latency=${ev.at}ms`);

  // ---- 5. Kitchen marks PREPARING -> kitchen board sync
  const evKitchenPrep = waiter(kitchenSock, "kitchen_order_status_changed");
  const evWaiterPrep = waiter(waiterSock, "waiter_order_status");
  const tPrep0 = Date.now();
  r = await api("PATCH", `/api/orders/${orderId}/status`, { body: { status: "PREPARING" }, cookie: `swifttab_staff_session=${kitchenCookie}` });
  check("kitchen status PREPARING -> 200", r.status === 200, `got ${r.status}`);
  ev = await evKitchenPrep;
  check("KITCHEN realtime: got kitchen_order_status_changed PREPARING", ev.payload.status === "PREPARING", `latency=${ev.at}ms`);
  record("status PATCH PREPARING -> kitchen_order_status_changed", ev.at);
  ev = await evWaiterPrep;
  check("WAITER realtime: got waiter_order_status PREPARING", ev.payload.status === "PREPARING", `latency=${ev.at}ms`);

  // ---- 6. Kitchen marks READY -> WAITER gets ready notification WITHOUT refresh (the exact VPS failure)
  const evWaiterReady = waiter(waiterSock, "waiter_order_status");
  const evKitchenReady = waiter(kitchenSock, "kitchen_order_status_changed");
  const tReady0 = Date.now();
  r = await api("PATCH", `/api/orders/${orderId}/status`, { body: { status: "READY" }, cookie: `swifttab_staff_session=${kitchenCookie}` });
  const tReady1 = Date.now();
  check("kitchen status READY -> 200", r.status === 200, `got ${r.status}`);
  ev = await evWaiterReady;
  check("WAITER realtime: got waiter_order_status READY (no refresh needed)", ev.payload.status === "READY", `latency=${ev.at}ms`);
  record("status PATCH READY -> waiter_order_status (READY notif)", ev.at);
  ev = await evKitchenReady;
  check("KITCHEN realtime: got kitchen_order_status_changed READY", ev.payload.status === "READY", `latency=${ev.at}ms`);

  // ---- 7. Payment claim (customer) -> waiter notified
  const evWClaim = waiter(waiterSock, "payment_claimed");
  const evAClaim = waiter(adminSock, "payment_claimed");
  const tClaim0 = Date.now();
  r = await api("POST", "/api/orders/claim-payment", { body: { orderIds: [orderId], method: "UPI" } });
  check("claim payment UPI -> 200", r.status === 200, `got ${r.status}`);
  ev = await evWClaim;
  check("WAITER realtime: got payment_claimed", ev.payload.method === "UPI", `latency=${ev.at}ms`);
  record("claim payment -> waiter payment_claimed", ev.at);
  await evAClaim;

  // ---- 8. Staff confirms payment -> waiter/admin + order settled
  const evWConfirm = waiter(waiterSock, "payment_confirmed");
  const evAConfirm = waiter(adminSock, "admin_payment_confirmed");
  const tConf0 = Date.now();
  r = await api("PATCH", `/api/orders/${orderId}/payment`, { body: {}, cookie: `swifttab_staff_session=${kitchenCookie}` });
  check("confirm payment (kitchen role, staff route) -> 200", r.status === 200, `got ${r.status}`);
  ev = await evWConfirm;
  check("WAITER realtime: got payment_confirmed", !!ev.payload, `latency=${ev.at}ms`);
  record("confirm payment -> waiter payment_confirmed", ev.at);
  ev = await evAConfirm;
  check("ADMIN realtime: got admin_payment_confirmed", !!ev.payload, `latency=${ev.at}ms`);

  // ---- 9. DB settled state + order history / daily summary
  const dbOrder = await prisma.order.findUnique({ where: { id: orderId } });
  check("order settled: PAID + COMPLETED + invoice",
    dbOrder.paymentStatus === "PAID" && dbOrder.status === "COMPLETED" && dbOrder.invoiceNumber != null,
    `status=${dbOrder.status} pay=${dbOrder.paymentStatus} inv=${dbOrder.invoiceNumber}`);

  const today = new Date();
  if (today.getHours() < 5) today.setDate(today.getDate() - 1);
  today.setHours(5, 0, 0, 0);
  const dayAgg = await prisma.order.aggregate({
    where: { restaurantId: RESTAURANT_ID, createdAt: { gte: today } },
    _count: { id: true },
    _sum: { totalPaise: true },
  });
  check("order appears in demo daily summary (order history)",
    dayAgg._count.id >= 1 && dayAgg._sum.totalPaise > 0,
    `today orders=${dayAgg._count.id} total=Rs.${((dayAgg._sum.totalPaise || 0) / 100).toFixed(2)}`);

  const tableDb = await prisma.table.findUnique({ where: { id: table.id } });
  check(`table ${TABLE_NUMBER} released after payment (session cleared)`, !tableDb.currentSessionId, `session=${tableDb.currentSessionId}`);

  kitchenSock.close(); waiterSock.close(); adminSock.close();
} catch (e) {
  check("unhandled error", false, String(e && e.message ? e.message : e));
} finally {
  await prisma.$disconnect();
}

const failed = results.filter((r) => !r.pass);
console.log(`\n===== ${results.length - failed.length}/${results.length} checks passed =====`);
process.exit(failed.length > 0 ? 1 : 0);
