import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { getDailyVerse } from "@/data/verses";
import { Link } from "react-router-dom";

const DailyVerseCard = () => {
  const verse = getDailyVerse();
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="bg-primary/5 border-primary/20 animate-gentle-fade">
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <BookOpen className="h-5 w-5" />
          <h3 className="font-playfair font-semibold text-base">Today's Scripture</h3>
        </div>
        <p className="text-foreground italic leading-relaxed">
          "{expanded ? verse.text : verse.text.slice(0, 120) + (verse.text.length > 120 ? "..." : "")}"
        </p>
        <p className="text-sm font-semibold text-primary">— {verse.reference}</p>

        {expanded && verse.reflection && (
          <div className="bg-muted/50 rounded-lg p-4 mt-2 animate-gentle-fade">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Reflection</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{verse.reflection}</p>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {!expanded && (
            <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={() => setExpanded(true)}>
              Read More
            </Button>
          )}
          <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
            <Link to="/scripture">Browse All Scripture →</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyVerseCard;
