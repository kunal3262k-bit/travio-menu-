import { describe, it, expect } from "vitest";
import { estimateDishNutrition, calculateTableNutritionTotals } from "@/lib/macroEstimator";
import { resolveDishStudioAssets, generateFoodStudioPrompt } from "@/lib/aiFoodStudio";
import { parseMenuTextToCategories } from "@/lib/clientMenuOcr";

describe("AI Nutrition & Macro Intelligence Engine", () => {
  it("correctly estimates calories, protein, and dietary flags for High-Protein Chicken Biryani", () => {
    const nutrition = estimateDishNutrition("Chicken Biryani", "Biryani & Rice", "Fragrant basmati rice", "NON_VEG");
    expect(nutrition.calories).toBeGreaterThan(400);
    expect(nutrition.proteinGrams).toBeGreaterThanOrEqual(25);
    expect(nutrition.dietaryFlags).toContain("HIGH_PROTEIN");
    expect(nutrition.dietaryFlags).toContain("GLUTEN_FREE");
  });

  it("correctly calculates Vegan and Gluten-Free flags for Dal Tadka", () => {
    const nutrition = estimateDishNutrition("Dal Tadka", "Main Course", "Yellow lentils with cumin", "VEG");
    expect(nutrition.dietaryFlags).toContain("VEGAN");
    expect(nutrition.dietaryFlags).toContain("GLUTEN_FREE");
    expect(nutrition.dietaryFlags).toContain("LOW_CALORIE");
  });

  it("calculates cumulative table nutrition totals across multiple items", () => {
    const cart = [
      {
        item: { calories: 520, proteinGrams: 34, fatGrams: 22, carbsGrams: 46 },
        quantity: 2
      },
      {
        item: { calories: 330, proteinGrams: 4, fatGrams: 15, carbsGrams: 44 },
        quantity: 1
      }
    ];

    const totals = calculateTableNutritionTotals(cart);
    expect(totals.totalCalories).toBe(520 * 2 + 330);
    expect(totals.totalProtein).toBe(34 * 2 + 4);
    expect(totals.isHighProteinOrder).toBe(true);
  });
});

describe("AI Food Studio & Culinary Photography Engine", () => {
  it("resolves studio photo assets and 3 candidate gallery for known dishes", () => {
    const studio = resolveDishStudioAssets("Paneer Tikka", "Starters");
    expect(studio.primaryUrl).toContain("unsplash.com");
    expect(studio.gallery.length).toBeGreaterThanOrEqual(2);
    expect(studio.isHotSizzler).toBe(true);
    expect(studio.chefNote).toBeTruthy();
  });

  it("generates a commercial photography prompt for any custom dish", () => {
    const prompt = generateFoodStudioPrompt("Truffle Mushroom Risotto", "Arborio rice with black truffle oil", "VEG");
    expect(prompt).toContain("Truffle Mushroom Risotto");
    expect(prompt).toContain("commercial studio food photography");
    expect(prompt).toContain("8k");
  });
});

describe("Client OCR Auto-Enrichment with Macros & Studio Photos", () => {
  it("extracts dishes from raw menu text and automatically enriches them with photos and macros", () => {
    const sampleOcrText = `
STARTERS
Paneer Tikka 280
Chicken Tikka 340

MAINS
Butter Chicken 420
Butter Naan 60
    `;

    const categories = parseMenuTextToCategories(sampleOcrText);
    expect(categories.length).toBeGreaterThan(0);

    const allItems = categories.flatMap(c => c.items);
    expect(allItems.length).toBe(4);

    const paneerTikka = allItems.find(i => i.name === "Paneer Tikka");
    expect(paneerTikka).toBeDefined();
    expect(paneerTikka?.imageUrl).toBeTruthy();
    expect(paneerTikka?.calories).toBeGreaterThan(0);
    expect(paneerTikka?.proteinGrams).toBeGreaterThan(0);
  });
});
