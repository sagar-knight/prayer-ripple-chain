import { useState, useEffect, useMemo } from "react";
import { AlertTriangle, Link2, History, FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface TestLink {
  id: string; documentation_update_id: string; test_case_id: string;
  link_type: string; created_at: string;
}

interface DocUpdate {
  id: string; title: string; change_type: string; created_at: string; version_tag: string | null;
}

interface TestingImpactPanelProps {
  testCaseId?: string; // show links for a specific test case
}

const TestingImpactPanel = ({ testCaseId }: TestingImpactPanelProps) => {
  const [links, setLinks] = useState<TestLink[]>([]);
  const [updates, setUpdates] = useState<Record<string, DocUpdate>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase.from("test_case_update_links").select("*").order("created_at", { ascending: false });
      if (testCaseId) query = query.eq("test_case_id", testCaseId);
      const { data: linkData } = await query.limit(50);
      setLinks((linkData || []) as TestLink[]);

      const updateIds = [...new Set((linkData || []).map((l: any) => l.documentation_update_id))];
      if (updateIds.length > 0) {
        const { data: upData } = await supabase.from("documentation_updates").select("id, title, change_type, created_at, version_tag").in("id", updateIds);
        const m: Record<string, DocUpdate> = {};
        (upData || []).forEach((u: any) => { m[u.id] = u; });
        setUpdates(m);
      }
      setLoading(false);
    };
    load();
  }, [testCaseId]);

  const needsReviewCount = useMemo(() => links.filter(l => l.link_type === "needs_review").length, [links]);

  if (loading) return <div className="text-xs text-muted-foreground py-2">Loading impact data...</div>;
  if (links.length === 0) return null;

  return (
    <Card className="p-3 space-y-2">
      <h4 className="text-xs font-semibold flex items-center gap-1.5">
        <Link2 className="w-3.5 h-3.5 text-primary" />
        Update Impact
        {needsReviewCount > 0 && (
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] ml-1">
            <AlertTriangle className="w-3 h-3 mr-0.5" /> {needsReviewCount} needs review
          </Badge>
        )}
      </h4>
      <div className="space-y-1">
        {links.slice(0, 10).map(l => {
          const up = updates[l.documentation_update_id];
          return up ? (
            <div key={l.id} className="flex items-center gap-2 text-[11px]">
              <Badge variant="outline" className="text-[9px]">{l.link_type.replace("_", " ")}</Badge>
              <span className="truncate flex-1">{up.title}</span>
              {up.version_tag && <span className="text-muted-foreground">v{up.version_tag}</span>}
              <span className="text-muted-foreground">{new Date(up.created_at).toLocaleDateString()}</span>
            </div>
          ) : null;
        })}
      </div>
    </Card>
  );
};

export default TestingImpactPanel;
