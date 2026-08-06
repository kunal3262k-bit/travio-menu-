"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MenuEditorClient({ initialCategories }: { initialCategories: any[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const [isAiExtracting, setIsAiExtracting] = useState(false);

  // Auto-save logic can be built on top of this handleSave
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
    const newCats = categories.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          items: [...c.items, {
            id: Date.now().toString(),
            name: "New Item",
            description: "",
            pricePaise: 10000,
            foodType: "VEG",
            spicyLevel: 0,
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
    });
    handleSave(newCats);
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

  const handleAiImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAiExtracting(true);
    try {
      const compressedBlob = await compressClientImage(file);
      const formData = new FormData();
      formData.append("image", compressedBlob, "menu.jpg");

      const res = await fetch("/api/menu/import", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || "Extraction failed");
      }

      const { data } = await res.json();
      
      if (data && data.categories && Array.isArray(data.categories)) {
        // Map AI data to our schema format with safe fallbacks
        const newExtractedCategories = data.categories.map((cat: any) => ({
          id: Date.now().toString() + Math.random().toString(),
          name: cat.categoryName || cat.name || "Appetizers",
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
              isNew: true
            };
          })
        }));

        if (newExtractedCategories.length > 0) {
          const combinedCategories = [...categories, ...newExtractedCategories];
          setCategories(combinedCategories);
          handleSave(combinedCategories);
          alert("✨ AI successfully extracted your menu! Please review the prices and categories.");
        }
      }
    } catch (error: any) {
      alert("AI Extraction failed: " + error.message);
    } finally {
      setIsAiExtracting(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-lg font-medium shadow-lg z-50">
          Saving changes...
        </div>
      )}

      {/* AI Import Top Bar */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-purple-900 flex items-center gap-2">
            ✨ 45-Second AI Menu Import
          </h2>
          <p className="text-purple-700 mt-1">Upload a photo or PDF of your printed menu and let AI do the data entry.</p>
        </div>
        
        <div className="relative">
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
            className={`cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center gap-2 ${isAiExtracting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isAiExtracting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing File...
              </>
            ) : (
              "+ Upload Menu (Image/PDF)"
            )}
          </label>
        </div>
      </div>

      {categories.map((category) => (
        <div key={category.id} className="bg-white border-2 border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {/* Category Header */}
          <div className="bg-gray-50 p-4 border-b flex items-center justify-between gap-4">
            <input 
              value={category.name}
              onChange={(e) => updateCategory(category.id, e.target.value)}
              onBlur={(e) => saveCategoryBlur(category.id, e.target.value)}
              className="font-black text-xl bg-transparent border-none focus:ring-0 focus:outline-none flex-1"
              placeholder="Category Name"
            />
            <button 
              onClick={() => removeCategory(category.id)}
              className="text-red-500 hover:bg-red-50 px-3 py-1 rounded font-bold text-sm"
            >
              Delete
            </button>
          </div>

          {/* Items */}
          <div className="divide-y border-b">
            {category.items.map((item: any) => (
              <div key={item.id} className="p-4 bg-white flex flex-col md:flex-row gap-4 items-start md:items-center">
                
                {/* Image Upload Area */}
                <div className="relative w-full md:w-24 h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 group overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <span className="text-xs font-bold uppercase tracking-wider mb-1">Image</span>
                      <span className="text-[10px] opacity-75">+ Add</span>
                    </>
                  )}
                  
                  {uploadingImageId === item.id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
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

                {/* Details */}
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex gap-2">
                    <input 
                      value={item.name}
                      onChange={(e) => updateItem(category.id, item.id, 'name', e.target.value)}
                      onBlur={(e) => saveItemBlur(category.id, item.id, 'name', e.target.value)}
                      className="font-bold text-lg border rounded-lg px-3 py-2 focus:border-black focus:outline-none flex-1"
                      placeholder="Item Name"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500 font-bold">₹</span>
                      <input 
                        type="number"
                        value={item.pricePaise / 100}
                        onChange={(e) => updateItem(category.id, item.id, 'pricePaise', parseFloat(e.target.value || "0") * 100)}
                        onBlur={(e) => saveItemBlur(category.id, item.id, 'pricePaise', parseFloat(e.target.value || "0") * 100)}
                        className="font-bold text-lg border rounded-lg pl-8 pr-3 py-2 w-28 focus:border-black focus:outline-none"
                        placeholder="Price"
                      />
                    </div>
                  </div>

                  <input 
                    value={item.description || ""}
                    onChange={(e) => updateItem(category.id, item.id, 'description', e.target.value)}
                    onBlur={(e) => saveItemBlur(category.id, item.id, 'description', e.target.value)}
                    className="text-gray-500 border rounded-lg px-3 py-2 w-full focus:border-black focus:outline-none text-sm"
                    placeholder="Description (e.g. Contains nuts, spicy sauce)"
                  />

                  <div className="flex items-center justify-between w-full">
                    <select
                      value={item.foodType}
                      onChange={(e) => {
                        updateItem(category.id, item.id, 'foodType', e.target.value);
                        saveItemBlur(category.id, item.id, 'foodType', e.target.value);
                      }}
                      className="border rounded-lg px-3 py-2 text-sm font-medium focus:border-black focus:outline-none bg-white"
                    >
                      <option value="VEG">Veg 🟢</option>
                      <option value="NON_VEG">Non-Veg 🔴</option>
                      <option value="EGG">Contains Egg 🟡</option>
                    </select>
                    
                    <button 
                      onClick={() => removeItem(category.id, item.id)}
                      className="text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg font-bold text-sm"
                    >
                      Remove Item
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50">
            <button 
              onClick={() => addItem(category.id)}
              className="w-full border-2 border-dashed border-gray-300 hover:border-black hover:bg-gray-100 text-gray-500 hover:text-black font-bold py-3 rounded-xl transition-colors"
            >
              + Add Item to {category.name || "Category"}
            </button>
          </div>
        </div>
      ))}

      <button 
        onClick={addCategory}
        className="w-full bg-black text-white font-black text-xl py-6 rounded-2xl hover:bg-gray-800 transition-colors shadow-lg"
      >
        + Add New Category
      </button>
    </div>
  );
}
