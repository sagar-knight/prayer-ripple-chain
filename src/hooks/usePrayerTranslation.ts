import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TranslationResult {
  translated_title: string | null;
  translated_body: string | null;
  source_language_code: string | null;
  target_language_code: string;
  provider: string | null;
  cached: boolean;
}

/**
 * On-demand prayer translation.
 * - Calls the `translate-prayer` edge function.
 * - Cache lookup happens server-side.
 * - Failure is non-blocking: original text is kept on the prayer card.
 */
export function usePrayerTranslation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranslationResult | null>(null);

  const translate = useCallback(
    async (params: {
      prayer_request_id: string;
      source_type?: "global" | "church";
      target_language_code: string;
      title?: string | null;
      body?: string | null;
    }): Promise<TranslationResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: invokeError } = await supabase.functions.invoke(
          "translate-prayer",
          {
            body: {
              prayer_request_id: params.prayer_request_id,
              source_type: params.source_type ?? "global",
              target_language_code: params.target_language_code,
              title: params.title ?? null,
              body: params.body ?? null,
            },
          }
        );
        if (invokeError) {
          setError(invokeError.message || "Translation failed");
          return null;
        }
        const r = data as TranslationResult;
        setResult(r);
        return r;
      } catch (e: any) {
        setError(e?.message || "Translation failed");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { translate, loading, error, result, reset };
}