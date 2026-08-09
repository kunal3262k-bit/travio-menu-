import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const BASE = "http://localhost:3001";

const envPath = join(webRoot, ".env");
const env = {};
for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const { PrismaClient } = await import("@prisma/client");
const { default: bcrypt } = await import("bcryptjs");
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
    setTimeout(() => reject(new Error(`connect timeout for ${room}`)), 8000);
  });
}

// Attaches a listener NOW, returns a promise resolved when the event arrives.
function waiter(socket, eventName, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const handler = (payload) => {
      socket.off(eventName, handler);
      clearInterval(iv);
      resolve(payload);
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

let restaurantId, table, itemA, itemB, kitchenCookie, waiterCookie;

try {
  const slug = `e2e-${Date.now()}`;
  const pinHash = await bcrypt.hash("1234", 10);

  const restaurant = await prisma.restaurant.create({
    data: {
      name: "E2E Test Kitchen",
      slug,
      status: "LIVE",
      tables: { create: { number: 1, label: "T1" } },
      staff: {
        create: [
          { name: "E2E Waiter", role: "WAITER", pinHash },
          { name: "E2E Cook", role: "KITCHEN", pinHash },
        ],
      },
    },
    include: { tables: true, staff: true },
  });
  restaurantId = restaurant.id;
  table = restaurant.tables[0];

  const cat = await prisma.category.create({
    data: { restaurantId, name: "E2E Cat" },
  });
  const [i1, i2] = await prisma.$transaction([
    prisma.menuItem.create({ data: { restaurantId, categoryId: cat.id, name: "E2E Item A", pricePaise: 10000, foodType: "VEG", available: true } }),
    prisma.menuItem.create({ data: { restaurantId, categoryId: cat.id, name: "E2E Item B", pricePaise: 5000, foodType: "VEG", available: true } }),
  ]);
  itemA = i1; itemB = i2;
  const waiterStaff = restaurant.staff.find((s) => s.role === "WAITER");
  const cookStaff = restaurant.staff.find((s) => s.role === "KITCHEN");

  check("seed restaurant/staff/menu", true);

  const kitchenSock = await connectRoom(`kitchen_${restaurantId}`);
  const waiterSock = await connectRoom(`waiter_${restaurantId}`);
  const adminSock = await connectRoom(`admin_${restaurantId}`);
  const carSock = await connectRoom(`car_${restaurantId}`);
  check("socket rooms connected", true);

  // ---- staff login
  let r = await api("POST", "/api/staff/login", { body: { restaurantSlug: slug, staffId: cookStaff.id, pin: "9999" } });
  check("wrong PIN -> 401", r.status === 401, `got ${r.status}`);

  r = await api("POST", "/api/staff/login", { body: { restaurantSlug: slug, staffId: cookStaff.id, pin: "1234" } });
  const setCookie = r.headers.get("set-cookie") || "";
  kitchenCookie = (setCookie.match(/swifttab_staff_session=([^;]+)/) || [])[1];
  check("kitchen login -> 200 + HttpOnly JWT cookie",
    r.status === 200 && !!kitchenCookie && /HttpOnly/i.test(setCookie) && /SameSite=Lax/i.test(setCookie),
    `status=${r.status} httpOnly=${/HttpOnly/i.test(setCookie)}`);

  r = await api("POST", "/api/staff/login", { body: { restaurantSlug: slug, staffId: waiterStaff.id, pin: "1234" } });
  const setCookieW = r.headers.get("set-cookie") || "";
  waiterCookie = (setCookieW.match(/swifttab_staff_session=([^;]+)/) || [])[1];
  check("waiter login -> 200 + cookie", r.status === 200 && !!waiterCookie);

  // ---- table order flow
  const evKitchenNew1 = waiter(kitchenSock, "kitchen_new_order");
  const evWaiterNew1 = waiter(waiterSock, "new_order");
  r = await api("POST", "/api/orders", { body: { restaurantSlug: slug, tableNumber: 1, customerName: "E2E Diner", items: [{ menuItemId: itemA.id, quantity: 2 }] } });
  const tableOrder = r.json?.order;
  check("table order created -> 201", r.status === 201 && !!tableOrder?.id, `status=${r.status}`);
  let ev = await evKitchenNew1;
  check("kitchen room got kitchen_new_order", ev.orderId === tableOrder.id);
  ev = await evWaiterNew1;
  check("waiter room got new_order", ev.orderId === tableOrder.id);

  const orderSock = await connectRoom(`order_${tableOrder.id}`);
  const tableSock = await connectRoom(`table_${table.id}`);

  // auth gates
  r = await api("PATCH", `/api/orders/${tableOrder.id}/status`, { body: { status: "ACCEPTED" } });
  check("status PATCH unauthenticated -> 401", r.status === 401, `got ${r.status}`);

  r = await api("PATCH", `/api/orders/${tableOrder.id}/status`, { body: { status: "ACCEPTED" }, cookie: `swifttab_staff_session=${waiterCookie}` });
  check("waiter (role gate) cannot PATCH status -> 401", r.status === 401, `got ${r.status}`);

  const evOrderStatus = waiter(orderSock, "order_status_changed");
  const evWaiterStatus = waiter(waiterSock, "waiter_order_status");
  const evKitchenStatus = waiter(kitchenSock, "kitchen_order_status_changed");
  const evCarStatus = waiter(carSock, "order_status_updated");
  r = await api("PATCH", `/api/orders/${tableOrder.id}/status`, { body: { status: "ACCEPTED" }, cookie: `swifttab_staff_session=${kitchenCookie}` });
  check("kitchen status PATCH -> 200", r.status === 200, `got ${r.status}`);

  ev = await evOrderStatus;
  check("order room got order_status_changed", ev.status === "ACCEPTED");
  ev = await evWaiterStatus;
  check("waiter room got waiter_order_status", ev.status === "ACCEPTED");
  ev = await evKitchenStatus;
  check("kitchen room got kitchen_order_status_changed", ev.status === "ACCEPTED");
  ev = await evCarStatus;
  check("car room got order_status_updated", ev.status === "ACCEPTED");

  // kitchen feed
  r = await api("GET", `/api/staff/kitchen/active-orders?restaurantSlug=${slug}`, { cookie: `swifttab_staff_session=${kitchenCookie}` });
  check("staff kitchen feed -> 200 contains table order", r.status === 200 && r.json?.orders?.some((o) => o.id === tableOrder.id), `status=${r.status} count=${r.json?.orders?.length}`);

  r = await api("GET", `/api/staff/kitchen/active-orders?restaurantSlug=${slug}`, { cookie: `swifttab_staff_session=${waiterCookie}` });
  check("kitchen feed with waiter cookie -> 401", r.status === 401, `got ${r.status}`);

  r = await api("GET", `/api/staff/kitchen/active-orders?restaurantSlug=${slug}`);
  check("kitchen feed unauthenticated -> 401", r.status === 401, `got ${r.status}`);

  // ---- CAR flow + kitchen gate
  const carSession = `e2e-car-session-${Date.now()}`;
  const evCarNew1 = waiter(kitchenSock, "kitchen_new_order");
  r = await api("POST", "/api/orders/car", { body: { restaurantSlug: slug, customerName: "Car Dude", carBrand: "Swift", carColor: "Red", carLicensePlate: "DL12X1234", tableSessionId: carSession, items: [{ menuItemId: itemB.id, quantity: 1 }] } });
  const car1 = r.json?.order;
  check("car order round 1 -> 201", r.status === 201 && !!car1?.id, `status=${r.status}`);

  ev = await evCarNew1;
  check("kitchen room got car kitchen_new_order", ev.orderId === car1.id);

  r = await api("GET", `/api/staff/kitchen/active-orders?restaurantSlug=${slug}`, { cookie: `swifttab_staff_session=${kitchenCookie}` });
  check("CAR GATE: unpaid round 1 NOT on kitchen feed", r.status === 200 && !r.json?.orders?.some((o) => o.id === car1.id));

  const evWClaim = waiter(waiterSock, "payment_claimed");
  const evAClaim = waiter(adminSock, "payment_claimed");
  r = await api("POST", "/api/orders/claim-payment", { body: { orderIds: [car1.id], method: "UPI" } });
  check("claim-payment UPI -> 200", r.status === 200, `got ${r.status}`);
  ev = await evWClaim;
  check("waiter room got payment_claimed", ev.method === "UPI" && ev.amount === car1.totalPaise);
  ev = await evAClaim;
  check("admin room got payment_claimed", true);

  const evCarConfirm = waiter(carSock, "payment_confirmed");
  const evWConfirm = waiter(waiterSock, "payment_confirmed");
  const evAConfirm = waiter(adminSock, "admin_payment_confirmed");
  r = await api("PATCH", `/api/orders/${car1.id}/payment`, { body: {}, cookie: `swifttab_staff_session=${waiterCookie}` });
  check("staff confirm payment (car) -> 200", r.status === 200, `got ${r.status}`);
  ev = await evCarConfirm;
  check("car room got payment_confirmed", true);
  ev = await evWConfirm;
  check("waiter room got payment_confirmed", true);
  ev = await evAConfirm;
  check("admin room got admin_payment_confirmed", true);

  const car1Db = await prisma.order.findUnique({ where: { id: car1.id } });
  check("car1 settled: PAID + stays RECEIVED (KDS gate) + invoice + staff", car1Db.paymentStatus === "PAID" && car1Db.status === "RECEIVED" && car1Db.invoiceNumber != null && car1Db.processedByStaffName === "E2E Waiter", `status=${car1Db.status} inv=${car1Db.invoiceNumber} by=${car1Db.processedByStaffName}`);

  // round 2, same car session
  const evCarNew2 = waiter(kitchenSock, "kitchen_new_order");
  r = await api("POST", "/api/orders/car", { body: { restaurantSlug: slug, customerName: "Car Dude", carBrand: "Swift", carColor: "Red", carLicensePlate: "DL12X1234", tableSessionId: carSession, items: [{ menuItemId: itemB.id, quantity: 1 }] } });
  const car2 = r.json?.order;
  check("car order round 2 -> 201 (joined session)", r.status === 201 && !!car2?.id, `status=${r.status}`);
  await evCarNew2.catch(() => {});

  r = await api("GET", `/api/staff/kitchen/active-orders?restaurantSlug=${slug}`, { cookie: `swifttab_staff_session=${kitchenCookie}` });
  check("CAR GATE: round 2 visible after paid round", r.status === 200 && r.json?.orders?.some((o) => o.id === car2.id), `count=${r.json?.orders?.length}`);

  // ---- waiter request flow
  const evWReq = waiter(waiterSock, "waiter_request");
  const evWCall = waiter(waiterSock, "waiter_called");
  const evACall = waiter(adminSock, "admin_waiter_called");
  r = await api("POST", "/api/waiter-requests", { body: { restaurantSlug: slug, tableNumber: 1, type: "CALL_WAITER" } });
  const wreqId = r.json?.request?.id;
  check("waiter request CALL_WAITER -> 201", r.status === 201 && !!wreqId, `status=${r.status}`);
  ev = await evWReq;
  check("waiter room got waiter_request", ev.requestType === "CALL_WAITER" && ev.tableId === table.id);
  ev = await evWCall;
  check("waiter room got waiter_called", true);
  ev = await evACall;
  check("admin room got admin_waiter_called", true);

  r = await api("PATCH", "/api/waiter-requests", { body: { requestId: wreqId, status: "RESOLVED" } });
  check("resolve waiter request unauthenticated -> 401", r.status === 401, `got ${r.status}`);
  r = await api("PATCH", "/api/waiter-requests", { body: { requestId: wreqId, status: "RESOLVED" }, cookie: `swifttab_staff_session=${waiterCookie}` });
  check("resolve waiter request (waiter) -> 200", r.status === 200, `got ${r.status}`);

  r = await api("GET", "/api/waiter/active-state");
  check("waiter active-state unauthenticated -> 401", r.status === 401, `got ${r.status}`);
  r = await api("GET", "/api/waiter/active-state", { cookie: `swifttab_staff_session=${waiterCookie}` });
  check("waiter active-state -> 200 incl orders+tables+requests", r.status === 200 && Array.isArray(r.json?.orders) && Array.isArray(r.json?.tables) && Array.isArray(r.json?.requests), `status=${r.status}`);

  // ---- table session close + vacate
  const evTableConfirm = waiter(tableSock, "payment_confirmed");
  r = await api("POST", "/api/orders/close-session", { body: { orderId: tableOrder.id } });
  check("close-session (table order) -> 200", r.status === 200, `got ${r.status}`);
  ev = await evTableConfirm;
  check("table room got payment_confirmed", true);

  const tOrderDb = await prisma.order.findUnique({ where: { id: tableOrder.id } });
  check("table order settled: PAID + COMPLETED + invoice", tOrderDb.paymentStatus === "PAID" && tOrderDb.status === "COMPLETED" && tOrderDb.invoiceNumber != null);

  r = await api("POST", "/api/tables/mark-vacated", { body: { tableId: table.id, tableSessionId: carSession } });
  check("mark-vacated unauthenticated -> 401", r.status === 401, `got ${r.status}`);
  r = await api("POST", "/api/tables/mark-vacated", { body: { tableId: table.id, tableSessionId: carSession }, cookie: `swifttab_staff_session=${waiterCookie}` });
  check("mark-vacated (waiter) -> 200", r.status === 200, `got ${r.status}`);

  kitchenSock.close(); waiterSock.close(); adminSock.close(); carSock.close(); orderSock.close(); tableSock.close();
} catch (e) {
  check("unhandled error", false, String(e && e.message ? e.message : e));
} finally {
  if (restaurantId) {
    try {
      await prisma.order.deleteMany({ where: { restaurantId } });
      await prisma.waiterRequest.deleteMany({ where: { restaurantId } });
      await prisma.restaurant.delete({ where: { id: restaurantId } });
      console.log(`CLEANUP removed restaurant ${restaurantId}`);
    } catch (e) {
      console.log(`CLEANUP failed: ${e.message}`);
    }
  }
  await prisma.$disconnect();
}

const failed = results.filter((r) => !r.pass);
console.log(`\n===== ${results.length - failed.length}/${results.length} checks passed =====`);
process.exit(failed.length > 0 ? 1 : 0);
