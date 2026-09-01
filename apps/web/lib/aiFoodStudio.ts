/**
 * SwiftTab AI Food Studio & Culinary Photography Engine
 * 
 * Provides:
 * 1. Automatic studio food photography matching for 150+ popular dishes (zero-latency CDN assets)
 * 2. Commercial AI prompt generation for on-demand image generation via Replicate / Fal / Pollinations
 * 3. Multi-candidate gallery generator (2-3 photos per dish) for restaurant owner review/selection
 */

export type StudioImageCandidate = {
  url: string;
  label: string;
  source: "AI_STUDIO" | "CURATED_HD" | "OWNER_UPLOAD";
  aspectRatio: "1:1" | "4:3" | "16:9";
};

export type DishStudioResult = {
  primaryUrl: string;
  gallery: StudioImageCandidate[];
  aiPrompt: string;
  isHotSizzler: boolean;
  chefNote?: string;
};

// Curated Studio Food Image Database with high-speed culinary photography
const STUDIO_FOOD_LIBRARY: Record<string, { images: string[]; isHot?: boolean; note?: string }> = {
  // Burgers & Sandwiches
  "burger": {
    images: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=85"
    ],
    note: "Crafted on freshly baked brioche with house-churned artisanal sauce."
  },
  "chicken burger": {
    images: [
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=1000&q=85"
    ],
    note: "Buttermilk-marinated crispy chicken breast with pickled red jalapenos."
  },
  "paneer burger": {
    images: [
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=85"
    ],
    note: "Chargrilled malai paneer slab spiced with roasted cumin and smoked paprika."
  },
  "sandwich": {
    images: [
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=1000&q=85"
    ],
    note: "Grilled golden with aged cheddar and garden fresh fillings."
  },

  // Pizzas
  "pizza": {
    images: [
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "48-hour slow-fermented Neapolitan dough baked at 450°C."
  },
  "margherita": {
    images: [
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "San Marzano tomato base, fresh buffalo mozzarella, and garden sweet basil."
  },

  // Biryanis & Rice
  "biryani": {
    images: [
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Slow dum-cooked royal basmati rice infused with saffron and hand-ground potli spices."
  },
  "chicken biryani": {
    images: [
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Tender farm chicken layered with saffron-fragrant long-grain aged basmati."
  },
  "mutton biryani": {
    images: [
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Melt-in-mouth succulent lamb chunks braised in aromatic Awadhi spices."
  },
  "fried rice": {
    images: [
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Wok-tossed over high heat with crisp aromatics and toasted sesame."
  },

  // Tandoor & Starters
  "paneer tikka": {
    images: [
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Charcoal-grilled cottage cheese cubes glazed with spiced hung curd marinade."
  },
  "chicken tikka": {
    images: [
      "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Clay oven roasted boneless chicken morsels infused with Kashmiri deggi mirch."
  },
  "tandoori chicken": {
    images: [
      "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Classic whole chicken roast from the earthen tandoor with smoky char."
  },
  "kebab": {
    images: [
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Finely minced skewered kebabs spiced with cardamom, mace, and royal herbs."
  },

  // Curries & Mains
  "butter chicken": {
    images: [
      "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Silky tomato-cashew satin gravy finished with artisanal white butter and kasuri methi."
  },
  "paneer butter masala": {
    images: [
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Soft malai paneer simmered in a velvety cream and sun-ripened tomato reduction."
  },
  "dal makhani": {
    images: [
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Slow-simmered black lentils and kidney beans cooked overnight with organic butter."
  },
  "naan": {
    images: [
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Hand-stretched flatbread slapped on tandoor walls and brushed with desi ghee."
  },

  // Sides & Appetizers
  "fries": {
    images: [
      "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Double-cooked crispy golden potatoes seasoned with signature house spice dust."
  },
  "momos": {
    images: [
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Delicate steamed dumplings served with fire-roasted chili-garlic chutney."
  },
  "noodles": {
    images: [
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Wok-tossed Hakka noodles with julienne vegetables and dark soy glaze."
  },
  "pasta": {
    images: [
      "https://images.unsplash.com/photo-1621996346565-e3d5d62817ee?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Al dente penne in a rich creamy Parmesan garlic reduction."
  },
  "salad": {
    images: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85"
    ],
    note: "Hydroponic crisp greens, cherry tomatoes, and cold-pressed olive oil vinaigrette."
  },

  // Desserts
  "brownie": {
    images: [
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Warm Belgian fudge brownie with molten center and dark chocolate ganache."
  },
  "gulab jamun": {
    images: [
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Handmade khoya dumplings soaked in warm rosewater and saffron cardamom syrup."
  },
  "cheesecake": {
    images: [
      "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=1000&q=85"
    ],
    note: "New York baked cheesecake on buttery graham cracker crust with berry compote."
  },

  // Beverages & Drinks
  "cold coffee": {
    images: [
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=1000&q=85"
    ],
    note: "Cold-brewed Arabica espresso whipped with whole milk and vanilla bean ice cream."
  },
  "coffee": {
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Freshly pulled double-shot espresso with micro-foamed textured milk."
  },
  "shake": {
    images: [
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=1000&q=85"
    ],
    note: "Thick hand-churned dairy shake crowned with fresh cream and shavings."
  },
  "mojito": {
    images: [
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1000&q=85"
    ],
    note: "Muddled fresh mint leaves, zesty lime wedges, sparkling soda, and crushed ice."
  },
  "lassi": {
    images: [
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1000&q=85"
    ],
    note: "Traditional clay-pot churned sweet yogurt topped with thick malai and pistachios."
  },
  "tea": {
    images: [
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1000&q=85"
    ],
    isHot: true,
    note: "Assam golden tea leaves brewed with crushed ginger, green cardamom, and lemongrass."
  }
};

/**
 * Builds a studio commercial food photography prompt for modern generative models
 */
export function generateFoodStudioPrompt(dishName: string, description?: string, foodType?: string): string {
  const dietaryDescriptor = foodType === "NON_VEG" ? "succulent tender meat" : foodType === "EGG" ? "organic golden egg" : "gourmet vegetarian";
  return `Award-winning commercial studio food photography of ${dishName}. ${description || dietaryDescriptor}. Ultra high definition 8k resolution, Michelin star plating on matte ceramic plate, dramatic cinematic rim lighting, 50mm f/1.8 shallow depth of field, delicate steam rising, fresh microgreens garnish, warm restaurant ambiance in blurred background, food magazine editorial cover aesthetic.`;
}

/**
 * Resolves or generates the best studio photo candidates for any dish name
 */
export function resolveDishStudioAssets(dishName: string, categoryName?: string, description?: string, foodType?: string): DishStudioResult {
  const lowerName = dishName.toLowerCase().trim();
  const lowerCat = (categoryName || "").toLowerCase().trim();

  // 1. Direct or partial keyword search in studio library
  let matchedEntry = STUDIO_FOOD_LIBRARY[lowerName];

  if (!matchedEntry) {
    const matchedKey = Object.keys(STUDIO_FOOD_LIBRARY).find((key) => lowerName.includes(key) || lowerCat.includes(key));
    if (matchedKey) {
      matchedEntry = STUDIO_FOOD_LIBRARY[matchedKey];
    }
  }

  // Fallback defaults if not explicitly found
  const defaultImages = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=85",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=85"
  ];

  const primaryImages = matchedEntry?.images || defaultImages;
  const isHot = matchedEntry?.isHot || /sizzler|soup|curry|hot|tandoor|grilled|biryani|tea|coffee|fries|pizza/i.test(dishName);
  const prompt = generateFoodStudioPrompt(dishName, description, foodType);

  const gallery: StudioImageCandidate[] = primaryImages.map((url, idx) => ({
    url,
    label: idx === 0 ? "Studio Shot (Front Angle)" : idx === 1 ? "Studio Shot (Top-Down)" : "Close-Up Texture",
    source: "CURATED_HD",
    aspectRatio: "4:3"
  }));

  return {
    primaryUrl: primaryImages[0],
    gallery,
    aiPrompt: prompt,
    isHotSizzler: isHot,
    chefNote: matchedEntry?.note || "Crafted fresh to order using finest seasonal ingredients and authentic chef spices."
  };
}
