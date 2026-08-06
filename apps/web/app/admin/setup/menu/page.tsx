"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ExtractedItem = {
  id: string;
  name: string;
  price: number;
  isVeg: boolean | null;
  needsReview?: boolean;
};

type ExtractedCategory = {
  id: string;
  categoryName: string;
  items: ExtractedItem[];
};

function genId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function SetupMenuPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [categories, setCategories] = useState<ExtractedCategory[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [error, setError] = useState("");

  const compressClientImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxDim = 1000;
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
          0.8
        );
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setAnalyzing(true);
    setError("");
    try {
      const compressedBlob = await compressClientImage(e.target.files[0]);
      const formData = new FormData();
      formData.append("image", compressedBlob, "menu.jpg");

      const res = await fetch("/api/menu/import", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || "Import failed");
      
      const parsedData = (json.data?.categories || []).map((c: any) => ({
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
            needsReview: i.needsReview || conf < 0.85
          };
        })
      }));
      if (parsedData.length === 0 || parsedData.every((c: any) => c.items.length === 0)) {
        throw new Error("No menu items could be detected. Please upload a clearer, well-lit photo of your menu.");
      }
      setCategories(parsedData);
      setShowEditor(true);
    } catch (err: any) {
      setError("Failed to extract menu: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const addManualCategory = () => {
    setCategories([...categories, { id: genId(), categoryName: "", items: [{ id: genId(), name: "", price: 0, isVeg: null, needsReview: false }] }]);
    setShowEditor(true);
  };

  const deleteCategory = (cIdx: number) => {
    setCategories(categories.filter((_, i) => i !== cIdx));
  };

  const handleSave = async () => {
    setError("");
    // Validate
    const validCats = categories.filter(c => c.items.length > 0 && c.items.some(i => i.name.trim() !== ""));
    if (validCats.length === 0) {
      setError("Add at least one category with at least one named item.");
      return;
    }

    setLoading(true);
    try {
      const payload = validCats.map(c => ({
        ...c,
        categoryName: c.categoryName.trim() || "Unnamed Category"
      }));
      const res = await fetch("/api/menu/save-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: payload })
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
          <h1 className="text-3xl font-bold tracking-tight">Create Your Menu</h1>
          <p className="text-gray-500 mt-2">Upload a photo of your physical menu and our AI will digitize it instantly, or start from scratch.</p>
        </div>

        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div className="flex flex-col sm:flex-row gap-4">
          <label className={`cursor-pointer inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors ${analyzing ? "opacity-50 pointer-events-none" : ""}`}>
            {analyzing ? "Analyzing Image..." : "📷 Upload Menu Photo"}
            <input type="file" accept="image/*,.pdf,application/pdf" capture="environment" className="hidden" onChange={handleImageUpload} disabled={analyzing} />
          </label>
          <button onClick={addManualCategory} disabled={analyzing} className="bg-white border border-gray-300 text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            ✏️ Create Manually
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">Step 1 of 3</p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Review Your Menu</h1>
            <p className="text-sm text-gray-500">Edit, add, or remove items before saving.</p>
          </div>
          <button onClick={handleSave} disabled={loading} className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50">
            {loading ? "Saving..." : "Save & Continue →"}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      {categories.map((cat, cIdx) => (
        <div key={cat.id} className="border rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <input
              value={cat.categoryName}
              onChange={(e) => { const c = [...categories]; c[cIdx].categoryName = e.target.value; setCategories(c); }}
              placeholder="Category Name (e.g. Starters)"
              className="text-xl font-bold border-b border-dashed border-gray-300 focus:border-black outline-none pb-1 flex-1 max-w-sm"
            />
            <button onClick={() => deleteCategory(cIdx)} className="ml-4 text-red-400 hover:text-red-600 text-sm font-medium">Delete Category</button>
          </div>

          <div className="space-y-3">
            {cat.items.map((item, iIdx) => (
              <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border ${item.needsReview ? "bg-amber-50 border-amber-300" : "bg-gray-50 border-transparent"}`}>
                {item.needsReview && (
                  <span className="bg-amber-200 text-amber-900 text-xs px-2 py-0.5 rounded font-bold whitespace-nowrap" title="Low OCR confidence score - please verify price">
                    ⚠️ Check Price
                  </span>
                )}
                <input
                  value={item.name}
                  onChange={(e) => { const c = [...categories]; c[cIdx].items[iIdx].name = e.target.value; setCategories(c); }}
                  placeholder="Item Name"
                  className="flex-1 bg-transparent border-b border-gray-200 focus:border-black px-1 py-1 text-sm outline-none font-medium"
                />
                <div className="relative">
                  <span className="absolute left-2 top-1.5 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => { const c = [...categories]; c[cIdx].items[iIdx].price = Number(e.target.value); setCategories(c); }}
                    className="w-20 pl-6 pr-2 py-1 bg-transparent border-b border-gray-200 focus:border-black text-sm outline-none"
                  />
                </div>
                <select
                  value={item.isVeg === true ? "veg" : item.isVeg === false ? "nonveg" : ""}
                  onChange={(e) => { const c = [...categories]; c[cIdx].items[iIdx].isVeg = e.target.value === "veg" ? true : e.target.value === "nonveg" ? false : null; setCategories(c); }}
                  className="border border-gray-200 rounded px-2 py-1 text-sm bg-white"
                >
                  <option value="">Type</option>
                  <option value="veg">🟢 Veg</option>
                  <option value="nonveg">🔴 Non-Veg</option>
                </select>
                <button onClick={() => { const c = [...categories]; c[cIdx].items.splice(iIdx, 1); setCategories(c); }} className="text-red-400 hover:text-red-600 p-1">
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => { const c = [...categories]; c[cIdx].items.push({ id: genId(), name: "", price: 0, isVeg: null }); setCategories(c); }}
            className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-900"
          >
            + Add Item
          </button>
        </div>
      ))}

      <button onClick={addManualCategory} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-black hover:text-black transition-colors">
        + Add New Category
      </button>
    </div>
  );
}
