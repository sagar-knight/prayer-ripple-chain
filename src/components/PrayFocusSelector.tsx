import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Globe,
  Sparkles,
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

const focusOptions: {
  id: PrayerFocusMode;
  icon: React.ElementType;
  title: string;
  description: string;
  requiresCountry?: boolean;
}[] = [
  {
    id: "needs_most",
    icon: Heart,
    title: "Needs prayer most",
    description: "Requests with the fewest prayers offered",
  },
  {
    id: "my_country",
    icon: Globe,
    title: "From my country",
    description: "Prayer requests near you",
    requiresCountry: true,
  },
  {
    id: "interests",
    icon: Sparkles,
    title: "Based on my interests",
    description: "Matched to your prayer interests",
  },
  {
    id: "recent",
    icon: Clock,
    title: "Recently added",
    description: "Newest prayer requests",
  },
  {
    id: "surprise",
    icon: Shuffle,
    title: "Surprise me",
    description: "A random request chosen for you",
  },
];

const rescueOption = {
  id: "rescue" as PrayerFocusMode,
  icon: LifeBuoy,
  title: "Rescue Mode",
  description: "Pray for someone who may have no one yet",
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

  const availableOptions = focusOptions.filter(
    (opt) => !opt.requiresCountry || userCountry
  );

  return (
    <div className="space-y-8 animate-gentle-fade">
      {/* Title */}
      <div className="text-center">
        <Heart className="h-10 w-10 text-primary mx-auto mb-3" />
        <h2 className="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-2">
          Choose your prayer focus
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Select how you'd like to pray today, and we'll guide you one request at a time.
        </p>
      </div>

      {/* Focus Options */}
      <div className="grid gap-3 max-w-lg mx-auto">
        {availableOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedFocus === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setSelectedFocus(option.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-peaceful"
                  : "border-border hover:border-primary/40 hover:bg-muted/50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "bg-primary/20" : "bg-muted"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isSelected ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground">
                  {option.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Rescue Mode Card */}
      {rescueCount > 0 && (
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => setSelectedFocus("rescue")}
            className={`w-full flex items-center gap-4 p-5 rounded-xl border text-left transition-all ${
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
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {rescueCount} waiting
                </Badge>
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

      {/* Commitment Count */}
      <div className="text-center space-y-3 max-w-lg mx-auto">
        <p className="text-sm font-medium text-foreground">
          How many would you like to pray for today?
        </p>
        <div className="flex justify-center gap-3">
          {commitmentCounts.map((count) => (
            <Button
              key={count}
              variant={selectedCount === count ? "peaceful" : "outline"}
              size="lg"
              className="w-16 h-12 text-lg font-bold"
              onClick={() => setSelectedCount(count)}
            >
              {count}
            </Button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="max-w-lg mx-auto space-y-3">
        <Button
          variant="peaceful"
          size="lg"
          className="w-full gap-2 text-base"
          onClick={() => onStartPraying(selectedFocus, selectedCount)}
        >
          Start Praying
          <ArrowRight className="h-5 w-5" />
        </Button>

        <button
          onClick={onBrowseAdvanced}
          className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-primary transition-colors py-2"
        >
          <List className="h-4 w-4" />
          Browse requests (advanced)
        </button>
      </div>
    </div>
  );
};

export default PrayFocusSelector;
