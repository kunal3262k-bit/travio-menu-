import { estimateDishNutrition } from "@/lib/macroEstimator";
import { resolveDishStudioAssets } from "@/lib/aiFoodStudio";

export type ExtractedMenuItem = {
  id: string;
  name: string;
  price: number;
  isVeg: boolean | null;
  needsReview?: boolean;
  imageUrl?: string;
  imageSource?: string;
  imageGallery?: any;
  calories?: number;
  proteinGrams?: number;
  fatGrams?: number;
  carbsGrams?: number;
  fiberGrams?: number;
  allergens?: string[];
  dietaryFlags?: string[];
  chefNote?: string;
  isHotSizzler?: boolean;
};

export type ExtractedCategory = {
  id: string;
  categoryName: string;
  items: ExtractedMenuItem[];
};

function genId() {
  return Math.random().toString(36).substring(2, 9);
}

const nonVegKeywords = [
  "chicken", "mutton", "egg", "fish", "pork", "beef", "prawn", "prawns", "keema", 
  "seekh", "wings", "tikka non", "kebab", "kabab", "tandoori chicken", "biryani non",
  "meat", "boti", "pomfret", "surmai", "rohu", "duck"
];

const vegKeywords = [
  "paneer", "veg", "vegetarian", "dal", "aloo", "gobi", "matar", "cheese", "mushroom", 
  "roti", "naan", "paratha", "rice", "salad", "soup", "chaat", "kofta", "jeera", "palak",
  "chole", "rajma", "dosa", "idli", "vada", "sambar", "curd", "lassi", "shake", "soda",
  "juice", "tea", "coffee"
];

/**
 * Parses raw OCR text into structured categories, items, prices, studio photos, and nutrition macros.
 */
export function parseMenuTextToCategories(rawText: string): ExtractedCategory[] {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length >= 2);

  const categoriesMap = new Map<string, ExtractedMenuItem[]>();
  let currentCategory = "Starters & Mains";
  categoriesMap.set(currentCategory, []);

  for (const line of lines) {
    const cleanLine = line.replace(/[^a-zA-Z0-9\s&/.,₹\(\)-]/g, "").trim();

    // Check for Category Headers (e.g. "STARTERS", "MAIN COURSE", "BREADS & RICE")
    const isCategoryHeader =
      cleanLine.length >= 3 &&
      cleanLine.length <= 35 &&
      !/\d{2,}/.test(cleanLine) &&
      (cleanLine === cleanLine.toUpperCase() ||
        /^(Starters|Main Course|Mains|Breads|Rice|Beverages|Drinks|Desserts|Soups|Salads|Chinese|Continental|Tandoor|Snacks|Thali|Combos|Specials)/i.test(cleanLine));

    if (isCategoryHeader) {
      currentCategory = cleanLine
        .replace(/[^a-zA-Z\s&]/g, "")
        .trim();
      if (!categoriesMap.has(currentCategory)) {
        categoriesMap.set(currentCategory, []);
      }
      continue;
    }

    // Flexible price matching regex:
    const priceMatch =
      line.match(/^(.+?)\s*(?:[\.|\-|\:|\*|\_|\s|₹|Rs])*?\s*(\d{2,4})\s*(?:\/|\-)?$/i) ||
      line.match(/(.*?)(?:[₹|Rs\.]\s*)(\d{2,4})/i) ||
      line.match(/^(.+?)\s+(\d{2,4})$/);

    if (priceMatch && priceMatch[1] && priceMatch[2]) {
      const rawName = priceMatch[1].replace(/[\._\-\:\*\#\–]/g, " ").replace(/\s+/g, " ").trim();
      const price = parseInt(priceMatch[2], 10);

      // Validate name and reasonable price range (₹10 to ₹9999)
      if (rawName.length >= 2 && price >= 10 && price <= 9999 && !/^\d+$/.test(rawName)) {
        const lowerName = rawName.toLowerCase();

        let isVeg: boolean | null = null;
        if (nonVegKeywords.some((kw) => lowerName.includes(kw))) {
          isVeg = false;
        } else if (vegKeywords.some((kw) => lowerName.includes(kw))) {
          isVeg = true;
        }

        const items = categoriesMap.get(currentCategory) || [];
        // Prevent duplicate names in same category
        if (!items.some((i) => i.name.toLowerCase() === rawName.toLowerCase())) {
          const foodType = isVeg === false ? "NON_VEG" : "VEG";
          const studio = resolveDishStudioAssets(rawName, currentCategory, undefined, foodType);
          const nutrition = estimateDishNutrition(rawName, currentCategory, undefined, foodType);

          items.push({
            id: genId(),
            name: rawName,
            price,
            isVeg,
            needsReview: false,
            imageUrl: studio.primaryUrl,
            imageSource: "AI_STUDIO",
            imageGallery: studio.gallery,
            calories: nutrition.calories,
            proteinGrams: nutrition.proteinGrams,
            fatGrams: nutrition.fatGrams,
            carbsGrams: nutrition.carbsGrams,
            fiberGrams: nutrition.fiberGrams,
            allergens: nutrition.allergens,
            dietaryFlags: nutrition.dietaryFlags,
            chefNote: studio.chefNote,
            isHotSizzler: studio.isHotSizzler
          });
          categoriesMap.set(currentCategory, items);
        }
      }
    }
  }

  const result: ExtractedCategory[] = [];
  for (const [categoryName, items] of categoriesMap.entries()) {
    if (items.length > 0) {
      result.push({
        id: genId(),
        categoryName,
        items,
      });
    }
  }

  return result;
}

/**
 * Runs OCR directly in the user's browser using WebAssembly Worker.
 * Zero API keys, 100% on-device and free.
 */
export async function runClientOcr(
  imageSource: Blob | File | string,
  onProgress?: (status: string) => void
): Promise<ExtractedCategory[]> {
  const { createWorker } = await import("tesseract.js");

  onProgress?.("Initializing on-device vision engine...");
  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text") {
        const pct = Math.round((m.progress || 0) * 100);
        onProgress?.(`Digitizing menu text... ${pct}%`);
      }
    },
  });

  try {
    onProgress?.("Scanning menu layout and prices...");
    const { data } = await worker.recognize(imageSource);
    await worker.terminate();

    onProgress?.("Extracting dishes, studio photos & AI nutrition...");
    const categories = parseMenuTextToCategories(data.text);
    return categories;
  } catch (err) {
    try {
      await worker.terminate();
    } catch (_) {}
    throw err;
  }
}
