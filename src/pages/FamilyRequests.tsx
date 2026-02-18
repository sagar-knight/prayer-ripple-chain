import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
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
import {
  Heart,
  Plus,
  Users,
  CheckCircle,
  Clock,
  Calendar,
  StickyNote,
  Archive,
  ChevronRight,
  Bell,
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";

export interface FamilyRequest {
  id: string;
  personName: string;
  relationship: string;
  title: string;
  description: string;
  category: string;
  status: "active" | "archived";
  createdAt: string;
  reminderEnabled: boolean;
  reminderTimeLocal: string;
  prayerLog: string[];
  notes: FamilyRequestNote[];
}

export interface FamilyRequestNote {
  id: string;
  noteText: string;
  createdAt: string;
}

const CATEGORIES = ["health", "peace", "guidance", "faith", "family", "work", "grief", "other"];

const FamilyRequests = () => {
  const [requests, setRequests] = useLocalStorage<FamilyRequest[]>("pf-family-requests", []);
  const [filter, setFilter] = useState<"active" | "archived">("active");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const { toast } = useToast();

  // Form state
  const [form, setForm] = useState({
    personName: "",
    relationship: "",
    title: "",
    description: "",
    category: "family",
    reminderEnabled: false,
    reminderTimeLocal: "08:00",
  });

  const today = new Date().toISOString().slice(0, 10);
  const filtered = requests.filter((r) => r.status === filter);
  const selected = requests.find((r) => r.id === selectedId);

  const handleAdd = () => {
    if (!form.personName.trim() || !form.title.trim()) {
      toast({ title: "Please fill in name and title", variant: "destructive" });
      return;
    }
    const newReq: FamilyRequest = {
      id: crypto.randomUUID(),
      personName: form.personName.trim(),
      relationship: form.relationship.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      status: "active",
      createdAt: new Date().toISOString(),
      reminderEnabled: form.reminderEnabled,
      reminderTimeLocal: form.reminderTimeLocal,
      prayerLog: [],
      notes: [],
    };
    setRequests((prev) => [newReq, ...prev]);
    setForm({ personName: "", relationship: "", title: "", description: "", category: "family", reminderEnabled: false, reminderTimeLocal: "08:00" });
    setShowAdd(false);
    toast({ title: "Family request added 🙏" });
  };

  const markPrayedToday = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id || r.prayerLog.includes(today)) return r;
        return { ...r, prayerLog: [...r.prayerLog, today] };
      })
    );
    toast({ title: "Marked as prayed today ✨", duration: 2000 });
  };

  const archiveRequest = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "archived" } : r))
    );
    setSelectedId(null);
  };

  const addNote = () => {
    if (!selectedId || !noteText.trim()) return;
    const note: FamilyRequestNote = {
      id: crypto.randomUUID(),
      noteText: noteText.trim(),
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedId ? { ...r, notes: [note, ...r.notes] } : r
      )
    );
    setNoteText("");
    toast({ title: "Note added", duration: 2000 });
  };

  // Detail view
  if (selected) {
    const prayedToday = selected.prayerLog.includes(today);
    const daysSinceStart = Math.max(
      1,
      Math.floor(
        (Date.now() - new Date(selected.createdAt).getTime()) / 86400000
      )
    );

    return (
      <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" className="mb-4 gap-1" onClick={() => setSelectedId(null)}>
            ← Back to Family Requests
          </Button>

          <Card className="mb-6 animate-gentle-fade">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-playfair text-xl">{selected.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    For {selected.personName}
                    {selected.relationship && ` (${selected.relationship})`}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">{selected.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selected.description && (
                <p className="text-sm text-muted-foreground">{selected.description}</p>
              )}

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Prayed {selected.prayerLog.length} of {daysSinceStart} days
                  </span>
                  <span className="text-primary font-medium">
                    {Math.round((selected.prayerLog.length / daysSinceStart) * 100)}%
                  </span>
                </div>
                <Progress value={(selected.prayerLog.length / daysSinceStart) * 100} className="h-2" />
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Started {new Date(selected.createdAt).toLocaleDateString()}
                </span>
                {selected.prayerLog.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last: {selected.prayerLog[selected.prayerLog.length - 1]}
                  </span>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant={prayedToday ? "outline" : "peaceful"}
                  size="sm"
                  className="gap-1"
                  disabled={prayedToday}
                  onClick={() => markPrayedToday(selected.id)}
                >
                  <CheckCircle className="h-4 w-4" />
                  {prayedToday ? "Prayed today" : "Mark prayed today"}
                </Button>
                {selected.status === "active" && (
                  <Button variant="ghost" size="sm" onClick={() => archiveRequest(selected.id)}>
                    <Archive className="h-4 w-4 mr-1" /> Archive
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="animate-gentle-fade">
            <CardHeader>
              <CardTitle className="font-playfair text-lg flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-primary" />
                Notes & Journal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note, reflection, or update..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="min-h-[60px]"
                />
                <Button variant="peaceful" size="sm" onClick={addNote} disabled={!noteText.trim()}>
                  Add
                </Button>
              </div>

              {selected.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No notes yet. Add your first reflection above.
                </p>
              ) : (
                <div className="space-y-3">
                  {selected.notes.map((note) => (
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
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-gradient-peaceful py-12 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 animate-gentle-fade">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-playfair text-2xl md:text-3xl font-bold text-foreground mb-2">
            Family Requests
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            A private space to track prayers for your family and loved ones.
          </p>
        </div>

        {/* Add button + filter */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Button
              variant={filter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("active")}
            >
              Active ({requests.filter((r) => r.status === "active").length})
            </Button>
            <Button
              variant={filter === "archived" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("archived")}
            >
              Archived
            </Button>
          </div>

          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button variant="peaceful" size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> Add Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-playfair">Add Family Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Person's name *</Label>
                  <Input
                    placeholder="e.g. Mom, Uncle David"
                    value={form.personName}
                    onChange={(e) => setForm((f) => ({ ...f, personName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Relationship (optional)</Label>
                  <Input
                    placeholder="e.g. Mother, Brother"
                    value={form.relationship}
                    onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Prayer request title *</Label>
                  <Input
                    placeholder="What to pray for"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Details (optional)</Label>
                  <Textarea
                    placeholder="Additional details..."
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label>Daily reminder</Label>
                  </div>
                  <Switch
                    checked={form.reminderEnabled}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, reminderEnabled: v }))}
                  />
                </div>
                <Button onClick={handleAdd} className="w-full" variant="peaceful">
                  Add Family Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">
                {filter === "active"
                  ? "No family requests yet. Add your first one above."
                  : "No archived requests."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((req, i) => {
              const prayedToday = req.prayerLog.includes(today);
              return (
                <Card
                  key={req.id}
                  className="cursor-pointer hover:shadow-peaceful transition-all animate-gentle-fade"
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => setSelectedId(req.id)}
                >
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {req.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs capitalize shrink-0">
                            {req.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          For {req.personName}
                          {req.relationship && ` · ${req.relationship}`}
                          {" · "}
                          Prayed {req.prayerLog.length} days
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!prayedToday && req.status === "active" && (
                          <Button
                            variant="peaceful"
                            size="sm"
                            className="gap-1 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              markPrayedToday(req.id);
                            }}
                          >
                            <CheckCircle className="h-3 w-3" />
                            Pray
                          </Button>
                        )}
                        {prayedToday && (
                          <Badge className="bg-primary/10 text-primary text-xs gap-1">
                            <CheckCircle className="h-3 w-3" /> Done
                          </Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyRequests;
