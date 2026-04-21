import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Search, CheckCircle, XCircle, Trash2, Flag } from "lucide-react";

interface Report {
  id: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  actor_user_id: string | null;
  metadata_json: any;
  created_at: string;
}

const AdminReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("app_events")
      .select("*")
      .eq("event_type", "content_reported")
      .order("created_at", { ascending: false })
      .limit(200);
    setReports(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (report: Report, action: string) => {
    await supabase.from("admin_audit_log").insert({
      actor_id: user?.id || "unknown",
      action: `report_${action}`,
      target_type: report.entity_type || "unknown",
      target_id: report.entity_id || report.id,
      reason: `Report ${action}`,
    });
    toast({ title: `Report ${action}` });
  };

  const filtered = reports.filter(
    (r) => !search ||
      r.entity_type?.toLowerCase().includes(search.toLowerCase()) ||
      r.entity_id?.toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(r.metadata_json)?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="hidden sm:flex w-12 h-12 rounded-xl bg-primary/15 text-primary items-center justify-center shrink-0 shadow-sm">
            <Flag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              <span className="font-medium text-foreground">{filtered.length}</span> reports · Review user-submitted content reports
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="rounded-xl border bg-muted/30 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-background" />
        </div>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No reports found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const meta = r.metadata_json as any;
            return (
              <Card key={r.id} className="rounded-xl hover:shadow-md transition-shadow">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{r.entity_type} — {r.entity_id?.slice(0, 8)}…</p>
                      <p className="text-xs text-muted-foreground">
                        Reported by: {r.actor_user_id?.slice(0, 8)}… · {new Date(r.created_at).toLocaleDateString()}
                      </p>
                      {meta?.reason && <Badge variant="outline" className="mt-1">{meta.reason}</Badge>}
                      {meta?.details && <p className="text-sm text-muted-foreground mt-1">{meta.details}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleAction(r, "reviewed")} className="gap-1">
                        <CheckCircle className="w-3 h-3" /> Review
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(r, "dismissed")} className="gap-1">
                        <XCircle className="w-3 h-3" /> Dismiss
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleAction(r, "remove_content")} className="gap-1">
                        <Trash2 className="w-3 h-3" /> Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
