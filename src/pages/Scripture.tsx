import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Bookmark, ChevronRight, Library } from "lucide-react";
import { verseCategories, getVersesByCategory, type Verse, type VerseCategory } from "@/data/verses";
import { useToast } from "@/hooks/use-toast";
import BibleReader from "./BibleReader";

const Scripture = () => {
  const [selectedCategory, setSelectedCategory] = useState<VerseCategory | null>(null);
  const [savedVerses, setSavedVerses] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("library");
  const { toast } = useToast();

  const toggleSave = (verseId: string) => {
    setSavedVerses((prev) => {
      const next = new Set(prev);
      if (next.has(verseId)) {
        next.delete(verseId);
        toast({ title: "Verse removed from saved", duration: 2000 });
      } else {
        next.add(verseId);
        toast({ title: "Verse saved", description: "Find it in your saved verses.", duration: 2000 });
      }
      return next;
    });
  };

  const verses = selectedCategory ? getVersesByCategory(selectedCategory) : [];

  return (
    <div className="min-h-screen bg-background py-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-3 tracking-tight">
            Scripture
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto text-sm">
            Find encouragement from God's Word. Browse by topic, read the Bible, or let AI help you understand.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Verse Library
            </TabsTrigger>
            <TabsTrigger value="bible" className="gap-2">
              <Library className="h-4 w-4" />
              Bible Reader
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            {savedVerses.size > 0 && !selectedCategory && (
              <div className="text-center mb-2">
                <Badge variant="secondary" className="gap-1 text-sm px-4 py-1.5">
                  <Bookmark className="h-3 w-3" />
                  {savedVerses.size} verse{savedVerses.size > 1 ? "s" : ""} saved
                </Badge>
              </div>
            )}

            {!selectedCategory ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {verseCategories.map((cat, i) => (
                  <Card
                    key={cat}
                    className="cursor-pointer hover:border-foreground/20 transition-colors group border border-border"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <CardContent className="pt-6 text-center space-y-2">
                      <h3 className="font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
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
                <h2 className="text-xl font-semibold">
                  {selectedCategory}
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
          </TabsContent>

          <TabsContent value="bible">
            <BibleReader />
          </TabsContent>
        </Tabs>
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
    <Card className="border border-border">
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <p className="text-foreground leading-relaxed italic text-sm">
              "{verse.text}"
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              — {verse.reference}{" "}
              <span className="text-xs font-normal">
                ({verse.translation})
              </span>
            </p>
          </div>
          <Button variant="ghost" size="sm" className="shrink-0" onClick={onToggleSave}>
            <Bookmark
              className={`h-4 w-4 ${isSaved ? "fill-foreground text-foreground" : "text-muted-foreground"}`}
            />
          </Button>
        </div>
        {verse.reflection && (
          <>
            {expanded ? (
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
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
                className="text-xs gap-1 text-muted-foreground"
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