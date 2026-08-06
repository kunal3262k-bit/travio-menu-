import { createWorker } from "tesseract.js";

export type ExtractedMenuItem = {
  name: string;
  price: number;
  isVeg: boolean;
  confidence: number;
  needsReview: boolean;
};

export type ExtractedCategory = {
  categoryName: string;
  items: ExtractedMenuItem[];
};

export async function parseMenuImageWithLocalOCR(imageBuffer: Buffer): Promise<ExtractedCategory[]> {
  let worker;
  try {
    worker = await createWorker("eng");
    const { data } = await worker.recognize(imageBuffer);
    await worker.terminate();

    const lines = data.text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 2);

    const categoriesMap = new Map<string, ExtractedMenuItem[]>();
    let currentCategory = "General";
    categoriesMap.set(currentCategory, []);

    const nonVegKeywords = ["chicken", "mutton", "egg", "fish", "pork", "beef", "prawn", "keema", "seekh", "wings"];
    const vegKeywords = ["paneer", "veg", "dal", "aloo", "gobi", "matar", "cheese", "mushroom", "roti", "naan", "paratha", "rice"];

    for (const line of lines) {
      // 1. Check if line is a Category Header (ALL CAPS or short header without numbers)
      const cleanLine = line.replace(/[^a-zA-Z0-9\s&/]/g, "").trim();
      
      // Price detection patterns: e.g. "Paneer Butter Masala 250", "Chicken Curry - 320", "Dal Makhani ... Rs. 180"
      const priceMatch = line.match(/(.*?)(?:[₹|Rs\.|\-\:]*\s*)(\d{2,4})(?:\s*\/|\-)*$/i) ||
                         line.match(/(.*?)(?:[₹|Rs\.]\s*)(\d{2,4})/i);

      if (priceMatch && priceMatch[1] && priceMatch[2]) {
        const rawName = priceMatch[1].replace(/[\._\-\:\*]/g, " ").trim();
        const price = parseInt(priceMatch[2], 10);

        if (rawName.length >= 2 && price >= 10 && price <= 9999) {
          const lowerName = rawName.toLowerCase();
          
          let isVeg = true;
          if (nonVegKeywords.some((kw) => lowerName.includes(kw))) {
            isVeg = false;
          } else if (vegKeywords.some((kw) => lowerName.includes(kw))) {
            isVeg = true;
          }

          const items = categoriesMap.get(currentCategory) || [];
          items.push({
            name: rawName,
            price,
            isVeg,
            confidence: 0.88,
            needsReview: false
          });
          categoriesMap.set(currentCategory, items);
          continue;
        }
      }

      // If line is uppercase and short with no price, treat as a category header
      if (cleanLine.length >= 3 && cleanLine.length <= 30 && cleanLine === cleanLine.toUpperCase() && !/\d/.test(cleanLine)) {
        currentCategory = cleanLine;
        if (!categoriesMap.has(currentCategory)) {
          categoriesMap.set(currentCategory, []);
        }
      }
    }

    // Filter out empty categories
    const categories: ExtractedCategory[] = [];
    for (const [categoryName, items] of categoriesMap.entries()) {
      if (items.length > 0) {
        categories.push({ categoryName, items });
      }
    }

    return categories;
  } catch (err) {
    console.error("Local Tesseract OCR Error:", err);
    if (worker) {
      try { await worker.terminate(); } catch (_) {}
    }
    return [];
  }
}
