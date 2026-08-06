// Standalone OCR script - runs as a child process outside Next.js worker sandbox
// Usage: node scripts/ocr-worker.js <input-image-path> <output-json-path>

const { createWorker } = require("tesseract.js");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const nonVegKeywords = ["chicken", "mutton", "egg", "fish", "pork", "beef", "prawn", "keema", "seekh", "wings", "kebab", "tandoori chicken", "butter chicken"];
const vegKeywords = ["paneer", "veg", "dal", "aloo", "gobi", "matar", "cheese", "mushroom", "roti", "naan", "paratha", "rice", "salad", "soup", "chaas", "lassi", "raita"];

async function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];

  if (!inputPath || !outputPath) {
    console.error("Usage: node ocr-worker.js <input-image> <output-json>");
    process.exit(1);
  }

  try {
    const rawBuffer = fs.readFileSync(inputPath);

    // Sharp preprocessing: Resize to optimal width, grayscale, sharpen
    let processedBuffer = rawBuffer;
    try {
      processedBuffer = await sharp(rawBuffer)
        .resize({ width: 2000, fit: "inside", withoutEnlargement: false })
        .grayscale()
        .sharpen({ sigma: 2 })
        .normalize()
        .toBuffer();
    } catch (e) {
      console.warn("Sharp preprocessing failed, using raw buffer");
    }

    const worker = await createWorker("eng");
    const { data } = await worker.recognize(processedBuffer);
    await worker.terminate();

    const lines = data.text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length >= 3);

    const categoriesMap = new Map();
    let currentCategory = "Menu Items";
    categoriesMap.set(currentCategory, []);

    for (const line of lines) {
      const cleanLine = line.replace(/[^a-zA-Z0-9\s&\/]/g, "").trim();

      // Price matching patterns
      const priceMatch =
        line.match(/^(.+?)\s*[\.\-\:\s_]*\s*[₹]?\s*(\d{2,4})\s*[\/\-]*\s*$/) ||
        line.match(/^(.+?)\s+(\d{2,4})\s*$/) ||
        line.match(/(.+?)(?:Rs\.?|₹)\s*(\d{2,4})/i);

      if (priceMatch && priceMatch[1] && priceMatch[2]) {
        const rawName = priceMatch[1].replace(/[\._\-\:\*\#\|]/g, " ").replace(/\s+/g, " ").trim();
        const price = parseInt(priceMatch[2], 10);

        // Validate: name must be real text (not just numbers/symbols), price in reasonable range
        if (rawName.length >= 3 && price >= 10 && price <= 9999 && !/^\d+$/.test(rawName) && /[a-zA-Z]{2,}/.test(rawName)) {
          const lowerName = rawName.toLowerCase();

          let isVeg = true;
          if (nonVegKeywords.some((kw) => lowerName.includes(kw))) {
            isVeg = false;
          }

          const items = categoriesMap.get(currentCategory) || [];
          // Deduplicate
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

      // Category header detection
      if (
        cleanLine.length >= 3 &&
        cleanLine.length <= 40 &&
        !/\d{2,}/.test(cleanLine) &&
        (cleanLine === cleanLine.toUpperCase() || /^[A-Z][a-zA-Z\s&\/]{2,35}$/.test(cleanLine))
      ) {
        currentCategory = cleanLine;
        if (!categoriesMap.has(currentCategory)) {
          categoriesMap.set(currentCategory, []);
        }
      }
    }

    const categories = [];
    for (const [categoryName, items] of categoriesMap.entries()) {
      if (items.length > 0) {
        categories.push({ categoryName, items });
      }
    }

    fs.writeFileSync(outputPath, JSON.stringify({ categories }, null, 2));
    console.log("OCR_SUCCESS:" + categories.reduce((n, c) => n + c.items.length, 0));
    process.exit(0);
  } catch (err) {
    console.error("OCR_ERROR:" + err.message);
    fs.writeFileSync(outputPath, JSON.stringify({ categories: [] }));
    process.exit(1);
  }
}

main();
