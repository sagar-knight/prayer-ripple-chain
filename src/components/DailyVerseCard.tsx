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
    <Card className="bg-secondary/30 border-border">
      <CardContent className="pt-8 pb-8 space-y-4">
        <div className="flex items-center gap-2.5 text-foreground">
          <BookOpen className="h-5 w-5" />
          <h3 className="font-semibold text-sm uppercase tracking-wider">Today's Scripture</h3>
        </div>
        <p className="text-foreground italic leading-relaxed">
          "{expanded ? verse.text : verse.text.slice(0, 120) + (verse.text.length > 120 ? "..." : "")}"
        </p>
        <p className="font-medium text-sm text-muted-foreground">— {verse.reference}</p>

        {expanded && verse.reflection && (
          <div className="bg-secondary/50 rounded-lg p-5 mt-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Reflection</p>
            <p className="text-muted-foreground leading-relaxed text-sm">{verse.reflection}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {!expanded && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setExpanded(true)}>
              Read More
            </Button>
          )}
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/scripture">Browse All Scripture →</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyVerseCard;