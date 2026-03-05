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
      // Step 1: Get stores
      const { data: storesData, error: storesError } = await supabase.functions.invoke("gelato-proxy", {
        body: { endpoint: "/stores", method: "GET", service: "ecommerce" },
      });

      if (storesError) throw new Error(storesError.message);
      console.log("Gelato stores response:", storesData);

      const stores = storesData?.stores || [];
      const storeId = Array.isArray(stores) && stores.length > 0 ? stores[0].id : null;

      if (!storeId) {
        console.warn("No Gelato store found.");
        setProducts([]);
        return;
      }

      // Step 2: Get products from that store
      const { data: prodData, error: prodError } = await supabase.functions.invoke("gelato-proxy", {
        body: { endpoint: `/stores/${storeId}/products`, method: "GET", service: "ecommerce" },
      });

      if (prodError) throw new Error(prodError.message);
      console.log("Gelato products response:", prodData);

      const rawProducts = prodData?.products || [];

      if (!Array.isArray(rawProducts)) {
        console.warn("Unexpected Gelato response:", rawProducts);
        setProducts([]);
        return;
      }

      const mapped: GelatoProduct[] = rawProducts.map((p: any) => {
        // Map variant titles as options
        const variantTitles = (p.variants || []).map((v: any) => v.title || v.productUid || "Default");

        return {
          id: p.id,
          name: p.title || "Untitled Product",
          description: stripHtml(p.description || ""),
          previewUrl: p.previewUrl || "",
          price: 0, // Prices come from variant pricing; set later or on detail page
          currency: "USD",
          category: p.productType || "Wall Art",
          variants: variantTitles.length > 0
            ? [{ label: "Size", options: variantTitles }]
            : [],
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

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").trim();
}
