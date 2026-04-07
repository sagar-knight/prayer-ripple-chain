import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Church } from "./useChurch";

/** Public church info (safe for unauthenticated contexts) */
export type PublicChurch = {
  id: string;
  name: string | null;
  slug: string | null;
  logo_url: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  denomination: string | null;
  verified: boolean | null;
  privacy: string | null;
  status: string | null;
  created_at: string | null;
};

/**
 * Fetch church by slug. Uses churches_public view (safe for anon)
 * so unauthenticated visitors on join pages can see basic info.
 */
export function useChurchBySlug(slug: string) {
  return useQuery({
    queryKey: ["church-by-slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches_public")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Church not found");
      return data as PublicChurch;
    },
    enabled: !!slug,
  });
}
