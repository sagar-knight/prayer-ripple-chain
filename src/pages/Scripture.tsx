import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Heart, Bookmark, ChevronRight } from "lucide-react";
import { verseCategories, getVersesByCategory, type Verse, type VerseCategory } from "@/data/verses";
import { useToast } from "@/hooks/use-toast";

const categoryEmojis: Record<string, string> = {
  "Anxiety / Fear": "😰",
  Peace: "🕊️",
  Healing: "🩹",
  Guidance: "🧭",
  Family: "👨‍👩‍👧‍👦",
  Work: "💼",
  Grief: "💔",
  Forgiveness: "🤝",
  Gratitude: "🙏",
  Wisdom: "📖",
  Strength: "💪",
  Faith: "✝️",
};

const Scripture = () => {
  const [selectedCategory, setSelectedCategory] = useState<VerseCategory | null>(null);
  const [savedVerses, setSavedVerses] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleSave = (verseId: string) => {
    setSavedVerses((prev) => {
      const next = new Set(prev);
      if (next.has(verseId)) {
        next.delete(verseId);
        toast({ title: "Verse removed from saved", duration: 2000 });
      } else {
        next.add(verseId);
        // Analytics: verse_saved
        toast({ title: "Verse saved ✨", description: "Find it in your saved verses.", duration: 2000 });
      }
      return next;
    });
  };

  const verses = selectedCategory ? getVersesByCategory(selectedCategory) : [];

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 animate-gentle-fade">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-3">
            Scripture Library
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
            Find encouragement, comfort, and wisdom from God's Word. Browse by topic and save the verses that speak to you.
          </p>
        </div>

        {/* Saved filter */}
        {savedVerses.size > 0 && !selectedCategory && (
          <div className="text-center mb-6">
            <Badge variant="secondary" className="gap-1 text-sm px-4 py-1.5">
              <Bookmark className="h-3 w-3" />
              {savedVerses.size} verse{savedVerses.size > 1 ? "s" : ""} saved
            </Badge>
          </div>
        )}

        {/* Category grid or verse list */}
        {!selectedCategory ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {verseCategories.map((cat, i) => (
              <Card
                key={cat}
                className="cursor-pointer hover:shadow-peaceful transition-all group animate-gentle-fade"
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => {
                  setSelectedCategory(cat);
                  // Analytics: scripture_view
                }}
              >
                <CardContent className="pt-6 text-center space-y-2">
                  <span className="text-3xl">{categoryEmojis[cat] || "📖"}</span>
                  <h3 className="font-playfair font-semibold text-foreground group-hover:text-primary transition-colors">
                    {cat}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {getVersesByCategory(cat).length} verses
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 mb-2"
              onClick={() => setSelectedCategory(null)}
            >
              ← All Categories
            </Button>
            <h2 className="font-playfair text-2xl font-bold flex items-center gap-2">
              {categoryEmojis[selectedCategory]} {selectedCategory}
            </h2>

            {verses.map((verse) => (
              <VerseCard
                key={verse.id}
                verse={verse}
                isSaved={savedVerses.has(verse.id)}
                onToggleSave={() => toggleSave(verse.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function VerseCard({
  verse,
  isSaved,
  onToggleSave,
}: {
  verse: Verse;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="animate-gentle-fade">
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <p className="text-foreground leading-relaxed italic">
              "{verse.text}"
            </p>
            <p className="text-sm font-semibold text-primary">
              — {verse.reference}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({verse.translation})
              </span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={onToggleSave}
          >
            <Bookmark
              className={`h-5 w-5 ${isSaved ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          </Button>
        </div>

        {verse.reflection && (
          <>
            {expanded ? (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 animate-gentle-fade">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Reflection
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {verse.reflection}
                </p>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1 text-primary"
                onClick={() => setExpanded(true)}
              >
                Read Reflection <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default Scripture;
