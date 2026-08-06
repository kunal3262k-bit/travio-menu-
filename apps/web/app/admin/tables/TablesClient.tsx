"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

export default function TablesClient({ restaurant, initialTables, baseUrl }: { restaurant: any, initialTables: any[], baseUrl: string }) {
  const router = useRouter();
  const [tables, setTables] = useState(initialTables);
  const [isAdding, setIsAdding] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: newNumber, label: newLabel })
      });
      if (res.ok) {
        const { table } = await res.json();
        setTables([...tables, table].sort((a, b) => a.number - b.number));
        setIsAdding(false);
        setNewNumber("");
        setNewLabel("");
        router.refresh();
      } else {
        alert("Failed to add table. Number might already exist.");
      }
    } catch (e) {
      alert("Error adding table.");
    }
  };

  const handleToggle = async (table: any) => {
    const updated = !table.active;
    setTables(tables.map(t => t.id === table.id ? { ...t, active: updated } : t));
    await fetch("/api/tables", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: table.id, active: updated })
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this table?")) return;
    setTables(tables.filter(t => t.id !== id));
    await fetch(`/api/tables?id=${id}`, { method: "DELETE" });
  };

  // Generates a self-contained HTML window with QR codes - bypasses Next.js layout entirely
  const openPrintWindow = async (tablesToPrint: any[]) => {
    const appUrl = baseUrl || "http://localhost:3001";

    // Generate SVG strings for all tables in parallel
    const cards = await Promise.all(
      tablesToPrint.map(async (table) => {
        const tableUrl = `${appUrl}/${restaurant.slug}/t/${table.number}`;
        const svg = await QRCode.toString(tableUrl, { type: "svg", margin: 1, width: 200 });
        return `
          <div class="card">
            ${svg}
            <h3>${restaurant.name}</h3>
            <p class="table-num">Table ${table.number}</p>
            ${table.label ? `<p class="label">${table.label}</p>` : ""}
            <p class="footer">Powered by SwiftTab</p>
          </div>`;
      })
    );

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>SwiftTab QR Codes</title>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: white; font-family: Arial, sans-serif; }
    .grid { display: grid; grid-template-columns: repeat(${tablesToPrint.length === 1 ? 1 : 3}, 1fr); gap: 16px; padding: 16px; max-width: ${tablesToPrint.length === 1 ? "320px" : "900px"}; margin: 0 auto; }
    .card { border: 2px solid black; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; page-break-inside: avoid; break-inside: avoid; }
    .card svg { width: 180px; height: 180px; }
    h3 { font-size: 18px; font-weight: 900; margin-top: 12px; }
    .table-num { font-size: 16px; font-weight: 700; color: #333; margin-top: 4px; }
    .label { font-size: 12px; color: #888; margin-top: 4px; }
    .footer { font-size: 9px; color: #bbb; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }
    @page { margin: 10mm; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="grid">${cards.join("")}</div>
  <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }<\/script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const printAll = () => openPrintWindow(tables);

  const printSingle = (id: string) => {
    const table = tables.find(t => t.id === id);
    if (table) openPrintWindow([table]);
  };

  const printCarQR = async () => {
    const appUrl = baseUrl || "http://localhost:3001";
    const carUrl = `${appUrl}/${restaurant.slug}/car`;
    const svg = await QRCode.toString(carUrl, { type: "svg", margin: 1, width: 200 });
    
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>SwiftTab Car QR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: white; font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .card { border: 2px solid black; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; align-items: center; text-align: center; }
    .card svg { width: 180px; height: 180px; }
    h3 { font-size: 18px; font-weight: 900; margin-top: 12px; }
    .table-num { font-size: 16px; font-weight: 700; color: #333; margin-top: 4px; }
    .footer { font-size: 9px; color: #bbb; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="card">
    ${svg}
    <h3>${restaurant.name}</h3>
    <p class="table-num">🚗 Drive-In / Car Ordering</p>
    <p class="footer">Powered by SwiftTab</p>
  </div>
  <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }</script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-3xl font-black">Table Management</h1>
          <div className="flex gap-4">
            <button
              onClick={printCarQR}
              className="bg-white border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-50 flex items-center gap-2"
            >
              <span>🚗</span> Print Car QR
            </button>
            <button
              onClick={printAll}
              className="bg-white border-2 border-black text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-50"
            >
              Print All QRs
            </button>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="bg-black text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800"
            >
              + Add Table
            </button>
          </div>
        </div>

        {isAdding && (
          <form onSubmit={handleAdd} className="bg-gray-50 border p-6 rounded-xl flex gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-bold">Table Number</label>
              <input
                type="number"
                required
                min="1"
                value={newNumber}
                onChange={e => setNewNumber(e.target.value)}
                className="w-32 border p-2 rounded-lg"
              />
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-sm font-bold flex justify-between">
                Label <span className="text-gray-400 font-normal">Optional (e.g. &quot;Balcony&quot;)</span>
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                className="w-full border p-2 rounded-lg"
              />
            </div>
            <button className="bg-black text-white px-6 py-2 rounded-lg font-bold h-10">
              Save
            </button>
          </form>
        )}

        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="p-4 font-bold">Table No.</th>
                <th className="p-4 font-bold">Label</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tables.map(table => (
                <tr key={table.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 text-xl font-black">{table.number}</td>
                  <td className="p-4 text-gray-600">{table.label || "-"}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggle(table)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${table.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {table.active ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <button
                      onClick={() => printSingle(table.id)}
                      className="text-blue-600 font-bold text-sm hover:underline"
                    >
                      Print QR
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Force clear all active orders for Table ${table.number}?`)) {
                          const res = await fetch("/api/tables/clear", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ tableId: table.id })
                          });
                          if (res.ok) alert("Table cleared successfully.");
                          else alert("Failed to clear table.");
                        }
                      }}
                      className="text-orange-600 font-bold text-sm hover:underline"
                    >
                      Force Clear
                    </button>
                    <button
                      onClick={() => handleDelete(table.id)}
                      className="text-red-600 font-bold text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
