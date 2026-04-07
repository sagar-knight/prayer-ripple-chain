import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Search, AlertTriangle, Ban, RotateCcw, FlaskConical, UserCheck, UserX } from "lucide-react";

interface UserProfile {
  id: string;
  display_name: string | null;
  commitment_level: string;
  created_at: string;
  is_test_account: boolean;
  test_role_label: string | null;
  exclude_from_analytics: boolean;
  internal_only: boolean;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showTestAccounts, setShowTestAccounts] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setProfiles((data as UserProfile[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

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

  const toggleTestAccount = async (profile: UserProfile) => {
    const newVal = !profile.is_test_account;
    const { error } = await supabase.from("profiles").update({
      is_test_account: newVal,
      exclude_from_analytics: newVal,
      internal_only: newVal,
    }).eq("id", profile.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await logAction(newVal ? "mark_test_account" : "unmark_test_account", profile.id);
    toast({ title: newVal ? "Marked as test account" : "Unmarked as test account" });
    load();
  };

  const updateTestLabel = async (profileId: string, label: string) => {
    await supabase.from("profiles").update({ test_role_label: label || null }).eq("id", profileId);
    load();
  };

  const filtered = profiles.filter((p) => {
    // Filter by test account toggle
    if (!showTestAccounts && p.is_test_account) return false;
    if (!search) return true;
    return p.display_name?.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search) || p.test_role_label?.toLowerCase().includes(search.toLowerCase());
  });

  const testCount = profiles.filter((p) => p.is_test_account).length;
  const realCount = profiles.filter((p) => !p.is_test_account).length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">User Management</h1>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by name, ID, or label..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} users shown · {realCount} real · {testCount} test
        </p>
        <div className="flex items-center gap-2">
          <Switch id="show-test" checked={showTestAccounts} onCheckedChange={setShowTestAccounts} />
          <Label htmlFor="show-test" className="text-sm cursor-pointer flex items-center gap-1">
            <FlaskConical className="w-3.5 h-3.5" /> Show Test Accounts
          </Label>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.id} className={p.is_test_account ? "border-dashed border-amber-400/50" : ""}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{p.display_name || "Anonymous"}</p>
                      {p.is_test_account && (
                        <Badge variant="outline" className="text-xs border-amber-400 text-amber-600 gap-1">
                          <FlaskConical className="w-3 h-3" /> Test
                        </Badge>
                      )}
                      {p.test_role_label && (
                        <Badge variant="secondary" className="text-xs">{p.test_role_label}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ID: {p.id.slice(0, 8)}… · Joined: {new Date(p.created_at).toLocaleDateString()} · Level: {p.commitment_level}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant={p.is_test_account ? "default" : "outline"}
                      onClick={() => toggleTestAccount(p)}
                      className="gap-1"
                    >
                      <FlaskConical className="w-3 h-3" />
                      {p.is_test_account ? "Unmark Test" : "Mark Test"}
                    </Button>
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
