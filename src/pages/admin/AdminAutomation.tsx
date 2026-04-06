import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface Rule {
  id: string;
  name: string;
  description: string | null;
  rule_type: string;
  conditions: any;
  enabled: boolean;
  priority: number;
}

const typeColors: Record<string, string> = {
  auto_approve: "bg-green-100 text-green-800",
  auto_deny: "bg-red-100 text-red-800",
  send_to_review: "bg-yellow-100 text-yellow-800",
};

const AdminAutomation = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from("automation_rules").select("*").order("priority", { ascending: false });
    setRules(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (rule: Rule) => {
    await supabase.from("automation_rules").update({ enabled: !rule.enabled, updated_at: new Date().toISOString() }).eq("id", rule.id);
    await supabase.from("admin_audit_log").insert({
      actor_id: user?.id || "unknown",
      action: rule.enabled ? "disable_rule" : "enable_rule",
      target_type: "automation_rule",
      target_id: rule.id,
    });
    toast({ title: `Rule ${rule.enabled ? "disabled" : "enabled"}` });
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Automation Rules</h1>
      <p className="text-muted-foreground text-sm">Enable or disable moderation automation rules. Uncertain content always goes to manual review.</p>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {rules.map((r) => (
            <Card key={r.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{r.name}</p>
                      <Badge className={typeColors[r.rule_type] || ""}>{r.rule_type.replace("_", " ")}</Badge>
                      <Badge variant="outline">Priority: {r.priority}</Badge>
                    </div>
                    {r.description && <p className="text-sm text-muted-foreground">{r.description}</p>}
                    <p className="text-xs text-muted-foreground font-mono">{JSON.stringify(r.conditions)}</p>
                  </div>
                  <Switch checked={r.enabled} onCheckedChange={() => toggle(r)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAutomation;
