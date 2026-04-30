import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import ReportButton from "@/components/ReportButton";
import PrayerTranslateButton from "@/components/PrayerTranslateButton";
import { getLanguageByCode } from "@/data/languages";

interface PrayerRequestCardProps {
  /** Optional header text, defaults to "Someone asked for prayer" */
  header?: string;
  /** Main prayer text / description */
  description: string;
  /** Optional subtitle line (category, time, etc.) */
  subtitle?: ReactNode;
  /** Prayer count to show encouragement */
  prayerCount?: number;
  /** Action buttons (I Prayed, Pass Forward, etc.) */
  actions?: ReactNode;
  /** Extra content below description (scripture, reminders, etc.) */
  children?: ReactNode;
  /** Additional className */
  className?: string;
  /** Entity ID and type for reporting */
  reportEntityId?: string;
  reportEntityType?: "global_prayer" | "church_prayer" | "family_note" | "family_scripture";
  /** Optional title (used by translation; not displayed unless translation toggles it). */
  title?: string;
  /** Enable on-demand translation. Pass the prayer id + source type. */
  translatable?: {
    prayerId: string;
    sourceType?: "global" | "church";
  };
}

const PrayerRequestCard = ({
  header = "Someone asked for prayer",
  description,
  subtitle,
  prayerCount,
  actions,
  children,
  className,
  reportEntityId,
  reportEntityType,
  title,
  translatable,
}: PrayerRequestCardProps) => {
  const [translation, setTranslation] = useState<{
    title: string | null;
    body: string | null;
    sourceLang: string | null;
    targetLang: string;
  } | null>(null);

  const showingTranslation = !!translation;
  const displayedDescription =
    showingTranslation && translation?.body ? translation.body : description;
  const sourceLangName =
    translation?.sourceLang
      ? getLanguageByCode(translation.sourceLang)?.name || translation.sourceLang
      : null;

  const prayerMessage =
    prayerCount === undefined
      ? null
      : prayerCount === 0
        ? "Be the first to pray"
        : prayerCount === 1
          ? "1 person has prayed"
          : `${prayerCount} people have prayed`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
    <Card
      className={cn(
        "rounded-xl border-border/60",
        className
      )}
    >
      <CardContent className="px-6 py-8 sm:px-8 sm:py-10 space-y-5">
        {/* Calm header */}
        <p className="text-xs uppercase tracking-widest text-muted-foreground/70 font-medium text-center">
          {header}
        </p>

        {/* Prayer text */}
        <p className="text-base sm:text-lg text-foreground leading-relaxed text-center font-serif">
          {displayedDescription}
        </p>

        {/* Translation badge */}
        {showingTranslation && (
          <p className="text-[11px] text-muted-foreground/80 text-center italic">
            Translated{sourceLangName ? ` from ${sourceLangName}` : " from original language"}
          </p>
        )}

        {/* Translate / Show Original control */}
        {translatable && (
          <div className="flex justify-center">
            <PrayerTranslateButton
              prayerId={translatable.prayerId}
              sourceType={translatable.sourceType ?? "global"}
              title={title}
              body={description}
              showingTranslation={showingTranslation}
              onShowOriginal={() => setTranslation(null)}
              onTranslated={(t) => setTranslation(t)}
            />
          </div>
        )}

        {/* Subtitle / metadata */}
        {subtitle && (
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
            {subtitle}
          </div>
        )}

        {/* Prayer count encouragement */}
        {prayerMessage && (
          <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <Heart className="h-3.5 w-3.5 text-primary/60" />
            <span>{prayerMessage}</span>
          </div>
        )}

        {/* Extra content (scripture, reminders, etc.) */}
        {children}

        {/* Actions */}
        {actions && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {actions}
          </div>
        )}

        {/* Report */}
        {reportEntityId && reportEntityType && (
          <div className="flex justify-end pt-1">
            <ReportButton entityId={reportEntityId} entityType={reportEntityType} />
          </div>
        )}
      </CardContent>
    </Card>
    </motion.div>
  );
};

export default PrayerRequestCard;
