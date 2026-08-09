"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, Bell, KeyRound, ArrowRight, UserCheck } from "lucide-react";
import { unlockAudio } from "@/lib/sound";

export default function StaffLoginClient({ restaurant }: { restaurant: any }) {
  const router = useRouter();
  const [role, setRole] = useState<"WAITER" | "KITCHEN">("WAITER");
  const [roster, setRoster] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [pin, setPin] = useState("");
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRoster() {
      setLoadingRoster(true);
      try {
        const res = await fetch(`/api/staff/roster?restaurantSlug=${restaurant.slug}&role=${role}`);
        const data = await res.json();
        if (res.ok) {
          setRoster(data.staff || []);
          if (data.staff && data.staff.length > 0) {
            setSelectedStaffId(data.staff[0].id);
          } else {
            setSelectedStaffId("");
          }
        }
      } catch (e) {
        console.error("Failed to load roster");
      } finally {
        setLoadingRoster(false);
      }
    }
    fetchRoster();
  }, [restaurant.slug, role]);

  const handlePinKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + num);
    }
  };

  const handlePinBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return setError("Please select your name from the staff roster");
    if (!pin || pin.length !== 4) return setError("Please enter your 4-digit PIN");

    // Unlock the shared audio context inside this real user gesture so the
    // staff panel alerts can play immediately after login — no extra tap needed.
    void unlockAudio();

    setLoggingIn(true);
    setError("");

    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantSlug: restaurant.slug,
          staffId: selectedStaffId,
          pin,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // Save session in local storage for instant state reactivity
      localStorage.setItem(`staff_session_${restaurant.slug}`, JSON.stringify(data.session));

      // Redirect to designated staff panel
      const targetPath = role === "KITCHEN" ? `/${restaurant.slug}/staff/kitchen` : `/${restaurant.slug}/staff/waiter`;
      router.push(targetPath);
    } catch (err: any) {
      setError(err.message);
      setPin("");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-white">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-slate-700 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
          {role === "KITCHEN" ? <ChefHat className="w-8 h-8 text-orange-400" /> : <Bell className="w-8 h-8 text-emerald-400" />}
        </div>
        <h1 className="text-2xl font-black">{restaurant.name}</h1>
        <p className="text-xs text-slate-400 font-medium">Select your name & enter 4-digit PIN to access panel</p>
      </div>

      {/* ROLE SELECTOR TABS */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-700">
        <button
          type="button"
          onClick={() => {
            setRole("WAITER");
            setPin("");
            setError("");
          }}
          className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
            role === "WAITER" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40" : "text-slate-400 hover:text-white"
          }`}
        >
          <Bell className="w-4 h-4" /> Waiter Staff
        </button>
        <button
          type="button"
          onClick={() => {
            setRole("KITCHEN");
            setPin("");
            setError("");
          }}
          className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
            role === "KITCHEN" ? "bg-orange-600 text-white shadow-lg shadow-orange-900/40" : "text-slate-400 hover:text-white"
          }`}
        >
          <ChefHat className="w-4 h-4" /> Kitchen Staff
        </button>
      </div>

      {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3.5 rounded-xl text-xs font-bold text-center">{error}</div>}

      <form onSubmit={handleLogin} className="space-y-5">
        {/* STAFF MEMBER ROSTER DROP-DOWN */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Select Your Name ({role}) *
          </label>
          {loadingRoster ? (
            <div className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-400 font-medium animate-pulse">
              Loading active staff roster...
            </div>
          ) : roster.length === 0 ? (
            <div className="w-full bg-red-950/40 border border-red-900/60 rounded-xl p-3.5 text-xs text-red-300 font-medium text-center">
              No active {role.toLowerCase()} staff members added yet. Ask your Manager/Admin to add you to the Staff Roster.
            </div>
          ) : (
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
            >
              {roster.map((s) => (
                <option key={s.id} value={s.id}>
                  👤 {s.name} ({s.role})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 4-DIGIT PIN DISPLAY */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-center">Enter 4-Digit PIN</label>
          <div className="flex justify-center items-center gap-3 my-2">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                    isFilled
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/20"
                      : "border-slate-700 bg-slate-900 text-slate-600"
                  }`}
                >
                  {isFilled ? "•" : ""}
                </div>
              );
            })}
          </div>
        </div>

        {/* ON-SCREEN NUMERIC PIN PAD */}
        <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto pt-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handlePinKeyPress(num)}
              className="bg-slate-700/60 hover:bg-slate-700 text-white font-black text-xl py-3.5 rounded-xl border border-slate-600/50 shadow active:scale-95 transition"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin("")}
            className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs py-3.5 rounded-xl border border-slate-700 active:scale-95 transition"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handlePinKeyPress("0")}
            className="bg-slate-700/60 hover:bg-slate-700 text-white font-black text-xl py-3.5 rounded-xl border border-slate-600/50 shadow active:scale-95 transition"
          >
            0
          </button>
          <button
            type="button"
            onClick={handlePinBackspace}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3.5 rounded-xl border border-slate-700 active:scale-95 transition"
          >
            ⌫ Back
          </button>
        </div>

        <button
          type="submit"
          disabled={loggingIn || !selectedStaffId || pin.length !== 4}
          className={`w-full py-4 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition disabled:opacity-40 ${
            role === "KITCHEN" ? "bg-orange-600 hover:bg-orange-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          {loggingIn ? "Verifying PIN..." : "Access Staff Panel"} <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
