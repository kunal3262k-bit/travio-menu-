export const demoRestaurant = {
  name: "ABC Cafe",
  slug: "abc-cafe",
  logoUrl: "",
  tableNumber: 12,
  categories: [
    {
      id: "burgers",
      name: "Burgers & Sandwiches",
      items: [
        {
          id: "paneer-burger",
          name: "Paneer Burger",
          description: "Tandoori paneer, mint mayo, sliced red onion, toasted artisanal brioche.",
          imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1000&q=85",
          imageSource: "AI_STUDIO",
          pricePaise: 18900,
          foodType: "VEG",
          spicyLevel: 2,
          calories: 480,
          proteinGrams: 22,
          fatGrams: 24,
          carbsGrams: 45,
          fiberGrams: 4,
          allergens: ["DAIRY", "GLUTEN"],
          dietaryFlags: ["HIGH_PROTEIN"],
          chefNote: "Chargrilled malai paneer slab spiced with roasted cumin and smoked paprika.",
          isHotSizzler: true,
          available: true
        },
        {
          id: "chicken-burger",
          name: "Chicken Burger",
          description: "Crispy buttermilk chicken breast, house secret sauce, crisp lettuce, pickled chilli.",
          imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=1000&q=85",
          imageSource: "AI_STUDIO",
          pricePaise: 22900,
          foodType: "NON_VEG",
          spicyLevel: 1,
          calories: 520,
          proteinGrams: 34,
          fatGrams: 22,
          carbsGrams: 46,
          fiberGrams: 3,
          allergens: ["GLUTEN"],
          dietaryFlags: ["HIGH_PROTEIN"],
          chefNote: "Double-fried for maximum crunch with house-made smoked garlic aioli.",
          isHotSizzler: true,
          available: true
        }
      ]
    },
    {
      id: "sides",
      name: "Sides & Starters",
      items: [
        {
          id: "fries",
          name: "Masala Fries",
          description: "Double-crisped golden potato fries tossed with house chaat masala.",
          imageUrl: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=1000&q=85",
          imageSource: "AI_STUDIO",
          pricePaise: 11900,
          foodType: "VEG",
          spicyLevel: 1,
          calories: 330,
          proteinGrams: 4,
          fatGrams: 15,
          carbsGrams: 44,
          fiberGrams: 4,
          allergens: [],
          dietaryFlags: ["LOW_CALORIE", "VEGAN", "GLUTEN_FREE"],
          chefNote: "Cut fresh from Pahadi potatoes and fried in cold-pressed peanut oil.",
          isHotSizzler: true,
          available: true
        },
        {
          id: "brownie",
          name: "Chocolate Brownie",
          description: "Warm Belgian dark chocolate fudge brownie with molten ganache center.",
          imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=85",
          imageSource: "AI_STUDIO",
          pricePaise: 14900,
          foodType: "VEG",
          spicyLevel: 0,
          calories: 390,
          proteinGrams: 5,
          fatGrams: 21,
          carbsGrams: 46,
          fiberGrams: 2,
          allergens: ["DAIRY", "EGGS", "GLUTEN"],
          dietaryFlags: ["LOW_CALORIE"],
          chefNote: "Baked fresh daily with 70% single-origin dark cocoa.",
          isHotSizzler: true,
          available: true
        }
      ]
    },
    {
      id: "drinks",
      name: "Cold Brews & Beverages",
      items: [
        {
          id: "cold-coffee",
          name: "Cold Coffee",
          description: "16-hour slow cold-brewed Arabica espresso whipped with whole milk and vanilla bean.",
          imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1000&q=85",
          imageSource: "AI_STUDIO",
          pricePaise: 13900,
          foodType: "VEG",
          spicyLevel: 0,
          calories: 240,
          proteinGrams: 6,
          fatGrams: 9,
          carbsGrams: 34,
          fiberGrams: 1,
          allergens: ["DAIRY"],
          dietaryFlags: ["LOW_CALORIE", "GLUTEN_FREE"],
          chefNote: "Brewed with Chikmagalur single-estate coffee beans.",
          isHotSizzler: false,
          available: true
        }
      ]
    }
  ],
  upsellRules: [
    { triggerMenuItemId: "paneer-burger", recommendedMenuItemId: "fries", priority: 10, active: true },
    { triggerMenuItemId: "paneer-burger", recommendedMenuItemId: "cold-coffee", priority: 9, active: true },
    { triggerMenuItemId: "chicken-burger", recommendedMenuItemId: "fries", priority: 10, active: true },
    { triggerMenuItemId: "chicken-burger", recommendedMenuItemId: "brownie", priority: 7, active: true }
  ]
};

export const demoOrders = [
  {
    id: "ord-1042",
    orderNumber: 1042,
    table: 12,
    status: "RECEIVED",
    createdAt: "2 min ago",
    items: [
      { name: "Paneer Burger", quantity: 1, instructions: "Less spicy" },
      { name: "Masala Fries", quantity: 1, instructions: "Extra peri peri" },
      { name: "Cold Coffee", quantity: 1, instructions: "" }
    ]
  },
  {
    id: "ord-1041",
    orderNumber: 1041,
    table: 7,
    status: "PREPARING",
    createdAt: "8 min ago",
    items: [
      { name: "Chicken Burger", quantity: 1, instructions: "No onion" },
      { name: "Cold Coffee", quantity: 2, instructions: "" }
    ]
  }
];

export const demoStudio = {
  name: "Apex Luxury Auto Spa",
  slug: "apex-auto-spa",
  currency: "USD",
  baysCount: 4,
  activeWorkOrders: [
    {
      id: "wo-101",
      orderNumber: 101,
      carYear: 2024,
      carBrand: "Porsche",
      carModel: "911 GT3 RS",
      carColor: "Black Metallic",
      carLicensePlate: "GT3-APEX",
      customerName: "Julian Vance",
      customerPhone: "+1 (305) 555-0192",
      stage: "DECON_WASH",
      stageLabel: "Intake & Decon Wash",
      elapsedMin: 45,
      estimatedReadyAt: "Tomorrow, 4:00 PM",
      totalUsd: 2450,
      imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1000&q=85",
      defectPhotos: [
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"
      ],
      services: [
        { name: "Full Vehicle Decon & Clay Bar", price: 250 },
        { name: "2-Stage Paint Correction (90%+ defect removal)", price: 1200 },
        { name: "9H Graphene Ceramic Coating (5-Year)", price: 1000 }
      ],
      upsellRecommendations: [
        {
          id: "up-1",
          name: "Ceramic Wheel & Caliper Protection",
          description: "High-heat 1,200°F ceramic armor resisting brake dust and iron fallout.",
          priceUsd: 199,
          imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"
        },
        {
          id: "up-2",
          name: "Hydrophobic Glass & Windshield Coating",
          description: "Repels rain at 40+ mph with zero wiper chatter; ultra-slick optical clarity.",
          priceUsd: 149,
          imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
        }
      ]
    },
    {
      id: "wo-102",
      orderNumber: 102,
      carYear: 2024,
      carBrand: "BMW",
      carModel: "M4 Competition",
      carColor: "Isle of Man Green",
      carLicensePlate: "M4-COMP",
      customerName: "Marcus Sterling",
      customerPhone: "+1 (305) 555-0144",
      stage: "PAINT_CORRECTION",
      stageLabel: "2-Stage Paint Correction",
      elapsedMin: 180,
      totalUsd: 1850,
      progressPercent: 85,
      imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=85",
      services: [
        { name: "2-Stage Paint Correction", price: 1200 },
        { name: "Full Front PPF Clip", price: 650 }
      ]
    },
    {
      id: "wo-103",
      orderNumber: 103,
      carYear: 2023,
      carBrand: "Audi",
      carModel: "RS6 Avant",
      carColor: "Nardo Gray",
      carLicensePlate: "RS6-WGN",
      customerName: "Elena Rostova",
      customerPhone: "+1 (305) 555-0188",
      stage: "CERAMIC_PPF",
      stageLabel: "Ceramic & PPF Cleanroom",
      elapsedMin: 320,
      totalUsd: 3800,
      imageUrl: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1000&q=85",
      services: [
        { name: "Full Body Satin PPF Wrap", price: 3800 }
      ]
    },
    {
      id: "wo-104",
      orderNumber: 104,
      carYear: 2024,
      carBrand: "Mercedes-AMG",
      carModel: "GT Coupe",
      carColor: "Obsidian Black",
      carLicensePlate: "AMG-GT8",
      customerName: "David Chen",
      customerPhone: "+1 (305) 555-0167",
      stage: "IR_CURING",
      stageLabel: "IR Curing & Ready for Pickup",
      elapsedMin: 540,
      totalUsd: 2200,
      imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=85",
      services: [
        { name: "5-Year Ceramic Matrix Coat", price: 1800 },
        { name: "Interior Leather Ceramic Guard", price: 400 }
      ]
    }
  ]
};

