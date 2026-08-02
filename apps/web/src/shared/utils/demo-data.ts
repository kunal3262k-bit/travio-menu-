export const demoRestaurant = {
  name: "ABC Cafe",
  slug: "abc-cafe",
  logoUrl: "",
  tableNumber: 12,
  categories: [
    {
      id: "burgers",
      name: "Burgers",
      items: [
        {
          id: "paneer-burger",
          name: "Paneer Burger",
          description: "Tandoori paneer, mint mayo, onion, toasted bun.",
          imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
          pricePaise: 18900,
          foodType: "VEG",
          spicyLevel: 2,
          available: true
        },
        {
          id: "chicken-burger",
          name: "Chicken Burger",
          description: "Crispy chicken, house sauce, lettuce, pickled chilli.",
          imageUrl: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=700&q=80",
          pricePaise: 22900,
          foodType: "NON_VEG",
          spicyLevel: 1,
          available: true
        }
      ]
    },
    {
      id: "sides",
      name: "Sides",
      items: [
        {
          id: "fries",
          name: "Masala Fries",
          description: "Crisp fries tossed with chaat masala.",
          imageUrl: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=700&q=80",
          pricePaise: 11900,
          foodType: "VEG",
          spicyLevel: 1,
          available: true
        },
        {
          id: "brownie",
          name: "Chocolate Brownie",
          description: "Warm brownie with dark chocolate sauce.",
          imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80",
          pricePaise: 14900,
          foodType: "VEG",
          spicyLevel: 0,
          available: true
        }
      ]
    },
    {
      id: "drinks",
      name: "Drinks",
      items: [
        {
          id: "cold-coffee",
          name: "Cold Coffee",
          description: "Cafe blend, milk, ice, light chocolate.",
          imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80",
          pricePaise: 13900,
          foodType: "VEG",
          spicyLevel: 0,
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
      { name: "Paneer Burger", quantity: 2, instructions: "Less spicy" },
      { name: "Masala Fries", quantity: 1, instructions: "Extra peri peri" }
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
