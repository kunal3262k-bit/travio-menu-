"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { runClientOcr } from "@/lib/clientMenuOcr";
import { resolveDishStudioAssets } from "@/lib/aiFoodStudio";
import { estimateDishNutrition } from "@/lib/macroEstimator";
import { 
  Sparkles, 
  Activity, 
  Flame, 
  ExternalLink, 
  Camera, 
  Plus, 
  Trash2, 
  Check, 
  Layers, 
  Utensils, 
  ChefHat 
} from "lucide-react";

export default function MenuEditorClient({ 
  initialCategories,
  restaurantSlug 
}: { 
  initialCategories: any[];
  restaurantSlug?: string;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const [isAiExtracting, setIsAiExtracting] = useState(false);
  const [aiStatus, setAiStatus] = useState<string>("");
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const handleSave = async (updatedCats: any[]) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: updatedCats })
      });
      if (!res.ok) throw new Error("Failed to save");
      router.refresh();
    } catch (e) {
      alert("Failed to save menu changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const addCategory = () => {
    const newCats = [...categories, { id: Date.now().toString(), name: "New Category", isNew: true, items: [] }];
    setCategories(newCats);
    handleSave(newCats);
  };

  const removeCategory = (catId: string) => {
    if (!confirm("Are you sure you want to delete this category and all its items?")) return;
    const newCats = categories.filter(c => c.id !== catId);
    setCategories(newCats);
    handleSave(newCats);
  };

  const updateCategory = (catId: string, name: string) => {
    const newCats = categories.map(c => c.id === catId ? { ...c, name } : c);
    setCategories(newCats);
  };

  const saveCategoryBlur = (catId: string, name: string) => {
    const newCats = categories.map(c => c.id === catId ? { ...c, name } : c);
    handleSave(newCats);
  };

  const addItem = (catId: string) => {
    const defaultStudio = resolveDishStudioAssets("New Dish", "Starters");
    const defaultNutrition = estimateDishNutrition("New Dish", "Starters");

    const newCats = categories.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          items: [...c.items, {
            id: Date.now().toString(),
            name: "New Item",
            description: "",
            pricePaise: 15000,
            foodType: "VEG",
            spicyLevel: 0,
            imageUrl: defaultStudio.primaryUrl,
            imageSource: "AI_STUDIO",
            calories: defaultNutrition.calories,
            proteinGrams: defaultNutrition.proteinGrams,
            fatGrams: defaultNutrition.fatGrams,
            carbsGrams: defaultNutrition.carbsGrams,
            allergens: defaultNutrition.allergens,
            dietaryFlags: defaultNutrition.dietaryFlags,
            isNew: true
          }]
        };
      }
      return c;
    });
    setCategories(newCats);
    handleSave(newCats);
  };

  const removeItem = (catId: string, itemId: string) => {
    if (!confirm("Remove this item?")) return;
    const newCats = categories.map(c => {
      if (c.id === catId) return { ...c, items: c.items.filter((i: any) => i.id !== itemId) };
      return c;
    });
    setCategories(newCats);
    handleSave(newCats);
  };

  const updateItem = (catId: string, itemId: string, field: string, value: any) => {
    const newCats = categories.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          items: c.items.map((i: any) => i.id === itemId ? { ...i, [field]: value } : i)
        };
      }
      return c;
    });
    setCategories(newCats);
  };

  const saveItemBlur = (catId: string, itemId: string, field: string, value: any) => {
    const newCats = categories.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          items: c.items.map((i: any) => i.id === itemId ? { ...i, [field]: value } : i)
        };
      }
      return c;
    });
    handleSave(newCats);
  };

  // 1-Click Bulk AI Auto-Enrichment for all items
  const autoEnrichAllWithAi = () => {
    const enriched = categories.map(cat => ({
      ...cat,
      items: cat.items.map((item: any) => {
        const studio = resolveDishStudioAssets(item.name, cat.name, item.description, item.foodType);
        const nutrition = estimateDishNutrition(item.name, cat.name, item.description, item.foodType);
        return {
          ...item,
          imageUrl: item.imageUrl || studio.primaryUrl,
          imageSource: item.imageSource || "AI_STUDIO",
          imageGallery: studio.gallery,
          calories: item.calories || nutrition.calories,
          proteinGrams: item.proteinGrams || nutrition.proteinGrams,
          fatGrams: item.fatGrams || nutrition.fatGrams,
          carbsGrams: item.carbsGrams || nutrition.carbsGrams,
          allergens: item.allergens || nutrition.allergens,
          dietaryFlags: item.dietaryFlags || nutrition.dietaryFlags,
          chefNote: item.chefNote || studio.chefNote
        };
      })
    }));

    setCategories(enriched);
    handleSave(enriched);
    alert("✨ Successfully generated AI Studio food photos, calories, and macros for all items!");
  };

  const handleImageUpload = async (catId: string, itemId: string, file: File) => {
    setUploadingImageId(itemId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      updateItem(catId, itemId, 'imageUrl', data.url);
      updateItem(catId, itemId, 'imageSource', 'UPLOADED');
      saveItemBlur(catId, itemId, 'imageUrl', data.url);
    } catch (error) {
      alert("Failed to upload image. Max size is 4MB.");
    } finally {
      setUploadingImageId(null);
    }
  };

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

  const handleAiImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiExtracting(true);
    setAiStatus("Preparing menu image...");
    try {
      const compressedBlob = await compressClientImage(file);
      setAiStatus("Running AI vision and culinary intelligence engine...");
      const clientResults = await runClientOcr(compressedBlob, (status) => {
        setAiStatus(status);
      });

      if (!clientResults || clientResults.length === 0) {
        throw new Error("Could not detect menu items. Please take a clearer photo or add items manually.");
      }

      const newExtractedCategories = clientResults.map((cat: any) => ({
        id: Date.now().toString() + Math.random().toString(),
        name: cat.categoryName || cat.name || "Specialties",
        isNew: true,
        items: (cat.items || []).map((item: any, idx: number) => {
          const rawPrice = Number(item.price);
          const safePricePaise = isNaN(rawPrice) || rawPrice <= 0 ? 15000 : Math.round(rawPrice * 100);
          return {
            id: Date.now().toString() + Math.random().toString() + idx,
            name: item.name || "Special Dish",
            description: item.description || "",
            pricePaise: safePricePaise,
            foodType: item.isVeg === true ? "VEG" : item.isVeg === false ? "NON_VEG" : "VEG",
            spicyLevel: 0,
            imageUrl: item.imageUrl,
            imageSource: item.imageSource || "AI_STUDIO",
            imageGallery: item.imageGallery || [],
            calories: item.calories,
            proteinGrams: item.proteinGrams,
            fatGrams: item.fatGrams,
            carbsGrams: item.carbsGrams,
            fiberGrams: item.fiberGrams,
            allergens: item.allergens || [],
            dietaryFlags: item.dietaryFlags || [],
            chefNote: item.chefNote,
            isHotSizzler: item.isHotSizzler,
            isNew: true
          };
        })
      }));

      if (newExtractedCategories.length > 0) {
        const combinedCategories = [...categories, ...newExtractedCategories];
        setCategories(combinedCategories);
        handleSave(combinedCategories);
        alert("✨ Successfully scanned your menu! AI Studio photos and macros have been assigned automatically.");
      }
    } catch (error: any) {
      alert("Menu scan error: " + error.message);
    } finally {
      setIsAiExtracting(false);
      setAiStatus("");
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-xl font-bold shadow-2xl z-50 animate-pulse">
          Saving changes...
        </div>
      )}

      {/* Top Banner with AI Import & Auto-Enrich */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-purple-500/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-200 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Food Studio & Macro Engine
            </span>
            {restaurantSlug && (
              <a
                href={`/${restaurantSlug}/t/1`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40"
              >
                <span>Live Table QR Preview</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <h2 className="text-2xl font-black mt-2 text-white">
            Transform Your Menu into a Studio-Grade Visual Experience
          </h2>
          <p className="text-purple-200 text-sm mt-1 max-w-xl">
            Upload a photo of your paper menu to auto-generate studio food photography, high-resolution multi-angle dish cards, and live macro tracking.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={autoEnrichAllWithAi}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Auto-Enrich All Items</span>
          </button>

          <div className="relative w-full sm:w-auto">
            <input 
              type="file" 
              accept="image/*,application/pdf"
              id="ai-upload"
              onChange={handleAiImport}
              disabled={isAiExtracting}
              className="hidden"
            />
            <label 
              htmlFor="ai-upload"
              className={`cursor-pointer w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${isAiExtracting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isAiExtracting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">{aiStatus || "Scanning Menu..."}</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Scan Paper Menu</span>
                </>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Categories & Items */}
      {categories.map((category) => (
        <div key={category.id} className="bg-white border-2 border-stone-200 rounded-3xl shadow-sm overflow-hidden">
          {/* Category Header */}
          <div className="bg-stone-50 p-4 border-b border-stone-200 flex items-center justify-between gap-4">
            <input 
              value={category.name}
              onChange={(e) => updateCategory(category.id, e.target.value)}
              onBlur={(e) => saveCategoryBlur(category.id, e.target.value)}
              className="font-black text-xl bg-transparent border-none focus:ring-0 focus:outline-none flex-1 text-stone-900"
              placeholder="Category Name"
            />
            <button 
              onClick={() => removeCategory(category.id)}
              className="text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl font-bold text-xs"
            >
              Delete Category
            </button>
          </div>

          {/* Items List */}
          <div className="divide-y divide-stone-200">
            {category.items.map((item: any) => {
              const isExpanded = expandedItemId === item.id;

              return (
                <div key={item.id} className="p-4 bg-white space-y-3">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {/* Image Preview & Upload */}
                    <div className="relative w-20 h-20 bg-stone-100 rounded-2xl border border-stone-300 flex items-center justify-center overflow-hidden shrink-0 group">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Utensils className="w-6 h-6 text-stone-400" />
                      )}

                      {uploadingImageId === item.id && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}

                      <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageUpload(category.id, item.id, e.target.files[0]);
                          }
                        }}
                      />
                    </div>

                    {/* Basic Item Info */}
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input 
                          value={item.name}
                          onChange={(e) => updateItem(category.id, item.id, 'name', e.target.value)}
                          onBlur={(e) => saveItemBlur(category.id, item.id, 'name', e.target.value)}
                          className="font-bold text-base border rounded-xl px-3 py-2 focus:border-black focus:outline-none flex-1"
                          placeholder="Dish Name"
                        />
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-stone-500 font-bold">₹</span>
                          <input 
                            type="number"
                            value={item.pricePaise ? item.pricePaise / 100 : 150}
                            onChange={(e) => updateItem(category.id, item.id, 'pricePaise', parseFloat(e.target.value || "0") * 100)}
                            onBlur={(e) => saveItemBlur(category.id, item.id, 'pricePaise', parseFloat(e.target.value || "0") * 100)}
                            className="font-bold text-base border rounded-xl pl-7 pr-3 py-2 w-28 focus:border-black focus:outline-none font-mono"
                            placeholder="Price"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={item.foodType || "VEG"}
                            onChange={(e) => {
                              updateItem(category.id, item.id, 'foodType', e.target.value);
                              saveItemBlur(category.id, item.id, 'foodType', e.target.value);
                            }}
                            className="border rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-stone-50"
                          >
                            <option value="VEG">Veg 🟢</option>
                            <option value="NON_VEG">Non-Veg 🔴</option>
                            <option value="EGG">Egg 🟡</option>
                          </select>

                          {/* Quick Macro Pill */}
                          <button
                            type="button"
                            onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border text-xs font-bold text-stone-700 flex items-center gap-1.5"
                          >
                            <Activity className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{item.calories || 380} kcal · {item.proteinGrams || 24}g P</span>
                            <span className="text-[10px] text-stone-400">{isExpanded ? "▲ Hide" : "▼ Edit Macros"}</span>
                          </button>
                        </div>

                        <button 
                          onClick={() => removeItem(category.id, item.id)}
                          className="text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg font-bold text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Macro & AI Studio Editor */}
                  {isExpanded && (
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 text-xs animate-fadeIn">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-stone-600 font-semibold mb-1">Calories (kcal)</label>
                          <input
                            type="number"
                            value={item.calories || 380}
                            onChange={(e) => updateItem(category.id, item.id, 'calories', parseInt(e.target.value || "0", 10))}
                            onBlur={(e) => saveItemBlur(category.id, item.id, 'calories', parseInt(e.target.value || "0", 10))}
                            className="w-full p-2 border rounded-lg font-bold bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-600 font-semibold mb-1">Protein (g)</label>
                          <input
                            type="number"
                            value={item.proteinGrams || 24}
                            onChange={(e) => updateItem(category.id, item.id, 'proteinGrams', parseFloat(e.target.value || "0"))}
                            onBlur={(e) => saveItemBlur(category.id, item.id, 'proteinGrams', parseFloat(e.target.value || "0"))}
                            className="w-full p-2 border rounded-lg font-bold bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-600 font-semibold mb-1">Fats (g)</label>
                          <input
                            type="number"
                            value={item.fatGrams || 16}
                            onChange={(e) => updateItem(category.id, item.id, 'fatGrams', parseFloat(e.target.value || "0"))}
                            onBlur={(e) => saveItemBlur(category.id, item.id, 'fatGrams', parseFloat(e.target.value || "0"))}
                            className="w-full p-2 border rounded-lg font-bold bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-600 font-semibold mb-1">Carbs (g)</label>
                          <input
                            type="number"
                            value={item.carbsGrams || 36}
                            onChange={(e) => updateItem(category.id, item.id, 'carbsGrams', parseFloat(e.target.value || "0"))}
                            onBlur={(e) => saveItemBlur(category.id, item.id, 'carbsGrams', parseFloat(e.target.value || "0"))}
                            className="w-full p-2 border rounded-lg font-bold bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-stone-600 font-semibold mb-1">Chef&apos;s Signature Note</label>
                        <input
                          type="text"
                          value={item.chefNote || ""}
                          onChange={(e) => updateItem(category.id, item.id, 'chefNote', e.target.value)}
                          onBlur={(e) => saveItemBlur(category.id, item.id, 'chefNote', e.target.value)}
                          placeholder="e.g. 48-hour slow-cooked in royal Awadhi spices..."
                          className="w-full p-2 border rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add item button */}
          <div className="p-4 bg-stone-50 border-t border-stone-200">
            <button 
              onClick={() => addItem(category.id)}
              className="w-full border-2 border-dashed border-stone-300 hover:border-emerald-600 hover:bg-emerald-50 text-stone-600 hover:text-emerald-800 font-bold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item to {category.name || "Category"}</span>
            </button>
          </div>
        </div>
      ))}

      {/* Add New Category Button */}
      <button 
        onClick={addCategory}
        className="w-full bg-stone-900 text-white font-black text-lg py-5 rounded-2xl hover:bg-stone-800 transition-colors shadow-lg flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        <span>Add New Category</span>
      </button>
    </div>
  );
}
