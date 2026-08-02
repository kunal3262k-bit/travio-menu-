import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
  });

  io.on("connection", (socket) => {
    // Basic room joining logic
    socket.on("join_room", (room: string) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Kitchen events
    socket.on("order_status_updated", ({ orderId, status, restaurantId }) => {
      // Broadcast to the specific table's order listeners (if they listen on orderId)
      // and broadcast to waiter room
      io.to(`order_${orderId}`).emit("order_status_changed", { orderId, status });
      io.to(`waiter_${restaurantId}`).emit("waiter_order_status", { orderId, status });
    });

    // Customer events
    socket.on("new_order", ({ restaurantId, orderId }) => {
      // Notify kitchen
      io.to(`kitchen_${restaurantId}`).emit("kitchen_new_order", { orderId });
    });

    socket.on("request_bill", ({ restaurantId, tableId, orderId }) => {
      // Notify waiter
      io.to(`waiter_${restaurantId}`).emit("waiter_bill_requested", { tableId, orderId });
    });

    socket.on("disconnect", () => {
      // Handle disconnects
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
