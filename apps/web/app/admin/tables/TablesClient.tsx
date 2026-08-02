"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TablesClient({ restaurant, initialTables }: { restaurant: any, initialTables: any[] }) {
  const router = useRouter();
  const [tables, setTables] = useState(initialTables);
  const [isAdding, setIsAdding] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newLabel, setNewLabel] = useState("");
  
  // For printing
  const [printFilter, setPrintFilter] = useState<string | null>(null);

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

  const printAll = () => {
    setPrintFilter(null);
    setTimeout(() => window.print(), 100);
  };

  const printSingle = (id: string) => {
    setPrintFilter(id);
    setTimeout(() => {
      window.print();
      setPrintFilter(null); // Reset after print dialog
    }, 100);
  };

  const tablesToPrint = printFilter ? tables.filter(t => t.id === printFilter) : tables;

  return (
    <>
      {/* SCREEN LAYOUT */}
      <div className="print:hidden space-y-8">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-3xl font-black">Table Management</h1>
          <div className="flex gap-4">
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
                Label <span className="text-gray-400 font-normal">Optional (e.g. "Balcony")</span>
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

      {/* PRINT LAYOUT */}
      <div className="hidden print:block">
        <div className="grid grid-cols-3 gap-4">
          {tablesToPrint.map(table => {
            const tableUrl = `https://dineflow.in/${restaurant.slug}/t/${table.number}`;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tableUrl)}`;
            
            return (
              <div key={table.id} className="border-2 border-black rounded-lg p-6 flex flex-col items-center justify-center text-center bg-white break-inside-avoid h-[400px]">
                <div className="w-48 h-48 mb-6">
                   <img src={qrUrl} alt={`Table ${table.number} QR`} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-2xl mb-2">{restaurant.name}</h3>
                <p className="text-gray-600 font-bold text-xl">Table {table.number}</p>
                {table.label && <p className="text-gray-500 mt-1">{table.label}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
