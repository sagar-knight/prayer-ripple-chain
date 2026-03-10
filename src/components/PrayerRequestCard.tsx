import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

const PrayerRequestCard = ({
  header = "Someone asked for prayer",
  description,
  subtitle,
  prayerCount,
  actions,
  children,
  className,
}: PrayerRequestCardProps) => {
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
        "rounded-xl border-primary/10 shadow-sm hover:shadow-md transition-shadow duration-300",
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
          {description}
        </p>

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
      </CardContent>
    </Card>
    </motion.div>
  );
};

export default PrayerRequestCard;
