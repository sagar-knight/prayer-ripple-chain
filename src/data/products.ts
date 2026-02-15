export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Apparel" | "Journals" | "Stickers" | "Wall Art" | "Digital Downloads";
  image: string;
  variants?: { label: string; options: string[] }[];
}

export const products: Product[] = [
  {
    id: "1",
    name: "Pray It Forward Tee",
    description: "Soft cotton tee with the PrayerForward logo. Wear your faith daily.",
    price: 28,
    category: "Apparel",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    variants: [{ label: "Size", options: ["S", "M", "L", "XL"] }],
  },
  {
    id: "2",
    name: "Ripple Effect Hoodie",
    description: "Cozy hoodie featuring the ripple wave design. Stay warm, spread prayer.",
    price: 45,
    category: "Apparel",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
    variants: [
      { label: "Size", options: ["S", "M", "L", "XL"] },
      { label: "Color", options: ["Navy", "Gray", "Forest Green"] },
    ],
  },
  {
    id: "3",
    name: "Prayer Journal — Daily Reflection",
    description: "Guided prayer journal with daily prompts, scripture spaces, and gratitude pages.",
    price: 18,
    category: "Journals",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop",
  },
  {
    id: "4",
    name: "Prayer Chain Journal",
    description: "Track your prayer chains, answered prayers, and spiritual growth journey.",
    price: 16,
    category: "Journals",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop",
  },
  {
    id: "5",
    name: "Faith Sticker Pack (12 pcs)",
    description: "Waterproof vinyl stickers — verses, crosses, and PrayerForward designs.",
    price: 8,
    category: "Stickers",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop",
  },
  {
    id: "6",
    name: "Pray It Forward Sticker",
    description: "Single large vinyl sticker with the Pray It Forward logo. Perfect for laptops.",
    price: 4,
    category: "Stickers",
    image: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=400&h=400&fit=crop",
  },
  {
    id: "7",
    name: "Be Still & Know — Wall Print",
    description: "Minimalist canvas wall art. Psalm 46:10 in elegant calligraphy.",
    price: 35,
    category: "Wall Art",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop",
  },
  {
    id: "8",
    name: "Ripple Map Poster",
    description: "Beautiful watercolor poster showing prayer ripples across a world map.",
    price: 22,
    category: "Wall Art",
    image: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&h=400&fit=crop",
  },
  {
    id: "9",
    name: "30-Day Prayer Challenge (PDF)",
    description: "Downloadable 30-day guided prayer challenge with daily scripture and prompts.",
    price: 5,
    category: "Digital Downloads",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=400&fit=crop",
  },
  {
    id: "10",
    name: "Prayer Warrior Phone Wallpapers",
    description: "Set of 10 high-res phone wallpapers with scripture and peaceful designs.",
    price: 3,
    category: "Digital Downloads",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    id: "11",
    name: "One Prayer Cap",
    description: "Embroidered cotton cap with 'One Prayer' on the front. Adjustable strap.",
    price: 24,
    category: "Apparel",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=400&fit=crop",
    variants: [{ label: "Color", options: ["Black", "Tan", "White"] }],
  },
  {
    id: "12",
    name: "Scripture Card Set (20 pcs)",
    description: "Pocket-sized scripture cards for encouragement. Share them with friends.",
    price: 10,
    category: "Stickers",
    image: "https://images.unsplash.com/photo-1473186505569-9c61870c11f9?w=400&h=400&fit=crop",
  },
];
