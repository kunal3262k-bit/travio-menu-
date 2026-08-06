import { NextResponse } from "next/server";
import sharp from "sharp";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { execFile } from "child_process";
import { writeFileSync, readFileSync, unlinkSync, mkdirSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const menuSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    restaurantName: {
      type: Type.STRING,
      description: "The name of the restaurant, if visible on the menu. Otherwise null.",
      nullable: true
    },
    categories: {
      type: Type.ARRAY,
      description: "List of categories and their menu items",
      items: {
        type: Type.OBJECT,
        properties: {
          categoryName: {
            type: Type.STRING,
            description: "The name of the category (e.g. Starters, Main Course)."
          },
          items: {
            type: Type.ARRAY,
            description: "Menu items in this category",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the menu item" },
                price: { type: Type.NUMBER, description: "Price as raw number e.g. 150" },
                isVeg: { type: Type.BOOLEAN, nullable: true },
                confidence: { type: Type.NUMBER, description: "Confidence score between 0.0 and 1.0" }
              },
              required: ["name", "price", "confidence"]
            }
          }
        },
        required: ["categoryName", "items"]
      }
    }
  },
  required: ["categories"]
};

function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
  ]);
}

// Run OCR in a child process to avoid Next.js worker thread incompatibility
function runOcrChildProcess(imagePath: string, outputPath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "scripts", "ocr-worker.js");
    const child = execFile(
      "node",
      [scriptPath, imagePath, outputPath],
      { timeout: 15000 },
      (error, stdout, stderr) => {
        try {
          const result = JSON.parse(readFileSync(outputPath, "utf-8"));
          resolve(result.categories || []);
        } catch (e) {
          reject(new Error("OCR parse failed"));
        } finally {
          // Cleanup temp files
          try { unlinkSync(imagePath); } catch (_) {}
          try { unlinkSync(outputPath); } catch (_) {}
        }
      }
    );
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const rawBuffer = Buffer.from(new Uint8Array(await image.arrayBuffer()));

    // Compress & resize image to max 900px width to ensure lightning-fast AI processing (<80KB base64)
    let optimizedBuffer: Buffer = rawBuffer;
    try {
      optimizedBuffer = await sharp(rawBuffer)
        .resize({ width: 900, height: 900, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toBuffer();
    } catch (e) {
      console.warn("Image optimization failed, using raw buffer:", e);
    }

    let geminiKey = process.env.SWIFTTAB_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
    let openRouterKey = process.env.OPENROUTER_API_KEY || "";

    try {
      const envPath = path.join(process.cwd(), ".env");
      const envContent = readFileSync(envPath, "utf-8");
      const geminiMatch = envContent.match(/SWIFTTAB_GEMINI_API_KEY=["']?([^"'\r\n]+)["']?/);
      if (geminiMatch && geminiMatch[1]) geminiKey = geminiMatch[1].trim();

      const openRouterMatch = envContent.match(/OPENROUTER_API_KEY=["']?([^"'\r\n]+)["']?/);
      if (openRouterMatch && openRouterMatch[1]) openRouterKey = openRouterMatch[1].trim();
    } catch (_) {}

    let extractedCategories: any[] = [];

    const prompt = `Extract all menu categories, items, prices, veg/non-veg from this photo into JSON.
Return ONLY valid JSON matching this schema: {"categories": [{"categoryName": "string", "items": [{"name": "string", "price": 0, "isVeg": true, "confidence": 0.9}]}]}
Rules: 
1. Only extract visible items. Ignore decorative text.
2. Extract price as a raw number.
3. CRITICAL: If an item has multiple portion sizes (e.g., Qtr, Half, Full) with different prices, create a SEPARATE item for each size. Append the size to the name (e.g., "Fry Chicken (Qtr)" with price 150, "Fry Chicken (Half)" with price 260).`;

    const mimeType = "image/jpeg";
    const b64Img = optimizedBuffer.toString("base64");

    // --- STRATEGY A: DIRECT GEMINI REST API (via X-goog-api-key) ---
    if (geminiKey && geminiKey.length > 20) {
      try {
        console.log("Calling Gemini Vision REST API (gemini-flash-latest)...");
        const response = await withTimeout(
          fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': geminiKey
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  { inlineData: { mimeType, data: b64Img } }
                ]
              }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1
              }
            })
          }),
          6000,
          "Gemini Vision timed out"
        );

        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (candidateText) {
          const cleanJson = candidateText.replace(/^\s*```json\s*/i, '').replace(/\s*```\s*$/i, '').trim();
          const parsed = JSON.parse(cleanJson);

          for (const cat of parsed.categories || []) {
            const items = (cat.items || []).map((item: any) => ({
              name: item.name,
              price: Number(item.price || 0),
              isVeg: item.isVeg ?? true,
              confidence: Number(item.confidence || 0.95),
              needsReview: (item.confidence || 1.0) < 0.85
            }));
            if (items.length > 0) {
              extractedCategories.push({ categoryName: (cat.categoryName || "General").trim(), items });
            }
          }
        }
      } catch (e: any) {
        console.warn("Gemini REST Vision failed:", e.message);
      }
    }

    // --- STRATEGY B: OPENROUTER VISION FALLBACK ---
    if (extractedCategories.length === 0 && openRouterKey && openRouterKey.length > 20) {
      try {
        console.log("Calling OpenRouter Free Vision API...");
        const response = await withTimeout(
          fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'openrouter/free',
              messages: [{
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  { type: 'image_url', image_url: { url: `data:${mimeType};base64,${b64Img}` } }
                ]
              }]
            })
          }),
          15000,
          "OpenRouter timed out"
        );

        const data = await response.json();
        
        if (data.choices && data.choices[0]?.message?.content) {
          let text = data.choices[0].message.content.replace(/^\s*```json\s*/i, '').replace(/\s*```\s*$/i, '');
          const parsed = JSON.parse(text);
          for (const cat of parsed.categories || []) {
            const items = (cat.items || []).map((item: any) => ({
              name: item.name,
              price: Number(item.price || 0),
              isVeg: item.isVeg ?? true,
              confidence: Number(item.confidence || 0.9),
              needsReview: (item.confidence || 1.0) < 0.85
            }));
            if (items.length > 0) {
              extractedCategories.push({ categoryName: (cat.categoryName || "General").trim(), items });
            }
          }
        }
      } catch (e: any) {
        console.warn("OpenRouter Vision failed:", e.message);
      }
    }

    // --- STRATEGY B: LOCAL OCR via Child Process ---
    if (extractedCategories.length === 0) {
      console.log("Running local OCR via child process...");
      try {
        const tmpDir = path.join(process.cwd(), ".tmp");
        try { mkdirSync(tmpDir, { recursive: true }); } catch (_) {}

        const id = randomUUID();
        const imgPath = path.join(tmpDir, `menu-${id}.jpg`);
        const outPath = path.join(tmpDir, `result-${id}.json`);
        writeFileSync(imgPath, optimizedBuffer);

        extractedCategories = await withTimeout(
          runOcrChildProcess(imgPath, outPath),
          15000,
          "Local OCR timed out"
        );
      } catch (e: any) {
        console.warn("Local OCR child process failed:", e.message);
      }
    }

    // --- RESULT ---
    if (extractedCategories.length > 0) {
      return NextResponse.json({
        message: "Extraction successful",
        data: { categories: extractedCategories }
      });
    }

    return NextResponse.json(
      { error: "Could not read menu text from this photo. Please upload a clearer, well-lit photo of your menu." },
      { status: 422 }
    );

  } catch (error: any) {
    console.error("Menu Import Error:", error);
    return NextResponse.json({ error: "Failed to process menu image" }, { status: 500 });
  }
}
