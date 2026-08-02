import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { restaurantName, rating } = await req.json();

    if (!restaurantName || !rating || rating < 4) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `
      You are an assistant helping a customer write a Google Review for a restaurant named "${restaurantName}".
      The customer rated their experience ${rating} out of 5 stars.
      
      Provide exactly 3 short, distinct review suggestions (1-2 sentences each). 
      Consider mentioning Food, Service, Ambience, or Value across the different suggestions.
      Do not include any numbering, quotes, or markdown. Just output a valid JSON array of 3 strings.
      
      Example:
      [
        "Absolutely loved the food and the staff was so friendly! Highly recommend.",
        "Great atmosphere and excellent value for money. The dishes were served hot and fresh.",
        "One of the best dining experiences I've had recently. Perfect for a weekend dinner."
      ]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    let suggestions = [];
    try {
      suggestions = JSON.parse(text || "[]");
    } catch (e) {
      // Fallback if parsing fails
      suggestions = [
        `Great experience at ${restaurantName}! Highly recommended.`,
        `Loved the food and service at ${restaurantName}.`,
        `Excellent dining experience. 5 stars!`
      ];
    }

    return NextResponse.json({ suggestions });

  } catch (error: any) {
    console.error("AI Review Generation Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
