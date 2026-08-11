import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE = process.env.PROD_BASE || "https://justswifttab.com";
const PIN = "1234";
const RUN = Date.now().toString(36);
const SLUG = `prodcheck-${RUN}`;
let TEMP_RESTAURANT_ID = null;

const { PrismaClient } = await import("@prisma/client");
const { default: bcrypt } = await import("bcryptjs");
const { io } = await import("socket.io-client");

const prisma = new PrismaClient();

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
    const s = io(BASE, { transports: ["websocket"], reconnection: false, forceNew: true, timeout: 15000 });
    s.on("connect", () => { s.emit("join_room", room); resolve(s); });
    s.on("connect_error", (e) => reject(e));
    setTimeout(() => reject(new Error(`connect timeout for ${room}`)), 15000);
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

// Asserts the event does NOT arrive within the window. Resolves true if silent.
function waiterNoEvent(socket, eventName, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const handler = () => {
      clearInterval(iv);
      socket.off(eventName, handler);
      resolve(false);
    };
    socket.on(eventName, handler);
    const iv = setInterval(() => {
      if (Date.now() - t0 > timeoutMs) {
        clearInterval(iv);
        socket.off(eventName, handler);
        resolve(true);
      }
    }, 100);
  });
}

let restaurantId = null;
const createdOrderIds = [];
const createdRequestIds = [];
const createdStaffIds = [];
const usedTableIds = [];

try {
  const tempRestaurant = await prisma.restaurant.create({
    data: {
      name: `ProdCheck ${RUN}`,
      slug: SLUG,
      currency: "INR",
      serviceEnabled: true,
      status: "LIVE",
      tables: { create: [{ number: 2 }, { number: 3 }] },
      categories: { create: [{ name: "Test" }] },
      staff: {
        create: [
          { name: `ProdTest W ${RUN}`, role: "WAITER", pinHash: await bcrypt.hash(PIN, 10) },
          { name: `ProdTest K ${RUN}`, role: "KITCHEN", pinHash: await bcrypt.hash(PIN, 10) },
        ],
      },
    },
  });
  restaurantId = tempRestaurant.id;
  TEMP_RESTAURANT_ID = tempRestaurant.id;

  const menuItem = await prisma.menuItem.create({
    data: { restaurantId, categoryId: (await prisma.category.findFirst({ where: { restaurantId } })).id, name: "ProdTest Item", pricePaise: 10000, foodType: "VEG", available: true },
  });
  const [table2, table3] = await prisma.table.findMany({ where: { restaurantId }, orderBy: { number: "asc" } });
  usedTableIds.push(table2.id, table3.id);
  const [waiterStaff, cookStaff] = await prisma.staff.findMany({ where: { restaurantId } });
  createdStaffIds.push(waiterStaff.id, cookStaff.id);
  check("pre: temp restaurant + table + item + staff created", true, `${SLUG} item=${menuItem.name}`);

  const kitchenSock = await connectRoom(`kitchen_${restaurantId}`);
  const waiterSock = await connectRoom(`waiter_${restaurantId}`);
  const adminSock = await connectRoom(`admin_${restaurantId}`);
  const carSock = await connectRoom(`car_${restaurantId}`);
  check("socket rooms connected (4/4)", true);

  let r = await api("POST", "/api/staff/login", { body: { restaurantSlug: SLUG, staffId: cookStaff.id, pin: "9999" } });
  check("wrong PIN -> 401", r.status === 401, `got ${r.status}`);

  r = await api("POST", "/api/staff/login", { body: { restaurantSlug: SLUG, staffId: cookStaff.id, pin: PIN } });
  const setCookie = r.headers.get("set-cookie") || "";
  const kitchenCookie = (setCookie.match(/swifttab_staff_session=([^;]+)/) || [])[1];
  check("kitchen login -> 200 + HttpOnly JWT cookie", r.status === 200 && !!kitchenCookie && /HttpOnly/i.test(setCookie), `status=${r.status} httpOnly=${/HttpOnly/i.test(setCookie)}`);

  r = await api("POST", "/api/staff/login", { body: { restaurantSlug: SLUG, staffId: waiterStaff.id, pin: PIN } });
  const setCookieW = r.headers.get("set-cookie") || "";
  const waiterCookie = (setCookieW.match(/swifttab_staff_session=([^;]+)/) || [])[1];
  check("waiter login -> 200 + cookie", r.status === 200 && !!waiterCookie);

  // ================= TABLE FLOW =================
  const t0Table = Date.now();
  const evKitchenNew1 = waiter(kitchenSock, "kitchen_new_order");
  const evWaiterNew1 = waiter(waiterSock, "new_order");
  r = await api("POST", "/api/orders", { body: { restaurantSlug: SLUG, tableNumber: table2.number, customerName: `ProdTest ${RUN}`, items: [{ menuItemId: menuItem.id, quantity: 2 }] } });
  const tableOrder = r.json?.order;
  createdOrderIds.push(tableOrder?.id);
  check("table order created -> 201", r.status === 201 && !!tableOrder?.id, `status=${r.status}`);
  let ev = await evKitchenNew1;
  const latencyKds = Date.now() - t0Table;
  check("kitchen room got kitchen_new_order", ev.payload.orderId === tableOrder.id, `latency=${latencyKds}ms`);
  ev = await evWaiterNew1;
  check("waiter room got new_order", ev.payload.orderId === tableOrder.id);

  const orderSock = await connectRoom(`order_${tableOrder.id}`);
  const tableSock = await connectRoom(`table_${table2.id}`);

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
  ev = await evOrderStatus; check("order room got order_status_changed", ev.payload.status === "ACCEPTED");
  ev = await evWaiterStatus; check("waiter room got waiter_order_status", ev.payload.status === "ACCEPTED");
  ev = await evKitchenStatus; check("kitchen room got kitchen_order_status_changed", ev.payload.status === "ACCEPTED");
  ev = await evCarStatus; check("car room got order_status_updated", ev.payload.status === "ACCEPTED");

  r = await api("GET", `/api/staff/kitchen/active-orders?restaurantSlug=${SLUG}`, { cookie: `swifttab_staff_session=${kitchenCookie}` });
  check("kitchen feed -> 200 contains table order", r.status === 200 && r.json?.orders?.some((o) => o.id === tableOrder.id), `status=${r.status}`);
  r = await api("GET", `/api/staff/kitchen/active-orders?restaurantSlug=${SLUG}`, { cookie: `swifttab_staff_session=${waiterCookie}` });
  check("kitchen feed with waiter cookie -> 401", r.status === 401, `got ${r.status}`);

  // waiter request
  const evWReq = waiter(waiterSock, "waiter_request");
  r = await api("POST", "/api/waiter-requests", { body: { restaurantSlug: SLUG, tableNumber: table2.number, type: "CALL_WAITER" } });
  const wreqId = r.json?.request?.id;
  createdRequestIds.push(wreqId);
  check("waiter request CALL_WAITER -> 201", r.status === 201 && !!wreqId, `status=${r.status}`);
  ev = await evWReq;
  check("waiter room got waiter_request", ev.payload.requestType === "CALL_WAITER");
  r = await api("PATCH", "/api/waiter-requests", { body: { requestId: wreqId, status: "RESOLVED" }, cookie: `swifttab_staff_session=${waiterCookie}` });
  check("resolve waiter request (waiter) -> 200", r.status === 200, `got ${r.status}`);

  // waiter active-state
  r = await api("GET", "/api/waiter/active-state", { cookie: `swifttab_staff_session=${waiterCookie}` });
  check("waiter active-state -> 200 incl orders+tables+requests", r.status === 200 && Array.isArray(r.json?.orders) && Array.isArray(r.json?.tables) && Array.isArray(r.json?.requests), `status=${r.status}`);

  // close-session (table settlement)
  const evTableConfirm = waiter(tableSock, "payment_confirmed");
  r = await api("POST", "/api/orders/close-session", { body: { orderId: tableOrder.id } });
  check("close-session (table order) -> 200", r.status === 200, `got ${r.status}`);
  await evTableConfirm.catch(() => {});
  const tOrderDb = await prisma.order.findUnique({ where: { id: tableOrder.id } });
  check("table order settled: PAID + COMPLETED + invoice", tOrderDb.paymentStatus === "PAID" && tOrderDb.status === "COMPLETED" && tOrderDb.invoiceNumber != null, `status=${tOrderDb.status} inv=${tOrderDb.invoiceNumber}`);

  // ================= CAR FLOW =================
  const carSession = `prod-car-${RUN}`;
  const t0Car = Date.now();
  const evCarKitchenNoEvent = waiterNoEvent(kitchenSock, "kitchen_new_order", 1500);
  r = await api("POST", "/api/orders/car", { body: { restaurantSlug: SLUG, customerName: "ProdTest Car", carBrand: "Swift", carColor: "Red", carLicensePlate: "PRD" + RUN.toUpperCase(), tableSessionId: carSession, items: [{ menuItemId: menuItem.id, quantity: 1 }] } });
  const car1 = r.json?.order;
  createdOrderIds.push(car1?.id);
  check("car order round 1 -> 201", r.status === 201 && !!car1?.id, `status=${r.status}`);
  check("CAR GATE: unpaid round 1 does NOT push kitchen_new_order", (await evCarKitchenNoEvent) === true, `latency=${Date.now() - t0Car}ms`);

  r = await api("GET", `/api/staff/kitchen/active-orders?restaurantSlug=${SLUG}`, { cookie: `swifttab_staff_session=${kitchenCookie}` });
  check("CAR GATE: unpaid round 1 NOT on kitchen feed", r.status === 200 && !r.json?.orders?.some((o) => o.id === car1.id));

  const evWClaim = waiter(waiterSock, "payment_claimed");
  r = await api("POST", "/api/orders/claim-payment", { body: { orderIds: [car1.id], method: "UPI" } });
  check("claim-payment UPI -> 200", r.status === 200, `got ${r.status}`);
  ev = await evWClaim;
  check("waiter room got payment_claimed", ev.payload.method === "UPI");

  const evWConfirm = waiter(waiterSock, "payment_confirmed");
  const evAConfirm = waiter(adminSock, "admin_payment_confirmed");
  const evCarConfirm = waiter(carSock, "payment_confirmed");
  r = await api("PATCH", `/api/orders/${car1.id}/payment`, { body: {}, cookie: `swifttab_staff_session=${waiterCookie}` });
  check("staff confirm payment (car) -> 200", r.status === 200, `got ${r.status}`);
  const confirmJson = r.json;
  ev = await evCarConfirm; check("car room got payment_confirmed", true);
  ev = await evWConfirm; check("waiter room got payment_confirmed", true);
  ev = await evAConfirm; check("admin room got admin_payment_confirmed", true);

  const car1Db = await prisma.order.findUnique({ where: { id: car1.id } });
  check("car1 settled: PAID + stays RECEIVED (KDS gate) + invoice + staff", car1Db.paymentStatus === "PAID" && car1Db.status === "RECEIVED" && car1Db.invoiceNumber != null && car1Db.processedByStaffName === waiterStaff.name, `status=${car1Db.status} inv=${car1Db.invoiceNumber} by=${car1Db.processedByStaffName}`);
  check("confirm-payment response returns settledOrderIds", Array.isArray(confirmJson.settledOrderIds) && confirmJson.settledOrderIds.includes(car1.id), `settled=${JSON.stringify(confirmJson.settledOrderIds)}`);

  // round 2 same session (prior round PAID -> gate open -> alert)
  const evCarNew2 = waiter(kitchenSock, "kitchen_new_order");
  r = await api("POST", "/api/orders/car", { body: { restaurantSlug: SLUG, customerName: "ProdTest Car", carBrand: "Swift", carColor: "Red", carLicensePlate: "PRD" + RUN.toUpperCase(), tableSessionId: carSession, items: [{ menuItemId: menuItem.id, quantity: 1 }] } });
  const car2 = r.json?.order;
  createdOrderIds.push(car2?.id);
  check("car order round 2 -> 201 (joined session)", r.status === 201 && !!car2?.id, `status=${r.status}`);
  ev = await evCarNew2;
  check("CAR GATE: round 2 (open tab) DOES push kitchen_new_order", ev.payload.orderId === car2.id);
  r = await api("GET", `/api/staff/kitchen/active-orders?restaurantSlug=${SLUG}`, { cookie: `swifttab_staff_session=${kitchenCookie}` });
  check("CAR GATE: round 2 visible after paid round", r.status === 200 && r.json?.orders?.some((o) => o.id === car2.id));

  // KDS lifecycle: ACK(PREPARING) -> READY -> SERVED -> disappears
  r = await api("PATCH", `/api/orders/${car1.id}/status`, { body: { status: "PREPARING" }, cookie: `swifttab_staff_session=${kitchenCookie}` });
  check("car ACK -> PREPARING (200)", r.status === 200, `got ${r.status}`);
  r = await api("PATCH", `/api/orders/${car2.id}/status`, { body: { status: "PREPARING" }, cookie: `swifttab_staff_session=${kitchenCookie}` });
  r = await api("PATCH", `/api/orders/${car1.id}/status`, { body: { status: "READY" }, cookie: `swifttab_staff_session=${kitchenCookie}` });
  check("car READY (200)", r.status === 200, `got ${r.status}`);
  r = await api("PATCH", `/api/orders/${car1.id}/status`, { body: { status: "SERVED" }, cookie: `swifttab_staff_session=${kitchenCookie}` });
  check("car SERVED (200)", r.status === 200, `got ${r.status}`);
  r = await api("GET", `/api/staff/kitchen/active-orders?restaurantSlug=${SLUG}`, { cookie: `swifttab_staff_session=${kitchenCookie}` });
  const feedIds = (r.json?.orders || []).map((o) => o.id);
  check("car1 disappears from KDS feed after SERVED", r.status === 200 && !feedIds.includes(car1.id), `feed=${feedIds.length}`);

  // ================= WAITER PAYMENT SAFETY =================
  r = await api("POST", "/api/orders", { body: { restaurantSlug: SLUG, tableNumber: table2.number, customerName: `ProdTest A ${RUN}`, items: [{ menuItemId: menuItem.id, quantity: 1 }] } });
  const orderA = r.json?.order; createdOrderIds.push(orderA?.id);
  r = await api("POST", "/api/orders", { body: { restaurantSlug: SLUG, tableNumber: table3.number, customerName: `ProdTest B ${RUN}`, items: [{ menuItemId: menuItem.id, quantity: 1 }] } });
  const orderB = r.json?.order; createdOrderIds.push(orderB?.id);
  check("two additional visible orders created (A,B)", !!orderA?.id && !!orderB?.id);

  r = await api("PATCH", `/api/orders/${orderA.id}/payment`, { body: {}, cookie: `swifttab_staff_session=${waiterCookie}` });
  const settledA = r.json?.settledOrderIds || [];
  check("approve ONLY order A -> 200", r.status === 200, `got ${r.status}`);
  const aDb = await prisma.order.findUnique({ where: { id: orderA.id } });
  const bDb = await prisma.order.findUnique({ where: { id: orderB.id } });
  check("order A settled PAID + COMPLETED", aDb.paymentStatus === "PAID" && aDb.status === "COMPLETED", `status=${aDb.status}`);
  check("order B untouched (UNPAID + RECEIVED)", bDb.paymentStatus === "UNPAID" && bDb.status === "RECEIVED", `ps=${bDb.paymentStatus} st=${bDb.status}`);
  check("settledOrderIds contains A, not B", settledA.includes(orderA.id) && !settledA.includes(orderB.id), `settled=${JSON.stringify(settledA)}`);

  r = await api("GET", "/api/waiter/active-state", { cookie: `swifttab_staff_session=${waiterCookie}` });
  const visibleIds = (r.json?.orders || []).map((o) => o.id);
  check("waiter panel shows B, hides A (PAID excluded)", r.status === 200 && visibleIds.includes(orderB.id) && !visibleIds.includes(orderA.id));

  // feed after settlement
  r = await api("GET", `/api/staff/kitchen/active-orders?restaurantSlug=${SLUG}`, { cookie: `swifttab_staff_session=${kitchenCookie}` });
  const feedAfter = (r.json?.orders || []).map((o) => o.id);
  check("KDS feed keeps B, drops settled A", feedAfter.includes(orderB.id) && !feedAfter.includes(orderA.id));

  kitchenSock.close(); waiterSock.close(); adminSock.close(); carSock.close(); orderSock.close(); tableSock.close();
} catch (e) {
  check("unhandled error", false, String(e && e.message ? e.message : e));
} finally {
  if (TEMP_RESTAURANT_ID) {
    try {
      const before = await prisma.order.count({ where: { restaurantId: TEMP_RESTAURANT_ID } });
      await prisma.orderItem.deleteMany({ where: { order: { restaurantId: TEMP_RESTAURANT_ID } } });
      await prisma.restaurant.delete({ where: { id: TEMP_RESTAURANT_ID } });
      const remains = await prisma.restaurant.count({ where: { id: TEMP_RESTAURANT_ID } });
      const orphanOrders = await prisma.order.count({ where: { restaurantId: TEMP_RESTAURANT_ID } });
      check("CLEANUP: temp restaurant deleted (cascade)", remains === 0 && orphanOrders === 0, `orders-removed=${before}`);
    } catch (e) {
      console.log(`CLEANUP FAILED: ${e.message}`);
    }
  }
  await prisma.$disconnect();
}

const failed = results.filter((x) => !x.pass);
console.log(`\n===== ${results.length - failed.length}/${results.length} checks passed =====`);
process.exit(failed.length > 0 ? 1 : 0);
