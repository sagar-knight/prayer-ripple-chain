import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Search, AlertTriangle, Ban, RotateCcw } from "lucide-react";

interface UserProfile {
  id: string;
  display_name: string | null;
  commitment_level: string;
  created_at: string;
  report_count?: number;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setProfiles(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const logAction = async (action: string, targetId: string, reason?: string) => {
    await supabase.from("admin_audit_log").insert({
      actor_id: user?.id || "unknown",
      action,
      target_type: "user",
      target_id: targetId,
      reason,
    });
    await supabase.from("app_events").insert({
      event_type: `admin_${action}`,
      actor_user_id: user?.id,
      entity_type: "user",
      entity_id: targetId,
    });
    toast({ title: `User ${action}` });
  };

  const filtered = profiles.filter(
    (p) => !search || p.display_name?.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">User Management</h1>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <p className="text-sm text-muted-foreground">{filtered.length} users</p>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.display_name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {p.id.slice(0, 8)}… · Joined: {new Date(p.created_at).toLocaleDateString()} · Level: {p.commitment_level}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => logAction("warn", p.id)} className="gap-1">
                      <AlertTriangle className="w-3 h-3" /> Warn
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => logAction("suspend", p.id)} className="gap-1">
                      <Ban className="w-3 h-3" /> Suspend
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => logAction("restore", p.id)} className="gap-1">
                      <RotateCcw className="w-3 h-3" /> Restore
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
