import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Compass, ArrowRight, RefreshCw } from "lucide-react";
import { verseCategories, getVersesByCategory, type VerseCategory } from "@/data/verses";

/** Returns a deterministic daily focus category based on the day of year */
function getDailyFocusCategory(): VerseCategory {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return verseCategories[dayOfYear % verseCategories.length];
}

const focusPrompts: Record<string, string> = {
  "Anxiety / Fear": "Pray for someone wrestling with worry or uncertainty today.",
  Peace: "Ask God to bring His peace to someone who is restless or overwhelmed.",
  Healing: "Lift up someone who is hurting — physically, emotionally, or spiritually.",
  Guidance: "Pray for someone facing a difficult decision or crossroads.",
  Family: "Cover a family in prayer — for unity, love, and patience.",
  Work: "Pray for someone carrying a heavy burden at work or in their calling.",
  Grief: "Hold someone who is mourning before the Lord today.",
  Forgiveness: "Pray for hearts to soften — for those needing to forgive or be forgiven.",
  Gratitude: "Thank God for His faithfulness and pray someone else discovers it too.",
  Wisdom: "Ask God to grant wisdom to someone navigating complexity.",
  Strength: "Pray for renewed strength for someone who feels depleted.",
  Faith: "Pray for deeper faith — for yourself or someone who is struggling to believe.",
};

const DailyPrayerFocus = () => {
  const category = getDailyFocusCategory();
  const verses = getVersesByCategory(category);
  const dailyVerse = verses.length > 0 ? verses[0] : null;
  const prompt = focusPrompts[category] || "Pray for someone today.";

  return (
    <Card className="border-0 animate-gentle-fade">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-playfair text-lg flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            Today's Prayer Focus
          </CardTitle>
          <Badge variant="secondary" className="text-xs font-normal">
            {category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground/90 leading-relaxed">{prompt}</p>

        {dailyVerse && (
          <blockquote className="border-l-4 border-primary/30 pl-4 italic text-foreground/80 text-sm leading-relaxed">
            "{dailyVerse.text}"
            <span className="block not-italic text-primary text-xs mt-1 font-medium">
              — {dailyVerse.reference}
            </span>
          </blockquote>
        )}

        <div className="flex gap-3 flex-wrap pt-1">
          <Button asChild variant="peaceful" size="sm">
            <Link to={`/pray?focus=${encodeURIComponent(category)}`}>
              Pray This Focus
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/scripture">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Explore Scripture
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyPrayerFocus;
