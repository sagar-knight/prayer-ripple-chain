import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, XCircle, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { resolveAvatarUrl } from "@/lib/avatar";

interface Row {
  id: string;
  display_name: string | null;
  pending_avatar_url: string | null;
  updated_at: string;
  signedUrl?: string | null;
}

const PendingAvatarsPanel = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, pending_avatar_url, updated_at")
      .eq("avatar_status", "pending")
      .not("pending_avatar_url", "is", null)
      .order("updated_at", { ascending: false })
      .limit(100);
    const list = (data as Row[]) || [];
    const withUrls = await Promise.all(
      list.map(async (r) => ({
        ...r,
        signedUrl: await resolveAvatarUrl(r.pending_avatar_url),
      }))
    );
    setRows(withUrls);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const decide = async (id: string, decision: "approved" | "rejected") => {
    setBusy(id);
    const { error } = await supabase.rpc("review_pending_avatar", {
      _profile_id: id,
      _decision: decision,
      _reason: decision === "rejected" ? reason[id] || "Did not meet guidelines" : null,
    });
    setBusy(null);
    if (error) {
      toast({ title: "Action failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: `Avatar ${decision}` });
    setRows((r) => r.filter((row) => row.id !== id));
  };

  if (loading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No pending profile photos.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <Card key={r.id}>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                {r.signedUrl && <AvatarImage src={r.signedUrl} alt={r.display_name || "Pending"} />}
                <AvatarFallback className="bg-muted">
                  <UserRound className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{r.display_name || "Unnamed user"}</p>
                <p className="text-xs text-muted-foreground">
                  Submitted {new Date(r.updated_at).toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">User: {r.id.slice(0, 8)}…</p>
              </div>
            </div>
            <Input
              placeholder="Rejection reason (optional)"
              value={reason[r.id] || ""}
              onChange={(e) => setReason({ ...reason, [r.id]: e.target.value })}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => decide(r.id, "approved")}
                disabled={busy === r.id}
                className="gap-1"
              >
                <CheckCircle className="w-3 h-3" /> Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => decide(r.id, "rejected")}
                disabled={busy === r.id}
                className="gap-1"
              >
                <XCircle className="w-3 h-3" /> Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PendingAvatarsPanel;
