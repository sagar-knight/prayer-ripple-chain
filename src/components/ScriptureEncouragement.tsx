import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { getVersesForPrayerCategory, type Verse } from "@/data/verses";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ScriptureEncouragementProps {
  /** The prayer request category (e.g. "health", "family") */
  category: string;
  /** Display mode: "confirmation" for after submit, "collapsible" for prayer partner view */
  mode?: "confirmation" | "collapsible";
  /** Max verses to show */
  maxVerses?: number;
}

const ScriptureEncouragement = ({
  category,
  mode = "confirmation",
  maxVerses = 3,
}: ScriptureEncouragementProps) => {
  const verses = getVersesForPrayerCategory(category).slice(0, maxVerses);
  const [isOpen, setIsOpen] = useState(false);

  if (verses.length === 0) return null;

  const content = (
    <div className="space-y-3">
      {verses.map((verse) => (
        <div key={verse.id} className="space-y-1">
          <p className="text-sm text-foreground italic">"{verse.text}"</p>
          <p className="text-xs font-semibold text-primary">— {verse.reference}</p>
        </div>
      ))}
      {verses[0]?.reflection && (
        <div className="bg-muted/50 rounded-lg p-3 mt-2">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Reflection</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{verses[0].reflection}</p>
        </div>
      )}
    </div>
  );

  if (mode === "collapsible") {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary font-medium hover:underline w-full py-2">
          <BookOpen className="h-4 w-4" />
          Scripture to Pray Through
          <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          {content}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Confirmation mode
  return (
    <Card className="bg-primary/5 border-primary/20 animate-gentle-fade">
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="h-5 w-5" />
          <h4 className="font-playfair font-semibold text-sm">Encouragement from Scripture</h4>
        </div>
        {content}
      </CardContent>
    </Card>
  );
};

export default ScriptureEncouragement;
