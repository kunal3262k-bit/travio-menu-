import { createServer } from "http";
import { copyFile, mkdir, readdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3001", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function ensureRuntimeChunks() {
  const serverDir = join(process.cwd(), ".next", "server");
  const chunkDir = join(serverDir, "chunks");
  const vendorDir = join(serverDir, "vendor-chunks");
  const nodeModulesDir = join(process.cwd(), "..", "..", "node_modules");

  if (!existsSync(chunkDir)) return;

  await mkdir(vendorDir, { recursive: true });

  const chunkFiles = await readdir(chunkDir);
  for (const file of chunkFiles) {
    if (file.endsWith(".js")) {
      await copyFile(join(chunkDir, file), join(serverDir, file));
    }
  }

  const toModuleId = (pkgPath: string) => `(ssr)/../../node_modules/${pkgPath.replace(/\\/g, "/")}`;

  const writeWebpackChunk = async (file: string, modulePaths: string[], requireTarget: string) => {
    const target = join(vendorDir, file);
    const modules = modulePaths
      .map(
        (modulePath) =>
          `  ${JSON.stringify(toModuleId(modulePath))}: (module) => {\n    module.exports = require(${JSON.stringify(requireTarget)});\n  }`
      )
      .join(",\n");

    const contents = `exports.id = ${JSON.stringify(file.replace(/\.js$/, ""))};\nexports.ids = [${JSON.stringify(file.replace(/\.js$/, ""))}];\nexports.modules = {\n${modules}\n};\n`;
    await writeFile(target, contents, "utf8");
  };

  await writeWebpackChunk("next-auth.js", ["next-auth/react/index.js", "next-auth/index.js"], "next-auth/react");

  const lucideIconDir = join(nodeModulesDir, "lucide-react", "dist", "esm", "icons");
  const lucideIconFiles = existsSync(lucideIconDir) ? await readdir(lucideIconDir) : [];
  const lucideModulePaths = ["lucide-react/dist/esm/lucide-react.js"];
  for (const iconFile of lucideIconFiles) {
    if (iconFile.endsWith(".js")) {
      lucideModulePaths.push(`lucide-react/dist/esm/icons/${iconFile}`);
    }
  }

  await writeWebpackChunk("lucide-react.js", lucideModulePaths, "lucide-react");
}

app.prepare().then(async () => {
  await ensureRuntimeChunks();

  const httpServer = createServer(async (req, res) => {
    try {
      // Bypass Next.js strict host validation for ngrok (ONLY IN DEV)
      if (dev && req.headers.host && req.headers.host.includes("ngrok-free.dev")) {
        req.headers.host = "localhost:3001";
      }

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
    socket.on("order_status_updated", ({ orderId, status, restaurantId, tableId }) => {
      // Broadcast to the specific table's order listeners and table room
      io.to(`order_${orderId}`).emit("order_status_changed", { orderId, status });
      if (tableId) {
        io.to(`table_${tableId}`).emit("table_order_status_changed", { orderId, status });
      }
      io.to(`waiter_${restaurantId}`).emit("waiter_order_status", { orderId, status });
      io.to(`admin_${restaurantId}`).emit("admin_order_status_changed", { orderId, status });
    });

    // Customer events
    socket.on("new_order", ({ restaurantId, orderId }) => {
      // Notify kitchen
      io.to(`kitchen_${restaurantId}`).emit("kitchen_new_order", { orderId });
    });

    socket.on("request_bill", ({ restaurantId, tableId, orderId }) => {
      // Notify waiter
      io.to(`waiter_${restaurantId}`).emit("waiter_bill_requested", { tableId, orderId });
      io.to(`admin_${restaurantId}`).emit("admin_bill_requested", { tableId, orderId });
    });

    socket.on("call_waiter", ({ restaurantId, tableId }) => {
      // Notify waiter
      io.to(`waiter_${restaurantId}`).emit("waiter_called", { tableId });
      io.to(`admin_${restaurantId}`).emit("admin_waiter_called", { tableId });
    });

    socket.on("cash_requested", ({ restaurantId, tableId, amount }) => {
      io.to(`waiter_${restaurantId}`).emit("cash_requested", { tableId, amount });
      io.to(`admin_${restaurantId}`).emit("admin_cash_requested", { tableId, amount });
    });

    socket.on("payment_claimed", ({ restaurantId, tableId, method, amount }) => {
      io.to(`waiter_${restaurantId}`).emit("payment_claimed", { tableId, method, amount });
    });

    socket.on("payment_confirmed", ({ restaurantId, tableId }) => {
      io.to(`table_${tableId}`).emit("payment_confirmed", { tableId });
      io.to(`waiter_${restaurantId}`).emit("payment_confirmed", { tableId });
      io.to(`admin_${restaurantId}`).emit("admin_payment_confirmed", { tableId });
    });

    socket.on("admin_escalation_alert", ({ restaurantId, orderId, role, reason }) => {
      console.log(`[ESCALATION ALERT] ${role} unacknowledged order ${orderId} -> notifying admin_${restaurantId}`);
      io.to(`admin_${restaurantId}`).emit("admin_escalation_received", { orderId, role, reason, timestamp: Date.now() });
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
