import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Languages, Loader2 } from "lucide-react";
import { useUserLanguage } from "@/hooks/useUserLanguage";
import { usePrayerTranslation } from "@/hooks/usePrayerTranslation";
import { getLanguageByCode } from "@/data/languages";
import { useToast } from "@/hooks/use-toast";

interface Props {
  prayerId: string;
  sourceType?: "global" | "church";
  title?: string | null;
  body?: string | null;
  /** Notifies parent so it can render the translation in place. */
  onTranslated: (data: {
    title: string | null;
    body: string | null;
    sourceLang: string | null;
    targetLang: string;
  }) => void;
  /** True when the user is currently viewing translated text. */
  showingTranslation: boolean;
  onShowOriginal: () => void;
}

const PrayerTranslateButton = ({
  prayerId,
  sourceType = "global",
  title,
  body,
  onTranslated,
  showingTranslation,
  onShowOriginal,
}: Props) => {
  const { languageCode, languageName, profileLanguageCode } = useUserLanguage();
  const { translate, loading } = usePrayerTranslation();
  const { toast } = useToast();
  const [tried, setTried] = useState(false);

  const targetLang = languageCode || "en";
  const targetName = getLanguageByCode(targetLang)?.name || languageName || "your language";

  // Skip the button entirely if user's preferred language is English and
  // they have explicitly chosen it (most prayers are in English).
  // We still show it as a fallback if no profile preference is set.
  if (profileLanguageCode === "en") return null;

  if (showingTranslation) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-xs h-7"
        onClick={onShowOriginal}
      >
        Show Original
      </Button>
    );
  }

  const handleClick = async () => {
    setTried(true);
    const r = await translate({
      prayer_request_id: prayerId,
      source_type: sourceType,
      target_language_code: targetLang,
      title,
      body,
    });
    if (!r) {
      toast({
        title: "Translation unavailable",
        description: "Showing the original prayer. Please try again later.",
        duration: 3000,
      });
      return;
    }
    onTranslated({
      title: r.translated_title,
      body: r.translated_body,
      sourceLang: r.source_language_code,
      targetLang: r.target_language_code,
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 text-xs h-7"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Languages className="h-3 w-3" />
      )}
      {profileLanguageCode
        ? `Translate to ${targetName}`
        : "Translate"}
    </Button>
  );
};

export default PrayerTranslateButton;