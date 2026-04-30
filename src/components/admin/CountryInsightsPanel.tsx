import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { getCountryByCode } from "@/data/countries";

type Row = { country_code: string | null; count: number };

function aggregate<T extends { [k: string]: any }>(rows: T[] | null, key: string): Row[] {
  const map = new Map<string | null, number>();
  (rows || []).forEach((r) => {
    const k = (r?.[key] as string | null) || null;
    map.set(k, (map.get(k) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([country_code, count]) => ({ country_code, count }))
    .sort((a, b) => b.count - a.count);
}

const CountryInsightsPanel = () => {
  const [users, setUsers] = useState<Row[]>([]);
  const [requests, setRequests] = useState<Row[]>([]);
  const [actions, setActions] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [u, r, a] = await Promise.all([
        supabase.from("profiles").select("country_code"),
        (supabase.from as any)("global_prayer_requests").select("origin_country_code"),
        (supabase.from as any)("prayer_actions")
          .select("prayer_country_code")
          .eq("action_type", "prayed"),
      ]);
      setUsers(aggregate((u.data as any) || [], "country_code"));
      setRequests(aggregate((r.data as any) || [], "origin_country_code"));
      setActions(aggregate((a.data as any) || [], "prayer_country_code"));
      setLoading(false);
    };
    load();
  }, []);

  const renderTable = (rows: Row[]) => {
    const known = rows.filter((r) => r.country_code);
    const unknown = rows.find((r) => !r.country_code)?.count ?? 0;
    const top = known.slice(0, 10);
    if (!known.length && !unknown) {
      return <p className="text-xs text-muted-foreground">No data yet.</p>;
    }
    return (
      <div className="space-y-1">
        {top.map((r) => {
          const country = getCountryByCode(r.country_code as string);
          return (
            <div
              key={r.country_code}
              className="flex items-center justify-between text-sm py-1"
            >
              <span className="flex items-center gap-2">
                <span>{country?.flag || "🏳️"}</span>
                <span>{country?.name || r.country_code}</span>
              </span>
              <span className="font-medium tabular-nums">{r.count}</span>
            </div>
          );
        })}
        {unknown > 0 && (
          <div className="flex items-center justify-between text-sm py-1 text-muted-foreground border-t border-border mt-2 pt-2">
            <span>Unknown</span>
            <span className="font-medium tabular-nums">{unknown}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          Country Insights
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Country-level activity only. No exact location data is collected.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Users by country
              </h4>
              {renderTable(users)}
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Prayer requests by country
              </h4>
              {renderTable(requests)}
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Prayers offered by country
              </h4>
              {renderTable(actions)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CountryInsightsPanel;