import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getCountryByCode } from "@/data/countries";

// In-memory + localStorage cache so we don't hit detection multiple times
const STORAGE_KEY = "pf.detected_country";
let cachedCountry: { code: string | null; name: string | null } | null = null;
let inflight: Promise<{ code: string | null; name: string | null }> | null = null;

async function detectCountry(): Promise<{ code: string | null; name: string | null }> {
  if (cachedCountry) return cachedCountry;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.code) {
        cachedCountry = parsed;
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      // Lightweight, free, no-key IP geolocation. Returns just country code.
      const res = await fetch("https://get.geojs.io/v1/ip/country.json", {
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        const json = await res.json();
        const code: string | null = json?.country ?? null;
        const name: string | null = json?.name ?? (code ? getCountryByCode(code)?.name ?? null : null);
        const result = { code, name };
        if (code) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
          } catch {
            /* ignore */
          }
        }
        cachedCountry = result;
        return result;
      }
    } catch {
      /* network/timeout - fall through */
    }
    const fallback = { code: null, name: null };
    cachedCountry = fallback;
    return fallback;
  })();

  return inflight;
}

/**
 * Returns the user's country (profile preferred, detected as fallback).
 * Also updates last_login_country on first authenticated load.
 */
export function useUserCountry() {
  const { user } = useAuth();
  const [profileCountryCode, setProfileCountryCode] = useState<string | null>(null);
  const [profileCountryName, setProfileCountryName] = useState<string | null>(null);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [detectedName, setDetectedName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Detect once on mount (anonymous safe)
  useEffect(() => {
    let alive = true;
    detectCountry().then((c) => {
      if (!alive) return;
      setDetectedCode(c.code);
      setDetectedName(c.name);
    });
    return () => {
      alive = false;
    };
  }, []);

  // When user is known, load profile country + record login
  useEffect(() => {
    if (!user?.id) {
      setReady(true);
      return;
    }
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("country_code, country_name")
        .eq("id", user.id)
        .maybeSingle();
      if (!alive) return;
      const pc = (data as any)?.country_code ?? null;
      const pn = (data as any)?.country_name ?? null;
      setProfileCountryCode(pc);
      setProfileCountryName(pn);

      // Login tracking: detected country fills last-login fields
      const detected = await detectCountry();
      try {
        await supabase
          .from("profiles")
          .update({
            last_login_at: new Date().toISOString(),
            last_login_country_code: detected.code,
            last_login_country_name: detected.name,
          } as any)
          .eq("id", user.id);
      } catch {
        /* non-blocking */
      }
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  const code = profileCountryCode ?? detectedCode ?? null;
  const name =
    profileCountryName ??
    detectedName ??
    (code ? getCountryByCode(code)?.name ?? null : null);

  const saveProfileCountry = useCallback(
    async (newCode: string | null) => {
      if (!user?.id) return;
      const newName = newCode ? getCountryByCode(newCode)?.name ?? null : null;
      await supabase
        .from("profiles")
        .update({ country_code: newCode, country_name: newName } as any)
        .eq("id", user.id);
      setProfileCountryCode(newCode);
      setProfileCountryName(newName);
    },
    [user?.id]
  );

  return {
    countryCode: code,
    countryName: name,
    profileCountryCode,
    profileCountryName,
    detectedCode,
    detectedName,
    ready,
    saveProfileCountry,
  };
}

/** One-shot helper for non-React contexts. */
export async function getCurrentUserCountry(userId: string | null | undefined) {
  let profile: { code: string | null; name: string | null } = { code: null, name: null };
  if (userId) {
    const { data } = await supabase
      .from("profiles")
      .select("country_code, country_name")
      .eq("id", userId)
      .maybeSingle();
    profile = {
      code: (data as any)?.country_code ?? null,
      name: (data as any)?.country_name ?? null,
    };
  }
  if (profile.code) return profile;
  return await detectCountry();
}