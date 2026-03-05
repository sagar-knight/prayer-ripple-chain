import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GelatoProduct {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  price: number;
  currency: string;
  category: string;
  variants: { label: string; options: string[] }[];
}

export function useGelatoProducts() {
  const [products, setProducts] = useState<GelatoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Get stores from Gelato ecommerce API
      const { data: storesData, error: storesError } = await supabase.functions.invoke("gelato-proxy", {
        body: { endpoint: "/stores", method: "GET", service: "ecommerce" },
      });

      if (storesError) throw new Error(storesError.message);
      console.log("Gelato stores response:", storesData);

      // Find first store
      const stores = storesData?.stores || storesData || [];
      const storeId = Array.isArray(stores) && stores.length > 0 
        ? stores[0].id 
        : storesData?.id;

      if (!storeId) {
        console.warn("No Gelato store found. Falling back to static products.");
        setProducts([]);
        setLoading(false);
        return;
      }

      // Step 2: Get products from that store
      const { data: prodData, error: prodError } = await supabase.functions.invoke("gelato-proxy", {
        body: { 
          endpoint: `/stores/${storeId}/products`, 
          method: "GET", 
          service: "ecommerce" 
        },
      });

      if (prodError) throw new Error(prodError.message);
      console.log("Gelato products response:", prodData);

      const rawProducts = prodData?.products || prodData || [];

      if (!Array.isArray(rawProducts)) {
        console.warn("Unexpected Gelato response:", rawProducts);
        setProducts([]);
        return;
      }

      const mapped: GelatoProduct[] = rawProducts.map((p: any) => {
        const firstVariant = p.variants?.[0];
        const price = firstVariant?.prices?.[0]?.amount ?? p.price ?? 0;
        const currency = firstVariant?.prices?.[0]?.currency ?? p.currency ?? "USD";

        const variantGroups: { label: string; options: string[] }[] = [];
        if (firstVariant?.options) {
          firstVariant.options.forEach((opt: any) => {
            variantGroups.push({ label: opt.name, options: opt.values || [] });
          });
        }

        return {
          id: p.id,
          name: p.title || p.name || "Untitled Product",
          description: p.description || "",
          previewUrl: p.previewUrl || p.previewImage || "",
          price: typeof price === "number" && price > 100 ? price / 100 : price,
          currency,
          category: p.category || "Apparel",
          variants: variantGroups,
        };
      });

      setProducts(mapped);
    } catch (err) {
      console.error("Failed to fetch Gelato products:", err);
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
}
