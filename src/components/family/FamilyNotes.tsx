import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export interface FamilyTestimony {
  id: string;
  noteText: string;
  createdBy: string;
  createdAt: string;
}

interface Props {
  notes: FamilyTestimony[];
  onAdd: (text: string, createdBy: string) => void;
  currentUser: string;
}

const FamilyNotes = ({ notes, onAdd, currentUser }: Props) => {
  const [showAdd, setShowAdd] = useState(false);
  const [text, setText] = useState("");
  const { toast } = useToast();

  const handleAdd = () => {
    if (!text.trim()) return;
    onAdd(text.trim(), currentUser);
    setText("");
    setShowAdd(false);
    toast({ title: "Note added 🙏" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Share testimonies, updates, and encouragement with your family.
        </p>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button variant="peaceful" size="sm" className="gap-1 shrink-0">
              <Plus className="h-4 w-4" /> Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-playfair">Add a Note or Testimony</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Share a testimony, prayer update, or encouragement..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[120px]"
              />
              <Button onClick={handleAdd} className="w-full" variant="peaceful" disabled={!text.trim()}>
                Share with Family
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <StickyNote className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">
              No notes or testimonies yet. Share your first encouragement.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <Card key={n.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-5 pb-4 space-y-2">
                <p className="text-sm text-foreground leading-relaxed">{n.noteText}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{n.createdBy}</span>
                  <span>·</span>
                  <span>
                    {new Date(n.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyNotes;
