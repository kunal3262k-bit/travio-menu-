import { createWorker } from "tesseract.js";
import sharp from "sharp";

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
    // Sharp Preprocessing for High OCR Accuracy (Rescale + Grayscale + Sharpen)
    let processedBuffer = imageBuffer;
    try {
      processedBuffer = await sharp(imageBuffer)
        .resize({ width: 1800, fit: "inside", withoutEnlargement: false })
        .grayscale()
        .sharpen()
        .toBuffer();
    } catch (e) {
      console.warn("Sharp preprocessing for OCR failed, using raw buffer:", e);
    }

    worker = await createWorker("eng");
    const { data } = await worker.recognize(processedBuffer);
    await worker.terminate();

    const lines = data.text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length >= 2);

    const categoriesMap = new Map<string, ExtractedMenuItem[]>();
    let currentCategory = "Starters & Mains";
    categoriesMap.set(currentCategory, []);

    const nonVegKeywords = ["chicken", "mutton", "egg", "fish", "pork", "beef", "prawn", "keema", "seekh", "wings", "tikka non", "kebab"];
    const vegKeywords = ["paneer", "veg", "dal", "aloo", "gobi", "matar", "cheese", "mushroom", "roti", "naan", "paratha", "rice", "salad", "soup"];

    for (const line of lines) {
      const cleanLine = line.replace(/[^a-zA-Z0-9\s&/]/g, "").trim();

      // Flexible price matching regex:
      // Matches "Dish Name 150", "Dish Name - 150", "Dish Name ₹150", "Dish Name 150/-", "Dish Name ... 150"
      const priceMatch = line.match(/^(.+?)\s*(?:[\.|\-|\:|\*|\_|\s|₹|Rs])*?\s*(\d{2,4})\s*(?:\/|\-)?$/i) ||
                         line.match(/(.*?)(?:[₹|Rs\.]\s*)(\d{2,4})/i);

      if (priceMatch && priceMatch[1] && priceMatch[2]) {
        const rawName = priceMatch[1].replace(/[\._\-\:\*\#]/g, " ").trim();
        const price = parseInt(priceMatch[2], 10);

        if (rawName.length >= 2 && price >= 10 && price <= 9999 && !/^\d+$/.test(rawName)) {
          const lowerName = rawName.toLowerCase();

          let isVeg = true;
          if (nonVegKeywords.some((kw) => lowerName.includes(kw))) {
            isVeg = false;
          } else if (vegKeywords.some((kw) => lowerName.includes(kw))) {
            isVeg = true;
          }

          const items = categoriesMap.get(currentCategory) || [];
          // Prevent duplicates
          if (!items.some((i) => i.name.toLowerCase() === rawName.toLowerCase())) {
            items.push({
              name: rawName,
              price,
              isVeg,
              confidence: 0.88,
              needsReview: false
            });
            categoriesMap.set(currentCategory, items);
          }
          continue;
        }
      }

      // Check for Category Headers (UPPERCASE or header title)
      if (cleanLine.length >= 3 && cleanLine.length <= 35 && (cleanLine === cleanLine.toUpperCase() || /^[A-Z][a-zA-Z\s&]{2,30}$/.test(cleanLine)) && !/\d{2,}/.test(cleanLine)) {
        currentCategory = cleanLine;
        if (!categoriesMap.has(currentCategory)) {
          categoriesMap.set(currentCategory, []);
        }
      }
    }

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
