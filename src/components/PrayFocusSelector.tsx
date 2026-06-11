import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Globe,
  Star,
  Clock,
  Shuffle,
  ArrowRight,
  List,
  LifeBuoy,
} from "lucide-react";

export type PrayerFocusMode =
  | "needs_most"
  | "my_country"
  | "interests"
  | "recent"
  | "surprise"
  | "rescue";

interface PrayFocusSelectorProps {
  userCountry?: string;
  rescueCount?: number;
  onStartPraying: (mode: PrayerFocusMode, count: number) => void;
  onBrowseAdvanced: () => void;
}

type FocusOption = {
  id: PrayerFocusMode;
  icon: React.ElementType;
  title: string;
  description: string;
  requiresCountry?: boolean;
  surface: string;
};

const primaryOption: FocusOption = {
  id: "needs_most",
  icon: Heart,
  title: "Needs prayer most",
  description: "Someone waiting for prayer with very few people lifting them up.",
  surface: "bg-soft-green",
};

const mainSecondaryOptions: FocusOption[] = [
  {
    id: "my_country",
    icon: Globe,
    title: "From my country",
    description: "Pray for someone near you.",
    requiresCountry: true,
    surface: "bg-soft-blue",
  },
  {
    id: "interests",
    icon: Star,
    title: "Based on your heart",
    description: "Matched to the categories close to you.",
    surface: "bg-soft-warm",
  },
  {
    id: "recent",
    icon: Clock,
    title: "Recently shared",
    description: "Someone who just asked for prayer.",
    surface: "bg-soft-blue",
  },
  {
    id: "surprise",
    icon: Shuffle,
    title: "Let God guide you",
    description: "A quiet, unexpected invitation to pray.",
    surface: "bg-soft-green",
  },
];

const surpriseOption: FocusOption = {
  id: "surprise",
  icon: Shuffle,
  title: "Let God guide you",
  description: "A quiet, unexpected invitation to pray.",
  surface: "bg-soft-green",
};

const rescueOption = {
  id: "rescue" as PrayerFocusMode,
  icon: LifeBuoy,
  title: "Rescue Prayer",
  description: "Pray for someone who may have no one praying for them yet",
};

const commitmentCounts = [1, 3, 5];

const PrayFocusSelector = ({
  userCountry,
  rescueCount = 0,
  onStartPraying,
  onBrowseAdvanced,
}: PrayFocusSelectorProps) => {
  const [selectedFocus, setSelectedFocus] = useState<PrayerFocusMode>("needs_most");
  const [selectedCount, setSelectedCount] = useState(1);

  const availableMain = mainSecondaryOptions.filter(
    (opt) => !opt.requiresCountry || userCountry
  );

  return (
    <div className="space-y-10 animate-gentle-fade">
      {/* Hero */}
      <div className="relative text-center max-w-2xl mx-auto">
        <div className="absolute inset-x-10 -top-8 h-32 bg-gradient-primary opacity-20 blur-3xl rounded-full pointer-events-none" />
        <div className="relative">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
            Take a moment to pray
          </h2>
          <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            Someone, somewhere, is waiting for your prayer.
          </p>
        </div>
      </div>

      {/* Primary Card */}
      <div
        className="group relative w-full max-w-2xl mx-auto rounded-2xl p-7 md:p-8 bg-card/40 backdrop-blur-sm border border-border/50 lift-on-hover overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-success/10 blur-3xl group-hover:bg-success/15 transition-colors pointer-events-none" />
        <div className="relative flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center flex-shrink-0 ring-1 ring-success/20">
            <Heart className="h-7 w-7 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-playfair text-2xl font-bold text-foreground mb-1.5">
              {primaryOption.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              {primaryOption.description}
            </p>
          </div>
        </div>

        {/* Prayer count — inside primary card */}
        <div className="relative mt-6 pt-5 border-t border-border/40">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            How many people would you like to pray for?
          </p>
          <div className="flex items-center gap-3">
            {commitmentCounts.map((count) => (
              <button
                key={count}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCount(count);
                }}
                className={`w-12 h-10 rounded-lg text-sm font-bold transition-all ${
                  selectedCount === count
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-background/60 text-foreground border border-border/50 hover:bg-background"
                }`}
              >
                {count}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={() => onStartPraying("needs_most", selectedCount)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:gap-3 transition-all"
            >
              Start Praying
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Cards */}
      <div className="max-w-2xl mx-auto space-y-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4 text-center">
          Or choose a different way
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {availableMain.map((option, idx) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => onStartPraying(option.id, selectedCount)}
                style={{ animationDelay: `${idx * 60}ms` }}
                className="animate-gentle-fade group relative text-left rounded-2xl p-5 bg-card/30 backdrop-blur-sm border border-border/40 hover:border-border lift-on-hover overflow-hidden"
              >
                <div className="flex flex-col items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/70 dark:bg-white/10 flex items-center justify-center flex-shrink-0 ring-1 ring-border/40">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-foreground mb-1">
                      {option.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rescue Mode Card */}
      {rescueCount > 0 && (
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setSelectedFocus("rescue")}
            className={`w-full flex items-center gap-4 p-5 rounded-2xl border text-left lift-on-hover ${
              selectedFocus === "rescue"
                ? "border-accent bg-accent/10 shadow-warm"
                : "border-accent/40 hover:border-accent hover:bg-accent/5"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                selectedFocus === "rescue" ? "bg-accent/30" : "bg-accent/10"
              }`}
            >
              <LifeBuoy
                className={`h-6 w-6 ${
                  selectedFocus === "rescue" ? "text-accent-foreground" : "text-muted-foreground"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-foreground">
                  {rescueOption.title}
                </h4>
              </div>
              <p className="text-xs text-muted-foreground">
                {rescueOption.description}
              </p>
            </div>
            {selectedFocus === "rescue" && (
              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-accent-foreground" />
              </div>
            )}
          </button>
        </div>
      )}

      {/* Start Button */}
      <div className="max-w-2xl mx-auto space-y-3">
        <button
          onClick={onBrowseAdvanced}
          className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-primary transition-colors py-2"
        >
          <List className="h-4 w-4" />
          Browse all requests
        </button>
      </div>
    </div>
  );
};

export default PrayFocusSelector;
