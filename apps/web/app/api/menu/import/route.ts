import { NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
            description: "The name of the category (e.g. Starters, Main Course). If no clear category is present, group them logically."
          },
          items: {
            type: Type.ARRAY,
            description: "Menu items in this category",
            items: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: "Name of the menu item"
                },
                price: {
                  type: Type.NUMBER,
                  description: "Price of the item as an integer (in local currency). Example: 150. Do not include currency symbols."
                },
                isVeg: {
                  type: Type.BOOLEAN,
                  description: "True if the item is explicitly marked as vegetarian (veg), False if non-veg, Null if unknown or not mentioned.",
                  nullable: true
                },
                confidence: {
                  type: Type.NUMBER,
                  description: "Confidence score of this extraction between 0.0 and 1.0. If the text was blurry or ambiguous, score it lower."
                }
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

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ message: "No image provided" }, { status: 400 });
    }

    const buffer = await image.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    const prompt = `You are a data extraction assistant. I am providing an image of a restaurant menu.
Please extract all menu categories, items, and prices into the exact JSON schema provided.

Rules:
1. Ignore phone numbers, addresses, GST numbers, offers, and decorative text.
2. Ensure you handle Hindi, English, or mixed text gracefully. If an item name is in Hindi script, extract it as is or transliterate to English if it's mixed with English seamlessly.
3. Determine if an item is Veg or Non-Veg based on text or standard icons (green dot for Veg, red/brown for Non-Veg).
4. Extract the price as a raw number. If there are multiple sizes (e.g. Half/Full), pick the standard/full price, or create separate items like "ItemName - Half".
5. Keep Category names clean and standard (e.g. Starters, Main Course, Breads, Beverages).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Image,
                mimeType: image.type,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: menuSchema,
        temperature: 0.1, // Low temperature for deterministic extraction
      },
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    const extractedData = JSON.parse(response.text);

    return NextResponse.json({
      message: "Extraction successful",
      data: extractedData
    });

  } catch (error: any) {
    console.error("AI Menu Import Error:", error);

    return NextResponse.json(
      { message: "Failed to extract menu", error: error.message },
      { status: 500 }
    );
  }
}
