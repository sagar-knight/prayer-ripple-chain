import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Download, Trash2, Clock, Rocket, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface PlanNote {
  id: string;
  note_title: string;
  note_body: string | null;
  author: string | null;
  created_at: string;
  updated_at: string;
}

const GoLivePlan = () => {
  const [notes, setNotes] = useState<PlanNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState({ title: "", body: "" });
  const [editing, setEditing] = useState<Record<string, { title: string; body: string }>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("go_live_plan_notes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load notes");
    setNotes((data || []) as PlanNote[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!draft.title.trim()) { toast.error("Title is required"); return; }
    const { error } = await supabase.from("go_live_plan_notes").insert({
      note_title: draft.title.trim(),
      note_body: draft.body.trim() || null,
    });
    if (error) { toast.error("Failed to save"); return; }
    toast.success("Note saved");
    setDraft({ title: "", body: "" });
    load();
  };

  const handleSaveEdit = async (id: string) => {
    const e = editing[id];
    if (!e) return;
    const { error } = await supabase
      .from("go_live_plan_notes")
      .update({ note_title: e.title, note_body: e.body || null })
      .eq("id", id);
    if (error) { toast.error("Failed to save"); return; }
    toast.success("Note updated");
    setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    const { error } = await supabase.from("go_live_plan_notes").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Note deleted");
    load();
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Go-Live Plan", margin, y);
    y += 24;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 8;
    doc.text(`Total notes: ${notes.length}`, margin, y);
    y += 20;
    doc.setTextColor(0);

    if (notes.length === 0) {
      doc.setFontSize(12);
      doc.text("No notes yet.", margin, y);
    }

    notes.forEach((n, idx) => {
      if (y > pageHeight - margin - 60) { doc.addPage(); y = margin; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(`${idx + 1}. ${n.note_title}`, margin, y);
      y += 16;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Created: ${new Date(n.created_at).toLocaleString()}`, margin, y);
      y += 12;
      doc.setTextColor(0);

      if (n.note_body) {
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(n.note_body, maxWidth);
        lines.forEach((line: string) => {
          if (y > pageHeight - margin) { doc.addPage(); y = margin; }
          doc.text(line, margin, y);
          y += 14;
        });
      }
      y += 14;
    });

    doc.save(`go-live-plan-${new Date().toISOString().split("T")[0]}.pdf`);
    toast.success("PDF downloaded");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" /> Go-Live Plan
          </h3>
          <p className="text-xs text-muted-foreground">
            {notes.length} {notes.length === 1 ? "note" : "notes"} · timestamped & private to admins
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleDownloadPdf} disabled={notes.length === 0}>
          <Download className="w-4 h-4 mr-1.5" /> Download PDF
        </Button>
      </div>

      {/* New note form */}
      <Card className="p-4 rounded-xl space-y-3">
        <div className="text-sm font-medium flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add note
        </div>
        <Input
          placeholder="Note title (e.g. Pre-launch checklist)"
          value={draft.title}
          onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
        />
        <Textarea
          placeholder="Details, steps, decisions, owners..."
          rows={4}
          value={draft.body}
          onChange={e => setDraft(d => ({ ...d, body: e.target.value }))}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={handleAdd}>
            <Save className="w-4 h-4 mr-1.5" /> Save note
          </Button>
        </div>
      </Card>

      {/* Notes list */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
      ) : notes.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground rounded-xl">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No notes yet. Add your first Go-Live Plan note above.
        </Card>
      ) : (
        <div className="space-y-2">
          {notes.map(n => {
            const e = editing[n.id];
            const isEditing = !!e;
            return (
              <Card key={n.id} className="p-4 rounded-xl space-y-2">
                {isEditing ? (
                  <>
                    <Input
                      value={e.title}
                      onChange={ev => setEditing(prev => ({ ...prev, [n.id]: { ...e, title: ev.target.value } }))}
                    />
                    <Textarea
                      rows={4}
                      value={e.body}
                      onChange={ev => setEditing(prev => ({ ...prev, [n.id]: { ...e, body: ev.target.value } }))}
                    />
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(prev => { const x = { ...prev }; delete x[n.id]; return x; })}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => handleSaveEdit(n.id)}>
                        <Save className="w-4 h-4 mr-1.5" /> Save
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm">{n.note_title}</div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Created {new Date(n.created_at).toLocaleString()}</span>
                          {n.updated_at !== n.created_at && (
                            <Badge variant="outline" className="text-[10px]">
                              Updated {new Date(n.updated_at).toLocaleString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditing(prev => ({ ...prev, [n.id]: { title: n.note_title, body: n.note_body || "" } }))}
                        >
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(n.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {n.note_body && (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{n.note_body}</p>
                    )}
                  </>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoLivePlan;