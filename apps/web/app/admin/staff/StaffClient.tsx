"use client";

import { useState } from "react";
import { UserCheck, UserX, KeyRound, Plus, ChefHat, Bell, Phone } from "lucide-react";

export default function StaffClient({ initialStaff, restaurantSlug }: { initialStaff: any[]; restaurantSlug: string }) {
  const [staffList, setStaffList] = useState(initialStaff);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState<"WAITER" | "KITCHEN">("WAITER");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setPhone("");
    setPin("");
    setRole("WAITER");
    setEditingStaff(null);
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required");
    if (!editingStaff && (!pin || !/^\d{4}$/.test(pin))) {
      return setError("A 4-digit numeric PIN is required for new staff");
    }
    if (pin && !/^\d{4}$/.test(pin)) {
      return setError("PIN must be exactly 4 digits");
    }

    setSaving(true);
    setError("");

    try {
      if (editingStaff) {
        // Edit staff member
        const res = await fetch(`/api/admin/staff/${editingStaff.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, role, ...(pin ? { pin } : {}) }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update staff member");

        setStaffList((prev) => prev.map((s) => (s.id === editingStaff.id ? data.staff : s)));
      } else {
        // Add new staff member
        const res = await fetch("/api/admin/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, pin, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to add staff member");

        setStaffList((prev) => [data.staff, ...prev]);
      }
      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (staff: any) => {
    try {
      const newActive = !staff.active;
      const res = await fetch(`/api/admin/staff/${staff.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive }),
      });
      const data = await res.json();
      if (res.ok) {
        setStaffList((prev) => prev.map((s) => (s.id === staff.id ? data.staff : s)));
      }
    } catch (e) {
      alert("Failed to change active status");
    }
  };

  const openEdit = (staff: any) => {
    setEditingStaff(staff);
    setName(staff.name || "");
    setPhone(staff.phone || "");
    setRole(staff.role);
    setPin("");
    setError("");
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="font-bold text-gray-900">{staffList.length} Total Staff</span>
          <span>•</span>
          <span className="text-emerald-700 font-semibold">{staffList.filter((s) => s.role === "WAITER" && s.active).length} Active Waiters</span>
          <span>•</span>
          <span className="text-orange-700 font-semibold">{staffList.filter((s) => s.role === "KITCHEN" && s.active).length} Active Kitchen Staff</span>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {/* STAFF LIST TABLE */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b">
                <th className="p-4">Staff Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {staffList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                    No staff members added yet. Click &quot;Add Staff Member&quot; to get started.
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.id} className={`hover:bg-slate-50/80 transition ${!staff.active ? "opacity-60 bg-gray-50" : ""}`}>
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                          staff.role === "KITCHEN" ? "bg-orange-100 text-orange-800" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {staff.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div>{staff.name}</div>
                        <div className="text-[11px] font-normal text-gray-400">Added {new Date(staff.createdAt).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          staff.role === "KITCHEN" ? "bg-orange-100 text-orange-900 border border-orange-200" : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                        }`}
                      >
                        {staff.role === "KITCHEN" ? <ChefHat className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                        {staff.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 font-mono text-xs">
                      {staff.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" /> {staff.phone}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          staff.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {staff.active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {staff.active ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEdit(staff)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition"
                      >
                        Edit / Reset PIN
                      </button>
                      <button
                        onClick={() => toggleActive(staff)}
                        className={`px-3 py-1.5 font-bold text-xs rounded-lg transition ${
                          staff.active ? "bg-red-50 hover:bg-red-100 text-red-700" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {staff.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-black text-slate-900">{editingStaff ? "Edit Staff & PIN" : "Add New Staff Member"}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">
                ✕
              </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold">{error}</div>}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Role *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("WAITER")}
                    className={`py-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition ${
                      role === "WAITER" ? "bg-emerald-600 border-emerald-600 text-white shadow" : "bg-gray-50 border-gray-200 text-gray-700"
                    }`}
                  >
                    <Bell className="w-4 h-4" /> Waiter
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("KITCHEN")}
                    className={`py-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition ${
                      role === "KITCHEN" ? "bg-orange-600 border-orange-600 text-white shadow" : "bg-gray-50 border-gray-200 text-gray-700"
                    }`}
                  >
                    <ChefHat className="w-4 h-4" /> Kitchen Staff
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  {editingStaff ? "New 4-Digit PIN (Leave blank to keep existing)" : "4-Digit Access PIN *"}
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    maxLength={4}
                    required={!editingStaff}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 1234"
                    className="w-full border rounded-xl pl-11 pr-4 py-3 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Staff will enter this PIN on the public staff login screen.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 border rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingStaff ? "Update Staff" : "Save Staff Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
