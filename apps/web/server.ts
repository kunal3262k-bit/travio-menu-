import { createServer } from "http";
import { copyFile, mkdir, readdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { setIO } from "@/lib/socket";
import { assertStaffAuthConfig } from "@/lib/staffAuthConfig";

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
  assertStaffAuthConfig(process.env);

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

  // Expose the io instance so API routes can push events server-side.
  // All state-changing events (new order, status changes, payment claims,
  // payment confirmations, waiter calls/bill requests) are now emitted from
  // the API routes AFTER the database write. We deliberately do NOT accept
  // these from client sockets — a client-emitted event was a spoof vector.
  setIO(io);

  io.on("connection", (socket) => {
    // Basic room joining logic
    socket.on("join_room", (room: string) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Client-initiated escalation alert when a kitchen ticket stays unacknowledged
    // for > 20s. This is a read-only alert (no state mutation), kept client-side.
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
