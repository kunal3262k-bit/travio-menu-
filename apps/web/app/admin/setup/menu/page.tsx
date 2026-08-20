"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { runClientOcr, type ExtractedCategory, type ExtractedMenuItem } from "@/lib/clientMenuOcr";

function genId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function SetupMenuPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [categories, setCategories] = useState<ExtractedCategory[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [error, setError] = useState("");

  const compressClientImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => resolve(blob || file),
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAnalyzing(true);
    setStatusMessage("Preparing menu image...");
    setError("");

    try {
      const compressedBlob = await compressClientImage(file);
      let parsedCategories: ExtractedCategory[] = [];

      // 1. Try server endpoint first
      try {
        setStatusMessage("Scanning with AI Vision...");
        const formData = new FormData();
        formData.append("image", compressedBlob, "menu.jpg");

        const res = await fetch("/api/menu/import", { method: "POST", body: formData });
        const json = await res.json();
        
        if (res.ok && json.data?.categories && json.data.categories.length > 0) {
          parsedCategories = (json.data.categories || []).map((c: any) => ({
            id: genId(),
            categoryName: c.categoryName || c.name || "Appetizers",
            items: (c.items || []).map((i: any) => {
              const p = Number(i.price);
              const conf = Number(i.confidence || 1.0);
              return {
                ...i,
                id: genId(),
                name: i.name || "Special Dish",
                price: isNaN(p) || p <= 0 ? 150 : p,
                isVeg: typeof i.isVeg === "boolean" ? i.isVeg : true,
                needsReview: i.needsReview || conf < 0.85,
              };
            }),
          }));
        }
      } catch (serverErr) {
        console.warn("Server AI import failed, falling back to on-device engine:", serverErr);
      }

      // 2. If server has no key or returns no items, run on-device WebAssembly OCR
      if (parsedCategories.length === 0 || parsedCategories.every((c) => c.items.length === 0)) {
        setStatusMessage("Running on-device scanner (no cloud key required)...");
        const clientResults = await runClientOcr(compressedBlob, (status) => {
          setStatusMessage(status);
        });

        if (clientResults.length > 0 && clientResults.some((c) => c.items.length > 0)) {
          parsedCategories = clientResults;
        }
      }

      if (parsedCategories.length === 0 || parsedCategories.every((c) => c.items.length === 0)) {
        throw new Error(
          "Could not detect clear menu items. Please take a clear, well-lit photo of your menu, or click 'Create Manually'."
        );
      }

      setCategories(parsedCategories);
      setShowEditor(true);
    } catch (err: any) {
      setError(err.message || "Failed to scan menu photo.");
    } finally {
      setAnalyzing(false);
      setStatusMessage("");
    }
  };

  const addManualCategory = () => {
    setCategories([
      ...categories,
      {
        id: genId(),
        categoryName: "",
        items: [{ id: genId(), name: "", price: 0, isVeg: null, needsReview: false }],
      },
    ]);
    setShowEditor(true);
  };

  const deleteCategory = (cIdx: number) => {
    setCategories(categories.filter((_, i) => i !== cIdx));
  };

  const handleSave = async () => {
    setError("");
    const validCats = categories.filter((c) => c.items.length > 0 && c.items.some((i) => i.name.trim() !== ""));
    if (validCats.length === 0) {
      setError("Add at least one category with at least one named item.");
      return;
    }

    setLoading(true);
    try {
      const payload = validCats.map((c) => ({
        ...c,
        categoryName: c.categoryName.trim() || "General Menu",
      }));
      const res = await fetch("/api/menu/save-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: payload }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save menu");
      }
      router.push("/admin/setup/qr");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!showEditor) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">Step 1 of 3</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Your Menu</h1>
          <p className="text-gray-600 mt-2 leading-relaxed">
            Snap or upload a photo of your physical menu to digitize it in seconds — or create your categories manually.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <label
            className={`cursor-pointer inline-flex items-center justify-center bg-emerald-800 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-emerald-900 shadow-md transition-all active:scale-95 ${
              analyzing ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                {statusMessage || "Scanning Menu..."}
              </span>
            ) : (
              "📷 Scan Menu (Camera / Photo)"
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageUpload}
              disabled={analyzing}
            />
          </label>
          <button
            onClick={addManualCategory}
            disabled={analyzing}
            className="bg-white border border-gray-300 text-slate-900 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-50 shadow-sm transition-all active:scale-95"
          >
            ✏️ Create Manually
          </button>
        </div>

        {analyzing && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center gap-3">
            <span className="h-4 w-4 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin" />
            <span>{statusMessage || "Scanning menu text and organizing prices..."}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">Step 1 of 3</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Review Your Menu</h1>
            <p className="text-sm text-gray-500">Edit, add, or customize dishes and prices before publishing.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-emerald-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-900 shadow-md disabled:opacity-50 active:scale-95 transition-all"
          >
            {loading ? "Saving..." : "Save & Continue →"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {categories.map((cat, cIdx) => (
        <div key={cat.id} className="border border-stone-200 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <input
              value={cat.categoryName}
              onChange={(e) => {
                const c = [...categories];
                c[cIdx].categoryName = e.target.value;
                setCategories(c);
              }}
              placeholder="Category Name (e.g. Starters)"
              className="text-xl font-bold border-b border-dashed border-gray-300 focus:border-emerald-700 outline-none pb-1 flex-1 max-w-sm text-slate-900"
            />
            <button
              onClick={() => deleteCategory(cIdx)}
              className="ml-4 text-red-500 hover:text-red-700 text-xs font-bold"
            >
              Delete Category
            </button>
          </div>

          <div className="space-y-3">
            {cat.items.map((item, iIdx) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  item.needsReview ? "bg-amber-50 border-amber-300" : "bg-stone-50/80 border-stone-200"
                }`}
              >
                {item.needsReview && (
                  <span
                    className="bg-amber-200 text-amber-900 text-xs px-2 py-0.5 rounded font-bold whitespace-nowrap"
                    title="Please verify price"
                  >
                    ⚠️ Check
                  </span>
                )}
                <input
                  value={item.name}
                  onChange={(e) => {
                    const c = [...categories];
                    c[cIdx].items[iIdx].name = e.target.value;
                    setCategories(c);
                  }}
                  placeholder="Dish Name"
                  className="flex-1 bg-transparent border-b border-gray-200 focus:border-emerald-700 px-1 py-1 text-sm outline-none font-semibold text-slate-900"
                />
                <div className="relative">
                  <span className="absolute left-2 top-1.5 text-gray-400 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => {
                      const c = [...categories];
                      c[cIdx].items[iIdx].price = Number(e.target.value);
                      setCategories(c);
                    }}
                    className="w-20 pl-6 pr-2 py-1 bg-transparent border-b border-gray-200 focus:border-emerald-700 text-sm outline-none font-bold text-slate-900"
                  />
                </div>
                <select
                  value={item.isVeg === true ? "veg" : item.isVeg === false ? "nonveg" : ""}
                  onChange={(e) => {
                    const c = [...categories];
                    c[cIdx].items[iIdx].isVeg =
                      e.target.value === "veg" ? true : e.target.value === "nonveg" ? false : null;
                    setCategories(c);
                  }}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold bg-white text-slate-700"
                >
                  <option value="">Type</option>
                  <option value="veg">🟢 Veg</option>
                  <option value="nonveg">🔴 Non-Veg</option>
                </select>
                <button
                  onClick={() => {
                    const c = [...categories];
                    c[cIdx].items.splice(iIdx, 1);
                    setCategories(c);
                  }}
                  className="text-red-400 hover:text-red-600 p-1 text-sm font-bold"
                  aria-label="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              const c = [...categories];
              c[cIdx].items.push({ id: genId(), name: "", price: 0, isVeg: null });
              setCategories(c);
            }}
            className="mt-4 text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
          >
            + Add Item
          </button>
        </div>
      ))}

      <button
        onClick={addManualCategory}
        className="w-full py-4 border-2 border-dashed border-stone-300 rounded-2xl text-stone-600 font-bold hover:border-emerald-700 hover:text-emerald-800 transition-colors bg-white shadow-sm"
      >
        + Add New Category
      </button>
    </div>
  );
}
