export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Apparel" | "Journals" | "Wall Art" | "Digital Downloads";
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
];
