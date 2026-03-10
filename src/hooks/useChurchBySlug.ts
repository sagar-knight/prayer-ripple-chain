import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Church } from "./useChurch";

export function useChurchBySlug(slug: string) {
  return useQuery({
    queryKey: ["church-by-slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("churches")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Church;
    },
    enabled: !!slug,
  });
}
