import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Search, CheckCircle, Ban, Flag } from "lucide-react";

interface ChurchRow {
  id: string;
  name: string;
  status: string;
  contact_email: string;
  country: string;
  created_at: string;
  verified: boolean;
  slug: string | null;
}

const AdminChurches = () => {
  const { user } = useAuth();
  const [churches, setChurches] = useState<ChurchRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = async () => {
    const { data } = await supabase.from("churches").select("*").order("created_at", { ascending: false });
    setChurches(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const logAction = async (action: string, churchId: string) => {
    await supabase.from("admin_audit_log").insert({
      actor_id: user?.id || "unknown",
      action,
      target_type: "church",
      target_id: churchId,
    });
    toast({ title: `Church ${action}` });
    load();
  };

  const filtered = churches.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.contact_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Church Oversight</h1>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search churches..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <p className="text-sm text-muted-foreground">{filtered.length} churches</p>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.contact_email} · {c.country} · {new Date(c.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
                      {c.verified && <Badge variant="outline" className="text-green-700">Verified</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => logAction("approve_church", c.id)} className="gap-1">
                      <CheckCircle className="w-3 h-3" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => logAction("suspend_church", c.id)} className="gap-1">
                      <Ban className="w-3 h-3" /> Suspend
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => logAction("flag_church", c.id)} className="gap-1">
                      <Flag className="w-3 h-3" /> Flag
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

export default AdminChurches;
