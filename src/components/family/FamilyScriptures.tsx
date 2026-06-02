import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface SharedScripture {
  id: string;
  verseReference: string;
  translation: string;
  verseText: string;
  note: string;
  sharedBy: string;
  createdAt: string;
}

interface Props {
  scriptures: SharedScripture[];
  onAdd: (s: Omit<SharedScripture, "id" | "createdAt">) => void;
  currentUser: string;
}

const FamilyScriptures = ({ scriptures, onAdd, currentUser }: Props) => {
  const [showAdd, setShowAdd] = useState(false);
  const [reference, setReference] = useState("");
  const [verseText, setVerseText] = useState("");
  const [note, setNote] = useState("");
  const [translation, setTranslation] = useState("NIV");
  const { toast } = useToast();

  const handleAdd = () => {
    if (!reference.trim() || !verseText.trim()) {
      toast({ title: "Please enter the verse reference and text", variant: "destructive" });
      return;
    }
    onAdd({
      verseReference: reference.trim(),
      translation,
      verseText: verseText.trim(),
      note: note.trim(),
      sharedBy: currentUser,
    });
    setReference("");
    setVerseText("");
    setNote("");
    setShowAdd(false);
    toast({ title: "Scripture shared with family" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Share encouraging Bible verses with your family.
        </p>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button variant="peaceful" size="sm" className="gap-1 shrink-0">
              <Plus className="h-4 w-4" /> Share Verse
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-playfair">Share a Scripture</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Verse reference *</Label>
                <Input placeholder="e.g. Psalm 23:1" value={reference} onChange={(e) => setReference(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Translation</Label>
                <Select value={translation} onValueChange={setTranslation}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NIV">NIV</SelectItem>
                    <SelectItem value="KJV">KJV</SelectItem>
                    <SelectItem value="NLT">NLT</SelectItem>
                    <SelectItem value="ESV">ESV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Verse text *</Label>
                <Textarea placeholder="Type or paste the verse..." value={verseText} onChange={(e) => setVerseText(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Encouragement note (optional)</Label>
                <Textarea placeholder="Why this verse spoke to you..." value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[60px]" />
              </div>
              <Button onClick={handleAdd} className="w-full" variant="peaceful">Share with Family</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {scriptures.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">
              No scriptures shared yet. Encourage your family with a verse.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {scriptures.map((s) => (
            <Card key={s.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-5 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">{s.verseReference}</span>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{s.translation}</span>
                </div>
                <p className="text-sm text-foreground italic leading-relaxed">"{s.verseText}"</p>
                {s.note && (
                  <p className="text-sm text-muted-foreground">{s.note}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <span>Shared by {s.sharedBy}</span>
                  <span>·</span>
                  <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyScriptures;
