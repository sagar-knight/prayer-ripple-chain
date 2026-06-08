import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

let cached: string | null = null;
let inflight: Promise<string> | null = null;

async function fetchToken(): Promise<string> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = (async () => {
    const { data, error } = await supabase.functions.invoke("get-mapbox-token");
    if (error) throw error;
    const token = (data as { token?: string } | null)?.token ?? "";
    cached = token;
    return token;
  })();
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function useMapboxToken() {
  const [token, setToken] = useState<string | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (cached) return;
    let cancelled = false;
    setLoading(true);
    fetchToken()
      .then((t) => {
        if (cancelled) return;
        setToken(t || null);
        setError(t ? null : new Error("missing_token"));
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e : new Error("token_error"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { token, loading, error };
}