/**
 * Supported translation languages (Phase 1).
 * Codes follow ISO 639-1 where possible. `fil` is BCP-47 for Filipino.
 */
export interface AppLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: AppLanguage[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "fil", name: "Filipino", nativeName: "Filipino" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
];

export function getLanguageByCode(code: string | null | undefined): AppLanguage | null {
  if (!code) return null;
  const normalized = code.toLowerCase().split("-")[0];
  return (
    SUPPORTED_LANGUAGES.find((l) => l.code === code.toLowerCase()) ||
    SUPPORTED_LANGUAGES.find((l) => l.code === normalized) ||
    null
  );
}

export function detectBrowserLanguage(): string {
  try {
    const raw = (navigator.language || "en").toLowerCase();
    const short = raw.split("-")[0];
    const match = SUPPORTED_LANGUAGES.find(
      (l) => l.code === raw || l.code === short
    );
    return match?.code || "en";
  } catch {
    return "en";
  }
}