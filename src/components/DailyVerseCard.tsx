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
      <CardContent className="pt-8 pb-8 space-y-4">
        <div className="flex items-center gap-2.5 text-primary">
          <BookOpen className="h-6 w-6" />
          <h3 className="font-serif font-semibold text-lg">Today's Scripture</h3>
        </div>
        <p className="text-foreground italic leading-relaxed text-lg">
          "{expanded ? verse.text : verse.text.slice(0, 120) + (verse.text.length > 120 ? "..." : "")}"
        </p>
        <p className="font-semibold text-primary">— {verse.reference}</p>

        {expanded && verse.reflection && (
          <div className="bg-muted/50 rounded-xl p-5 mt-3 animate-gentle-fade">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Reflection</p>
            <p className="text-muted-foreground leading-relaxed">{verse.reflection}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {!expanded && (
            <Button variant="ghost" size="default" className="text-primary" onClick={() => setExpanded(true)}>
              Read More
            </Button>
          )}
          <Button asChild variant="ghost" size="default" className="text-muted-foreground">
            <Link to="/scripture">Browse All Scripture →</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyVerseCard;
