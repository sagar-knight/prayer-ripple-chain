import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, CheckCircle, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import ReportButton from "@/components/ReportButton";
import PrayerTranslateButton from "@/components/PrayerTranslateButton";
import { getLanguageByCode } from "@/data/languages";
import { Badge } from "@/components/ui/badge";

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
  /** Optional lifecycle status to show a small label */
  status?: "open" | "progress" | "answered" | "archived" | string;
  /** Optional latest owner update message */
  latestUpdate?: string | null;
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
  status,
  latestUpdate,
}: PrayerRequestCardProps) => {
  const [translation, setTranslation] = useState<{
    title: string | null;
    body: string | null;
    sourceLang: string | null;
    targetLang: string;
  } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const showingTranslation = !!translation;
  const displayedDescription =
    showingTranslation && translation?.body ? translation.body : description;
  const sourceLangName =
    translation?.sourceLang
      ? getLanguageByCode(translation.sourceLang)?.name || translation.sourceLang
      : null;
  const isLong = (displayedDescription?.length ?? 0) > 220;

  const prayerMessage =
    prayerCount === undefined
      ? null
        : prayerCount === 0
        ? "🙏 Be the first to pray"
        : prayerCount === 1
          ? "🙏 1 Person Praying"
          : `🙏 ${prayerCount.toLocaleString()} People Praying`;

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

        {/* Lifecycle status */}
        {(status === "answered" || status === "progress") && (
          <div className="flex justify-center">
            {status === "answered" ? (
              <Badge className="bg-primary text-primary-foreground gap-1">
                <CheckCircle className="h-3 w-3" /> Prayer answered
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Sprout className="h-3 w-3" /> Seeing progress
              </Badge>
            )}
          </div>
        )}

        {/* Prayer text — clamp to ~4 lines, with Read More */}
        <div className="text-center">
          <p
            className={cn(
              "text-base sm:text-lg text-foreground leading-relaxed font-serif",
              !expanded && isLong && "line-clamp-4",
            )}
          >
            {displayedDescription}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>

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

        {/* Prayer count + reach (social proof) */}
        {prayerMessage && (
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{prayerMessage}</p>
          </div>
        )}

        {/* Extra content (scripture, reminders, etc.) */}
        {children}

        {/* Latest update from the prayer owner */}
        {latestUpdate && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Latest update
            </p>
            <p className="text-sm text-foreground">{latestUpdate}</p>
          </div>
        )}

        {/* Actions */}
        {actions && (
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-3 pt-2">
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
