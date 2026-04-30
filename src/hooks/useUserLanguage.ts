import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import {
  detectBrowserLanguage,
  getLanguageByCode,
} from "@/data/languages";

/**
 * User language preference hook.
 * Priority: profile.preferred_language_code -> browser language -> "en".
 * Additive only - does not affect any existing UI translation.
 */
export function useUserLanguage() {
  const { user } = useAuth();
  const [profileCode, setProfileCode] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setReady(true);
      return;
    }
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("preferred_language_code, preferred_language_name")
        .eq("id", user.id)
        .maybeSingle();
      if (!alive) return;
      setProfileCode((data as any)?.preferred_language_code ?? null);
      setProfileName((data as any)?.preferred_language_name ?? null);
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  const browserCode = detectBrowserLanguage();
  const code = profileCode || browserCode || "en";
  const name =
    profileName ||
    getLanguageByCode(code)?.name ||
    "English";

  const savePreferredLanguage = useCallback(
    async (newCode: string | null) => {
      if (!user?.id) return;
      const newName = newCode ? getLanguageByCode(newCode)?.name ?? null : null;
      await supabase
        .from("profiles")
        .update({
          preferred_language_code: newCode,
          preferred_language_name: newName,
        } as any)
        .eq("id", user.id);
      setProfileCode(newCode);
      setProfileName(newName);
    },
    [user?.id]
  );

  return {
    languageCode: code,
    languageName: name,
    profileLanguageCode: profileCode,
    profileLanguageName: profileName,
    browserLanguageCode: browserCode,
    ready,
    savePreferredLanguage,
  };
}