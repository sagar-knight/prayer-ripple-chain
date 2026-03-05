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

interface RawGelatoProduct {
  id: string;
  title?: string;
  description?: string;
  previewUrl?: string;
  productUid?: string;
  variants?: Array<{
    id: string;
    title?: string;
    options?: Array<{ name: string; values: string[] }>;
    prices?: Array<{ amount: number; currency: string }>;
  }>;
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
      const { data, error: fnError } = await supabase.functions.invoke("gelato-proxy", {
        body: { endpoint: "/stores", method: "GET" },
      });

      if (fnError) throw new Error(fnError.message);

      // Gelato's API structure: first get stores, then products from a store
      // If you have a single store, we get its products
      let storeId: string | null = null;
      if (data?.stores?.length > 0) {
        storeId = data.stores[0].id;
      } else if (data?.id) {
        storeId = data.id;
      }

      let rawProducts: RawGelatoProduct[] = [];

      if (storeId) {
        const { data: prodData, error: prodError } = await supabase.functions.invoke("gelato-proxy", {
          body: { endpoint: `/stores/${storeId}/products`, method: "GET" },
        });
        if (prodError) throw new Error(prodError.message);
        rawProducts = prodData?.products || prodData || [];
      } else {
        // Try direct products endpoint
        const { data: prodData, error: prodError } = await supabase.functions.invoke("gelato-proxy", {
          body: { endpoint: "/products", method: "GET" },
        });
        if (prodError) throw new Error(prodError.message);
        rawProducts = prodData?.products || prodData || [];
      }

      if (!Array.isArray(rawProducts)) {
        console.warn("Unexpected Gelato response:", rawProducts);
        rawProducts = [];
      }

      const mapped: GelatoProduct[] = rawProducts.map((p) => {
        const firstVariant = p.variants?.[0];
        const price = firstVariant?.prices?.[0]?.amount ?? 0;
        const currency = firstVariant?.prices?.[0]?.currency ?? "USD";

        const variantGroups: { label: string; options: string[] }[] = [];
        firstVariant?.options?.forEach((opt) => {
          variantGroups.push({ label: opt.name, options: opt.values });
        });

        return {
          id: p.id,
          name: p.title || "Untitled Product",
          description: p.description || "",
          previewUrl: p.previewUrl || "",
          price: price / 100, // Gelato prices are typically in cents
          currency,
          category: "Apparel",
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
