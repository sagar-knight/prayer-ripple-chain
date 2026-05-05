import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Eye, Search, ShieldCheck } from "lucide-react";

interface QueueItem {
  id: string;
  content_type: string;
  content_id: string;
  source_type: string;
  title: string | null;
  content_preview: string | null;
  submitted_by: string | null;
  reason: string | null;
  moderation_source: string;
  confidence_score: number | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  denied: "bg-red-100 text-red-800",
  "auto-approved": "bg-green-50 text-green-700",
  "auto-denied": "bg-red-50 text-red-700",
  flagged: "bg-orange-100 text-orange-800",
  hidden: "bg-gray-100 text-gray-700",
  removed: "bg-red-200 text-red-900",
};

const AdminModeration = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});

  const load = async () => {
    const { data } = await supabase
      .from("moderation_queue")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setItems((data as QueueItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.rpc("apply_moderation_decision", {
      _queue_id: id,
      _new_status: status,
      _notes: noteInput[id] || null,
    });
    if (error) {
      toast({ title: "Action failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Item ${status}` });
    load();
  };

  const bulkAction = async (status: string) => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    for (const id of ids) await updateStatus(id, status);
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const filtered = items.filter(
    (i) => !search || i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.content_preview?.toLowerCase().includes(search.toLowerCase()) ||
      i.reason?.toLowerCase().includes(search.toLowerCase())
  );

  const byStatus = (status: string) => filtered.filter((i) => i.status === status);

  const renderItem = (item: QueueItem) => (
    <Card key={item.id} className="mb-3">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="rounded" />
            <div>
              <p className="font-medium text-sm">{item.title || "Untitled"}</p>
              <p className="text-xs text-muted-foreground">
                {item.content_type} · {item.source_type} · {new Date(item.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge className={statusColors[item.status] || ""}>{item.status}</Badge>
        </div>
        {item.content_preview && (
          <p className="text-sm text-muted-foreground bg-muted p-2 rounded line-clamp-3">{item.content_preview}</p>
        )}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {item.reason && <span>Reason: {item.reason}</span>}
          {item.moderation_source && <span>Source: {item.moderation_source}</span>}
          {item.confidence_score != null && <span>Score: {item.confidence_score}</span>}
          {item.submitted_by && <span>By: {item.submitted_by.slice(0, 8)}…</span>}
        </div>
        <Textarea
          placeholder="Admin notes (optional)"
          value={noteInput[item.id] || ""}
          onChange={(e) => setNoteInput({ ...noteInput, [item.id]: e.target.value })}
          className="text-sm h-16"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => updateStatus(item.id, "approved")} className="gap-1">
            <CheckCircle className="w-3 h-3" /> Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={() => updateStatus(item.id, "denied")} className="gap-1">
            <XCircle className="w-3 h-3" /> Deny
          </Button>
          <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "hidden")}>Hide</Button>
          <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "removed")}>Remove</Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-primary/15 text-primary items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Content Moderation</h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                Review flagged content · <span className="font-medium text-foreground">{items.length}</span> total in queue
              </p>
            </div>
          </div>
          {selected.size > 0 && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => bulkAction("approved")} className="rounded-lg">Approve ({selected.size})</Button>
              <Button size="sm" variant="destructive" onClick={() => bulkAction("denied")} className="rounded-lg">Deny ({selected.size})</Button>
            </div>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="rounded-xl border bg-muted/30 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search content..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-background" />
        </div>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <Tabs defaultValue="pending">
          <TabsList className="bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="pending">Pending ({byStatus("pending").length})</TabsTrigger>
            <TabsTrigger value="flagged">Flagged ({byStatus("flagged").length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({byStatus("approved").length})</TabsTrigger>
            <TabsTrigger value="denied">Denied ({byStatus("denied").length})</TabsTrigger>
            <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">{byStatus("pending").map(renderItem)}</TabsContent>
          <TabsContent value="flagged">{byStatus("flagged").map(renderItem)}</TabsContent>
          <TabsContent value="approved">{byStatus("approved").map(renderItem)}</TabsContent>
          <TabsContent value="denied">{byStatus("denied").map(renderItem)}</TabsContent>
          <TabsContent value="all">{filtered.map(renderItem)}</TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminModeration;
