import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Flag, AlertTriangle, CheckCircle, Clock, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ReportEvent {
  id: string;
  event_type: string;
  actor_user_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
  status?: "pending" | "reviewed" | "dismissed";
}

const ModerationDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("app_events")
      .select("*")
      .eq("event_type", "content_reported")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      setReports(data as unknown as ReportEvent[]);
    }
    setLoading(false);
  };

  const getStatus = (id: string): "pending" | "reviewed" | "dismissed" => {
    if (reviewedIds.has(id)) return "reviewed";
    if (dismissedIds.has(id)) return "dismissed";
    return "pending";
  };

  const markReviewed = (id: string) => {
    setReviewedIds((prev) => new Set(prev).add(id));
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast({ title: "Marked as reviewed" });
  };

  const markDismissed = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
    setReviewedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast({ title: "Report dismissed" });
  };

  const pendingReports = reports.filter((r) => getStatus(r.id) === "pending");
  const reviewedReports = reports.filter((r) => getStatus(r.id) === "reviewed");
  const dismissedReports = reports.filter((r) => getStatus(r.id) === "dismissed");

  const reasonLabel = (reason: string) => {
    switch (reason) {
      case "spam": return "Spam";
      case "abuse": return "Abuse / Harassment";
      case "inappropriate": return "Inappropriate";
      default: return reason;
    }
  };

  const entityTypeLabel = (type: string | null) => {
    switch (type) {
      case "global_prayer": return "Global Prayer";
      case "church_prayer": return "Church Prayer";
      case "family_note": return "Family Note";
      case "family_scripture": return "Family Scripture";
      default: return type ?? "Unknown";
    }
  };

  const ReportCard = ({ report }: { report: ReportEvent }) => {
    const status = getStatus(report.id);
    const meta = report.metadata_json as { reason?: string; details?: string } | null;

    return (
      <Card className="border-border/60">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-destructive/70" />
              <Badge variant={meta?.reason === "abuse" ? "destructive" : "secondary"} className="text-xs">
                {reasonLabel(meta?.reason ?? "unknown")}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {entityTypeLabel(report.entity_type)}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {format(new Date(report.created_at), "MMM d, yyyy h:mm a")}
            </span>
          </div>

          {meta?.details && (
            <p className="text-sm text-foreground/80 bg-muted/50 rounded-lg p-3">
              "{meta.details}"
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Entity: <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{report.entity_id?.slice(0, 8)}…</code></span>
            <span>·</span>
            <span>Reporter: {report.actor_user_id === "anonymous" ? "Anonymous" : report.actor_user_id?.slice(0, 8) + "…"}</span>
          </div>

          {status === "pending" && (
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => markReviewed(report.id)}>
                <Eye className="h-3.5 w-3.5" />
                Mark Reviewed
              </Button>
              <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" onClick={() => markDismissed(report.id)}>
                <CheckCircle className="h-3.5 w-3.5" />
                Dismiss
              </Button>
            </div>
          )}

          {status !== "pending" && (
            <Badge variant={status === "reviewed" ? "default" : "secondary"} className="text-xs">
              {status === "reviewed" ? "✓ Reviewed" : "Dismissed"}
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Content Moderation
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Review reported content and keep the community safe.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{pendingReports.length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{reviewedReports.length}</p>
            <p className="text-xs text-muted-foreground">Reviewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-2xl font-bold">{dismissedReports.length}</p>
            <p className="text-xs text-muted-foreground">Dismissed</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="w-full">
          <TabsTrigger value="pending" className="flex-1 gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Pending ({pendingReports.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="flex-1 gap-1.5">
            <Eye className="h-3.5 w-3.5" /> Reviewed ({reviewedReports.length})
          </TabsTrigger>
          <TabsTrigger value="dismissed" className="flex-1 gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" /> Dismissed ({dismissedReports.length})
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading reports…</div>
        ) : (
          <>
            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingReports.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-primary/40" />
                    <p>No pending reports. The community is healthy!</p>
                  </CardContent>
                </Card>
              ) : (
                pendingReports.map((r) => <ReportCard key={r.id} report={r} />)
              )}
            </TabsContent>

            <TabsContent value="reviewed" className="space-y-4 mt-4">
              {reviewedReports.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No reviewed reports yet.</p>
              ) : (
                reviewedReports.map((r) => <ReportCard key={r.id} report={r} />)
              )}
            </TabsContent>

            <TabsContent value="dismissed" className="space-y-4 mt-4">
              {dismissedReports.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No dismissed reports.</p>
              ) : (
                dismissedReports.map((r) => <ReportCard key={r.id} report={r} />)
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default ModerationDashboard;
