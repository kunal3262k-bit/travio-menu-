/**
 * SwiftTab AI Nutrition & Macro Intelligence Engine
 * 
 * Automatically calculates and infers:
 * - Calories (kcal)
 * - Protein (g), Net Carbs (g), Healthy Fats (g), Fiber (g)
 * - Allergen badges (Gluten, Dairy, Peanuts, Tree Nuts, Soy, Eggs, Seafood)
 * - Dietary classification flags (HIGH_PROTEIN, LOW_CALORIE, KETO, VEGAN, GLUTEN_FREE)
 */

export type MacroProfile = {
  calories: number;
  proteinGrams: number;
  fatGrams: number;
  carbsGrams: number;
  fiberGrams: number;
  allergens: string[];
  dietaryFlags: ("HIGH_PROTEIN" | "LOW_CALORIE" | "KETO" | "VEGAN" | "GLUTEN_FREE")[];
  glycemicIndex: "LOW" | "MEDIUM" | "HIGH";
  confidenceScore: number;
};

type NutritionTemplate = {
  cal: number;
  p: number;
  f: number;
  c: number;
  fiber: number;
  allergens: string[];
  isVegan?: boolean;
  isGlutenFree?: boolean;
};

// Nutritional reference standards (per serving) for common dishes
const NUTRITION_DATABASE: Record<string, NutritionTemplate> = {
  // Burgers & Sandwiches
  "paneer burger": { cal: 480, p: 22, f: 24, c: 45, fiber: 4, allergens: ["DAIRY", "GLUTEN"] },
  "chicken burger": { cal: 520, p: 34, f: 22, c: 46, fiber: 3, allergens: ["GLUTEN"] },
  "crispy chicken burger": { cal: 560, p: 32, f: 26, c: 50, fiber: 3, allergens: ["GLUTEN"] },
  "veg burger": { cal: 410, p: 12, f: 16, c: 54, fiber: 5, allergens: ["GLUTEN"] },
  "sandwich": { cal: 360, p: 14, f: 16, c: 42, fiber: 3, allergens: ["DAIRY", "GLUTEN"] },

  // Pizzas
  "margherita": { cal: 680, p: 28, f: 24, c: 88, fiber: 4, allergens: ["DAIRY", "GLUTEN"] },
  "pepperoni pizza": { cal: 790, p: 36, f: 34, c: 84, fiber: 4, allergens: ["DAIRY", "GLUTEN"] },
  "paneer pizza": { cal: 720, p: 30, f: 28, c: 86, fiber: 4, allergens: ["DAIRY", "GLUTEN"] },
  "chicken pizza": { cal: 740, p: 38, f: 26, c: 85, fiber: 4, allergens: ["DAIRY", "GLUTEN"] },

  // Biryani & Rice
  "chicken biryani": { cal: 580, p: 38, f: 18, c: 68, fiber: 4, allergens: ["DAIRY"], isGlutenFree: true },
  "mutton biryani": { cal: 690, p: 42, f: 28, c: 66, fiber: 4, allergens: ["DAIRY"], isGlutenFree: true },
  "veg biryani": { cal: 440, p: 14, f: 14, c: 65, fiber: 6, allergens: ["DAIRY"], isGlutenFree: true },
  "fried rice": { cal: 420, p: 11, f: 12, c: 68, fiber: 3, allergens: ["SOY", "GLUTEN"] },
  "egg fried rice": { cal: 480, p: 18, f: 16, c: 66, fiber: 3, allergens: ["EGGS", "SOY", "GLUTEN"] },
  "chicken fried rice": { cal: 510, p: 29, f: 15, c: 64, fiber: 3, allergens: ["SOY", "GLUTEN"] },
  "steamed rice": { cal: 210, p: 4, f: 1, c: 46, fiber: 1, allergens: [], isVegan: true, isGlutenFree: true },
  "jeera rice": { cal: 260, p: 5, f: 6, c: 47, fiber: 1, allergens: ["DAIRY"], isGlutenFree: true },

  // Tandoor & Kebabs
  "paneer tikka": { cal: 340, p: 26, f: 22, c: 10, fiber: 2, allergens: ["DAIRY"], isGlutenFree: true },
  "chicken tikka": { cal: 290, p: 41, f: 11, c: 6, fiber: 1, allergens: ["DAIRY"], isGlutenFree: true },
  "tandoori chicken": { cal: 320, p: 46, f: 13, c: 4, fiber: 1, allergens: ["DAIRY"], isGlutenFree: true },
  "seekh kebab": { cal: 380, p: 36, f: 22, c: 8, fiber: 2, allergens: ["DAIRY"], isGlutenFree: true },
  "fish tikka": { cal: 240, p: 35, f: 8, c: 5, fiber: 1, allergens: ["SEAFOOD", "DAIRY"], isGlutenFree: true },

  // Curries & Gravies
  "butter chicken": { cal: 540, p: 36, f: 38, c: 14, fiber: 2, allergens: ["DAIRY", "TREE_NUTS"], isGlutenFree: true },
  "chicken curry": { cal: 410, p: 38, f: 22, c: 12, fiber: 2, allergens: [], isGlutenFree: true },
  "paneer butter masala": { cal: 510, p: 24, f: 40, c: 16, fiber: 3, allergens: ["DAIRY", "TREE_NUTS"], isGlutenFree: true },
  "palak paneer": { cal: 390, p: 22, f: 28, c: 12, fiber: 5, allergens: ["DAIRY"], isGlutenFree: true },
  "kadai paneer": { cal: 420, p: 23, f: 30, c: 15, fiber: 4, allergens: ["DAIRY"], isGlutenFree: true },
  "dal makhani": { cal: 420, p: 18, f: 24, c: 38, fiber: 9, allergens: ["DAIRY"], isGlutenFree: true },
  "dal tadka": { cal: 240, p: 14, f: 9, c: 28, fiber: 7, allergens: [], isVegan: true, isGlutenFree: true },
  "chole": { cal: 330, p: 15, f: 12, c: 42, fiber: 10, allergens: [], isVegan: true, isGlutenFree: true },

  // Breads
  "butter naan": { cal: 290, p: 7, f: 10, c: 44, fiber: 2, allergens: ["DAIRY", "GLUTEN"] },
  "garlic naan": { cal: 310, p: 8, f: 11, c: 46, fiber: 2, allergens: ["DAIRY", "GLUTEN"] },
  "tandoori roti": { cal: 130, p: 4, f: 1, c: 27, fiber: 3, allergens: ["GLUTEN"], isVegan: true },
  "butter roti": { cal: 170, p: 4, f: 5, c: 27, fiber: 3, allergens: ["DAIRY", "GLUTEN"] },
  "laccha paratha": { cal: 320, p: 6, f: 15, c: 41, fiber: 2, allergens: ["DAIRY", "GLUTEN"] },

  // Sides & Fast Food
  "fries": { cal: 320, p: 4, f: 15, c: 42, fiber: 4, allergens: [], isVegan: true, isGlutenFree: true },
  "masala fries": { cal: 330, p: 4, f: 15, c: 44, fiber: 4, allergens: [], isVegan: true, isGlutenFree: true },
  "peri peri fries": { cal: 340, p: 4, f: 16, c: 45, fiber: 4, allergens: [], isVegan: true, isGlutenFree: true },
  "momos": { cal: 280, p: 14, f: 8, c: 38, fiber: 2, allergens: ["GLUTEN", "SOY"] },
  "veg momos": { cal: 220, p: 7, f: 5, c: 37, fiber: 3, allergens: ["GLUTEN", "SOY"], isVegan: true },
  "chicken momos": { cal: 310, p: 21, f: 10, c: 34, fiber: 2, allergens: ["GLUTEN", "SOY"] },
  "pasta alfredo": { cal: 620, p: 20, f: 36, c: 56, fiber: 3, allergens: ["DAIRY", "GLUTEN"] },
  "pasta arrabbiata": { cal: 410, p: 13, f: 11, c: 64, fiber: 5, allergens: ["GLUTEN"], isVegan: true },
  "caesar salad": { cal: 290, p: 12, f: 22, c: 11, fiber: 3, allergens: ["DAIRY", "EGGS", "GLUTEN"] },
  "grilled chicken salad": { cal: 310, p: 36, f: 12, c: 8, fiber: 4, allergens: ["DAIRY"], isGlutenFree: true },

  // Desserts
  "brownie": { cal: 390, p: 5, f: 21, c: 46, fiber: 2, allergens: ["DAIRY", "EGGS", "GLUTEN"] },
  "chocolate brownie": { cal: 410, p: 6, f: 23, c: 48, fiber: 2, allergens: ["DAIRY", "EGGS", "GLUTEN"] },
  "gulab jamun": { cal: 290, p: 5, f: 11, c: 44, fiber: 1, allergens: ["DAIRY", "GLUTEN"] },
  "cheesecake": { cal: 430, p: 8, f: 28, c: 36, fiber: 1, allergens: ["DAIRY", "EGGS", "GLUTEN"] },
  "ice cream": { cal: 210, p: 4, f: 11, c: 24, fiber: 0, allergens: ["DAIRY"], isGlutenFree: true },

  // Drinks & Beverages
  "cold coffee": { cal: 240, p: 6, f: 9, c: 34, fiber: 1, allergens: ["DAIRY"], isGlutenFree: true },
  "espresso": { cal: 5, p: 0, f: 0, c: 1, fiber: 0, allergens: [], isVegan: true, isGlutenFree: true },
  "cappuccino": { cal: 120, p: 6, f: 5, c: 12, fiber: 0, allergens: ["DAIRY"], isGlutenFree: true },
  "masala chai": { cal: 90, p: 3, f: 3, c: 13, fiber: 0, allergens: ["DAIRY"], isGlutenFree: true },
  "sweet lassi": { cal: 260, p: 9, f: 10, c: 34, fiber: 0, allergens: ["DAIRY"], isGlutenFree: true },
  "salted lassi": { cal: 170, p: 9, f: 8, c: 14, fiber: 0, allergens: ["DAIRY"], isGlutenFree: true },
  "fresh lime soda": { cal: 60, p: 0, f: 0, c: 15, fiber: 0, allergens: [], isVegan: true, isGlutenFree: true },
  "virgin mojito": { cal: 110, p: 0, f: 0, c: 27, fiber: 1, allergens: [], isVegan: true, isGlutenFree: true }
};

/**
 * Estimates macronutrients, allergens, and dietary flags for any menu item
 */
export function estimateDishNutrition(
  dishName: string,
  categoryName?: string,
  description?: string,
  foodType?: string
): MacroProfile {
  const lowerName = dishName.toLowerCase().trim();
  const lowerCat = (categoryName || "").toLowerCase().trim();
  const lowerDesc = (description || "").toLowerCase().trim();

  // 1. Direct or fuzzy lookup in database
  let template: NutritionTemplate | undefined = NUTRITION_DATABASE[lowerName];

  if (!template) {
    const matchedKey = Object.keys(NUTRITION_DATABASE).find((key) => lowerName.includes(key));
    if (matchedKey) {
      template = NUTRITION_DATABASE[matchedKey];
    }
  }

  // 2. Heuristic fallback based on category, foodType, and keywords
  if (!template) {
    const isNonVeg = foodType === "NON_VEG" || /chicken|mutton|fish|meat|prawn|egg|wings|keema/i.test(dishName + " " + lowerDesc);
    const isBeverage = /drink|beverage|coffee|tea|shake|soda|juice|mojito/i.test(lowerCat + " " + lowerName);
    const isDessert = /dessert|sweet|cake|ice cream|kheer|halwa/i.test(lowerCat + " " + lowerName);
    const isBread = /roti|naan|paratha|kulcha|bread/i.test(lowerCat + " " + lowerName);

    if (isBeverage) {
      template = { cal: 150, p: 2, f: 3, c: 28, fiber: 0, allergens: lowerName.includes("milk") || lowerName.includes("coffee") ? ["DAIRY"] : [] };
    } else if (isDessert) {
      template = { cal: 350, p: 5, f: 16, c: 46, fiber: 1, allergens: ["DAIRY", "GLUTEN"] };
    } else if (isBread) {
      template = { cal: 220, p: 5, f: 6, c: 38, fiber: 2, allergens: ["GLUTEN"] };
    } else if (isNonVeg) {
      template = { cal: 460, p: 35, f: 20, c: 25, fiber: 2, allergens: [] };
    } else {
      // General vegetarian main
      template = { cal: 380, p: 16, f: 18, c: 38, fiber: 4, allergens: ["DAIRY"] };
    }
  }

  // Calculate dietary flags
  const dietaryFlags: ("HIGH_PROTEIN" | "LOW_CALORIE" | "KETO" | "VEGAN" | "GLUTEN_FREE")[] = [];

  if (template.p >= 25) dietaryFlags.push("HIGH_PROTEIN");
  if (template.cal <= 400) dietaryFlags.push("LOW_CALORIE");
  if (template.c <= 15 && template.f >= 18) dietaryFlags.push("KETO");
  
  const isExplicitNonVeg = foodType === "NON_VEG" || /chicken|mutton|fish|meat|prawn|egg/i.test(dishName);
  const hasDairy = template.allergens.includes("DAIRY") || /paneer|butter|cream|cheese|curd|milk/i.test(dishName);
  
  if (!isExplicitNonVeg && !hasDairy && !template.allergens.includes("EGGS")) {
    dietaryFlags.push("VEGAN");
  }

  if (template.isGlutenFree || (!template.allergens.includes("GLUTEN") && !/naan|roti|paratha|bun|burger|pasta|pizza|noodle|flour/i.test(dishName))) {
    dietaryFlags.push("GLUTEN_FREE");
  }

  const glycemicIndex: "LOW" | "MEDIUM" | "HIGH" = template.c < 20 ? "LOW" : template.c < 55 ? "MEDIUM" : "HIGH";

  return {
    calories: template.cal,
    proteinGrams: template.p,
    fatGrams: template.f,
    carbsGrams: template.c,
    fiberGrams: template.fiber,
    allergens: Array.from(new Set(template.allergens)),
    dietaryFlags,
    glycemicIndex,
    confidenceScore: 92
  };
}

/**
 * Calculates cumulative table order macros and nutrition totals
 */
export function calculateTableNutritionTotals(cartLines: Array<{ item: { calories?: number | null; proteinGrams?: number | null; fatGrams?: number | null; carbsGrams?: number | null; fiberGrams?: number | null }; quantity: number }>) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalCarbs = 0;
  let totalFiber = 0;

  for (const line of cartLines) {
    const qty = line.quantity || 1;
    totalCalories += (line.item.calories || 0) * qty;
    totalProtein += (line.item.proteinGrams || 0) * qty;
    totalFat += (line.item.fatGrams || 0) * qty;
    totalCarbs += (line.item.carbsGrams || 0) * qty;
    totalFiber += (line.item.fiberGrams || 0) * qty;
  }

  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFiber: Math.round(totalFiber * 10) / 10,
    isHighProteinOrder: totalProtein >= 40,
    isCalorieConscious: totalCalories > 0 && totalCalories <= 750
  };
}
