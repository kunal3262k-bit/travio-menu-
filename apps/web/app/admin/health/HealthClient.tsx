"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function HealthClient() {
  const [socketStatus, setSocketStatus] = useState("Connecting...");

  useEffect(() => {
    const socket = io();

    socket.on("connect", () => {
      setSocketStatus("Connected");
    });

    socket.on("disconnect", () => {
      setSocketStatus("Disconnected");
    });

    socket.on("connect_error", () => {
      setSocketStatus("Connection Error");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-gray-500 font-bold mb-1">Realtime Engine (Socket.IO)</p>
        <p className="font-bold">{socketStatus}</p>
      </div>
      <div className={`w-4 h-4 rounded-full ${socketStatus === "Connected" ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" : socketStatus === "Connecting..." ? "bg-yellow-500" : "bg-red-500"}`}></div>
    </div>
  );
}
