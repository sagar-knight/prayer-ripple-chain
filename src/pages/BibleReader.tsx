import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Star,
  StickyNote,
  Lightbulb,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { bibleBooks, getChapterText, type BibleTranslation } from "@/data/bible";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";

interface BibleNote {
  id: string;
  book: string;
  chapter: number;
  translation: BibleTranslation;
  noteText: string;
  createdAt: string;
}

const BibleReader = () => {
  const [translation, setTranslation] = useLocalStorage<BibleTranslation>("pf-bible-translation", "NIV");
  const [selectedBook, setSelectedBook] = useState("John");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [notes, setNotes] = useLocalStorage<BibleNote[]>("pf-bible-notes", []);
  const [newNote, setNewNote] = useState("");
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showHowToRead, setShowHowToRead] = useState(false);
  const { toast } = useToast();

  const book = bibleBooks.find((b) => b.name === selectedBook)!;
  const chapterText = getChapterText(selectedBook, selectedChapter, translation);

  const chapterNotes = notes.filter(
    (n) => n.book === selectedBook && n.chapter === selectedChapter
  );

  const goToChapter = (delta: number) => {
    const next = selectedChapter + delta;
    if (next >= 1 && next <= book.chapters) {
      setSelectedChapter(next);
      setAiExplanation("");
    }
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: BibleNote = {
      id: crypto.randomUUID(),
      book: selectedBook,
      chapter: selectedChapter,
      translation,
      noteText: newNote.trim(),
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [note, ...prev]);
    setNewNote("");
    toast({ title: "Note saved 📝", duration: 2000 });
  };

  const handleAiHelp = async () => {
    setAiLoading(true);
    setAiExplanation("");
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bible-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            book: selectedBook,
            chapter: selectedChapter,
            translation,
            chapterText: chapterText.slice(0, 3000),
          }),
        }
      );

      if (resp.status === 429) {
        toast({ title: "Too many requests. Please try again in a moment.", variant: "destructive" });
        setAiLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast({ title: "AI usage limit reached. Please try again later.", variant: "destructive" });
        setAiLoading(false);
        return;
      }
      if (!resp.ok || !resp.body) throw new Error("Failed");

      // Stream response
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              full += content;
              setAiExplanation(full);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw || !raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              full += content;
              setAiExplanation(full);
            }
          } catch {}
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Could not get AI explanation. Try again.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="animate-gentle-fade">
        <CardContent className="pt-5 space-y-4">
          <div className="flex flex-wrap gap-3">
            {/* Book selector */}
            <Select value={selectedBook} onValueChange={(v) => { setSelectedBook(v); setSelectedChapter(1); setAiExplanation(""); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {bibleBooks.map((b) => (
                  <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Chapter selector */}
            <Select value={String(selectedChapter)} onValueChange={(v) => { setSelectedChapter(Number(v)); setAiExplanation(""); }}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => (
                  <SelectItem key={ch} value={String(ch)}>Ch. {ch}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Translation */}
            <Select value={translation} onValueChange={(v) => { setTranslation(v as BibleTranslation); setAiExplanation(""); }}>
              <SelectTrigger className="w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NIV">NIV</SelectItem>
                <SelectItem value="KJV">KJV</SelectItem>
                <SelectItem value="NLT">NLT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* How to Read panel */}
      <Collapsible open={showHowToRead} onOpenChange={setShowHowToRead}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 text-primary w-full justify-start">
            <Lightbulb className="h-4 w-4" />
            How to Read Scripture Wisely
            <ChevronDown className={`h-4 w-4 transition-transform ${showHowToRead ? "rotate-180" : ""}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-5">
              <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                <p className="font-medium text-foreground">When reading the Bible, don't just pick one random verse. Ask these questions:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li><strong>What is this passage saying?</strong> (Read the full chapter.)</li>
                  <li><strong>What comes before and after this passage?</strong></li>
                  <li><strong>What did it mean when it was written?</strong> (Who wrote it and why?)</li>
                  <li><strong>What is God teaching me through this today?</strong></li>
                </ol>
                <p>Look for repeated themes, compare verses with other verses, and pray for understanding.</p>
                <p>God usually speaks through steady patterns and consistent truth — not just one sudden moment.</p>
                <p className="italic">Read slowly. Reflect. Pray.</p>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Chapter text */}
      <Card className="animate-gentle-fade">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-playfair text-lg">
              {selectedBook} {selectedChapter}
              <Badge variant="secondary" className="ml-2 text-xs">{translation}</Badge>
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" disabled={selectedChapter <= 1} onClick={() => goToChapter(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" disabled={selectedChapter >= book.chapters} onClick={() => goToChapter(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-line font-inter">
            {chapterText}
          </div>
        </CardContent>
      </Card>

      {/* AI Help */}
      <Card className="animate-gentle-fade">
        <CardContent className="pt-5 space-y-4">
          <Button
            variant="peaceful"
            className="w-full gap-2"
            onClick={handleAiHelp}
            disabled={aiLoading}
          >
            {aiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Star className="h-4 w-4" />
            )}
            {aiLoading ? "Understanding passage..." : "AI Help me understand"}
          </Button>

          {aiExplanation && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 animate-gentle-fade">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Bible-based encouragement
                </span>
              </div>
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {aiExplanation}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passage notes */}
      <Card className="animate-gentle-fade">
        <CardHeader>
          <CardTitle className="font-playfair text-base flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-primary" />
            My Notes — {selectedBook} {selectedChapter}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Textarea
              placeholder="Write a reflection or note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[50px]"
            />
            <Button variant="peaceful" size="sm" onClick={addNote} disabled={!newNote.trim()}>
              Save
            </Button>
          </div>

          {chapterNotes.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              No notes for this chapter yet.
            </p>
          ) : (
            <div className="space-y-2">
              {chapterNotes.map((note) => (
                <div key={note.id} className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <p className="text-sm text-foreground">{note.noteText}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" · "}
                    {note.translation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BibleReader;
