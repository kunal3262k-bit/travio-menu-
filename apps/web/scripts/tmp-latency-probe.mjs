import { io } from "socket.io-client";

const BASE = "http://13.206.142.66";
const RID = "cmskianse0000ml0jlzp031ge";
const ORDER_ID = "latency-probe-" + Date.now();

function connect() {
  return new Promise((resolve, reject) => {
    const s = io(BASE, { transports: ["websocket"], reconnection: false, forceNew: true });
    s.on("connect", () => resolve(s));
    s.on("connect_error", (e) => reject(e));
    setTimeout(() => reject(new Error("connect timeout")), 8000);
  });
}

function once(socket, eventName, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const handler = (payload) => {
      socket.off(eventName, handler);
      clearInterval(iv);
      resolve({ payload, ms: Date.now() - t0 });
    };
    socket.on(eventName, handler);
    const iv = setInterval(() => {
      if (Date.now() - t0 > timeoutMs) {
        clearInterval(iv);
        socket.off(eventName, handler);
        reject(new Error(`timeout ${eventName}`));
      }
    }, 200);
  });
}

const kitchen = await connect();
kitchen.emit("join_room", `kitchen_${RID}`);
const waiterSock = await connect();
waiterSock.emit("join_room", `waiter_${RID}`);
await new Promise((r) => setTimeout(r, 300));

// warm connection
kitchen.emit("ping", {});

// Measurement 1: new_order -> kitchen_new_order (customer-emitter -> kitchen room)
const evKitchen = once(kitchen, "kitchen_new_order");
const emitter = await connect();
const t0 = Date.now();
emitter.emit("new_order", { restaurantId: RID, orderId: ORDER_ID });
const k1 = await evKitchen;
console.log(`STEP3: new_order emit -> kitchen_new_order received = ${Date.now() - t0} ms (payload ${JSON.stringify(k1.payload)})`);

// Measurement 2: order_status_updated -> waiter_order_status
const evWaiter = once(waiterSock, "waiter_order_status");
const t1 = Date.now();
emitter.emit("order_status_updated", { orderId: ORDER_ID, status: "ACCEPTED", restaurantId: RID, tableId: "cmskianse0001ml0j70xx6s4a" });
const w1 = await evWaiter;
console.log(`STEP3: order_status_updated emit -> waiter_order_status received = ${Date.now() - t1} ms (status ${w1.payload.status})`);

// Measurement 3: payment_claimed -> waiter/admin rooms
const evWClaim = once(waiterSock, "payment_claimed");
const evAdmin = (() => {
  const admin = io(BASE, { transports: ["websocket"], reconnection: false, forceNew: true });
  return new Promise((resolve, reject) => {
    admin.on("connect", () => {
      admin.emit("join_room", `admin_${RID}`);
      setTimeout(() => {
        const p = once(admin, "admin_payment_confirmed");
        emitter.emit("payment_claimed", { restaurantId: RID, tableId: "cmskianse0001ml0j70xx6s4a", method: "UPI", amount: 52500 });
        p.then((r) => { console.log(`STEP3: payment_claimed -> admin_payment_confirmed = ${r.ms} ms`); admin.close(); }).catch(() => {});
      }, 300);
    });
    admin.on("connect_error", () => reject(new Error("admin conn err")));
    setTimeout(() => resolve(null), 4000);
  });
})();
await evAdmin;
const wc = await evWClaim;
console.log(`STEP3: payment_claimed -> waiter payment_claimed = ${wc.ms} ms`);

kitchen.close(); waiterSock.close(); emitter.close();
console.log("\nSocket latency checks complete.");
