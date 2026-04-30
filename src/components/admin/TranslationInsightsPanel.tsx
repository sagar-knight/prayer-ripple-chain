import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Languages } from "lucide-react";
import { getLanguageByCode } from "@/data/languages";

interface LangRow {
  code: string | null;
  count: number;
}
interface PrayerRow {
  prayer_request_id: string;
  count: number;
}

const TranslationInsightsPanel = () => {
  const [total, setTotal] = useState(0);
  const [cacheHits, setCacheHits] = useState(0);
  const [failures, setFailures] = useState(0);
  const [topLangs, setTopLangs] = useState<LangRow[]>([]);
  const [topPrayers, setTopPrayers] = useState<PrayerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Pull recent translation events.
      const { data: events } = await (supabase.from as any)("app_events")
        .select("event_type, entity_id, metadata_json, created_at")
        .in("event_type", [
          "translation_requested",
          "translation_cache_hit",
          "translation_failed",
        ])
        .order("created_at", { ascending: false })
        .limit(1000);

      const rows = (events as any[]) || [];
      const requested = rows.filter(
        (r) => r.event_type === "translation_requested"
      );
      const hits = rows.filter((r) => r.event_type === "translation_cache_hit");
      const fails = rows.filter((r) => r.event_type === "translation_failed");

      setTotal(requested.length + hits.length);
      setCacheHits(hits.length);
      setFailures(fails.length);

      const langMap = new Map<string | null, number>();
      [...requested, ...hits].forEach((r) => {
        const code = r?.metadata_json?.target_language_code || null;
        langMap.set(code, (langMap.get(code) || 0) + 1);
      });
      setTopLangs(
        Array.from(langMap.entries())
          .map(([code, count]) => ({ code, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)
      );

      const prayerMap = new Map<string, number>();
      [...requested, ...hits].forEach((r) => {
        const id = r.entity_id;
        if (!id) return;
        prayerMap.set(id, (prayerMap.get(id) || 0) + 1);
      });
      setTopPrayers(
        Array.from(prayerMap.entries())
          .map(([prayer_request_id, count]) => ({ prayer_request_id, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      );

      setLoading(false);
    };
    load();
  }, []);

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Languages className="h-5 w-5 text-primary" />
          Translation Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Total requests</div>
                <div className="text-xl font-semibold">{total}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Cache hits</div>
                <div className="text-xl font-semibold">{cacheHits}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Failures</div>
                <div className="text-xl font-semibold">{failures}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Top target languages</h4>
              {topLangs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No data yet.</p>
              ) : (
                <div className="space-y-1">
                  {topLangs.map((r) => {
                    const lang = getLanguageByCode(r.code);
                    return (
                      <div
                        key={r.code || "unknown"}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <span>{lang ? `${lang.name} (${lang.code})` : r.code || "Unknown"}</span>
                        <span className="font-medium">{r.count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Most translated prayers</h4>
              {topPrayers.length === 0 ? (
                <p className="text-xs text-muted-foreground">No data yet.</p>
              ) : (
                <div className="space-y-1">
                  {topPrayers.map((r) => (
                    <div
                      key={r.prayer_request_id}
                      className="flex items-center justify-between text-xs py-1 font-mono"
                    >
                      <span className="truncate">{r.prayer_request_id}</span>
                      <span className="font-medium">{r.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TranslationInsightsPanel;