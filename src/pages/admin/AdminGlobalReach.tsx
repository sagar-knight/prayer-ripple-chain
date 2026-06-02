import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, TrendingUp, Star, Share2 } from "lucide-react";
import WorldRippleMap, { CountryStat } from "@/components/WorldRippleMap";
import { getCountryByCode } from "@/data/countries";

interface Analytics {
  days: number;
  top_prayers_by_country: { country_code: string; country: string; prayers: number }[];
  requests_by_country: { country_code: string; country: string; requests: number }[];
  forwards_by_country: { country_code: string; country: string; forwards: number }[];
  total_countries_reached: number;
  growth: { day: string; prayers: number; forwards: number }[];
}

const RANGES = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "1 year", value: 365 },
];

const AdminGlobalReach = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: payload, error } = await supabase.rpc(
        "get_global_reach_analytics" as any,
        { _days: days } as any,
      );
      if (!error) setData(payload as unknown as Analytics);
      setLoading(false);
    };
    load();
  }, [days]);

  const mapData: CountryStat[] = (data?.top_prayers_by_country || []).map((r) => {
    const fwd = data?.forwards_by_country.find((f) => f.country_code === r.country_code);
    return {
      country_code: r.country_code,
      country: r.country || getCountryByCode(r.country_code)?.name || r.country_code,
      prayers: r.prayers,
      forwards: fwd?.forwards ?? 0,
    };
  });

  const maxGrowth = Math.max(1, ...(data?.growth || []).map((g) => g.prayers + g.forwards));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="w-6 h-6 text-primary" />
          Global Reach Analytics
        </h1>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <Button
              key={r.value}
              size="sm"
              variant={days === r.value ? "default" : "outline"}
              onClick={() => setDays(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        All metrics aggregated at the country level only. No personal or location data is shown.
      </p>

      {loading || !data ? (
        <p className="text-muted-foreground">Loading analytics...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat icon={Globe} label="Countries reached" value={data.total_countries_reached} />
            <Stat icon={Star} label="Prayers offered" value={sum(data.top_prayers_by_country, "prayers")} />
            <Stat icon={Share2} label="Forwards" value={sum(data.forwards_by_country, "forwards")} />
            <Stat icon={TrendingUp} label="Requests created" value={sum(data.requests_by_country, "requests")} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">World ripple map</CardTitle>
            </CardHeader>
            <CardContent>
              <WorldRippleMap data={mapData} metric="prayers" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RankingCard title="Top countries by prayers" items={data.top_prayers_by_country} valueKey="prayers" />
            <RankingCard title="Requests by country" items={data.requests_by_country} valueKey="requests" />
            <RankingCard title="Forwards by country" items={data.forwards_by_country} valueKey="forwards" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Growth trend</CardTitle>
            </CardHeader>
            <CardContent>
              {data.growth.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity in this range.</p>
              ) : (
                <div className="flex items-end gap-1 h-32">
                  {data.growth.map((g) => {
                    const total = g.prayers + g.forwards;
                    const h = (total / maxGrowth) * 100;
                    return (
                      <div
                        key={g.day}
                        className="flex-1 bg-primary/70 rounded-t hover:bg-primary transition-colors"
                        style={{ height: `${Math.max(2, h)}%` }}
                        title={`${g.day}: ${g.prayers} prayers · ${g.forwards} forwards`}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: typeof Globe; label: string; value: number }) => (
  <Card>
    <CardContent className="pt-5 pb-5">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
        <Icon className="w-4 h-4" /> {label}
      </div>
      <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
    </CardContent>
  </Card>
);

const RankingCard = ({
  title,
  items,
  valueKey,
}: {
  title: string;
  items: any[];
  valueKey: string;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-sm">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No data yet.</p>
      ) : (
        <div className="space-y-1">
          {items.slice(0, 10).map((r) => {
            const c = getCountryByCode(r.country_code);
            return (
              <div key={r.country_code} className="flex items-center justify-between text-sm py-1">
                <span className="flex items-center gap-2">
                  <span>{c?.flag || "🏳️"}</span>
                  <span>{c?.name || r.country || r.country_code}</span>
                </span>
                <span className="font-medium tabular-nums">{r[valueKey]}</span>
              </div>
            );
          })}
        </div>
      )}
    </CardContent>
  </Card>
);

const sum = (rows: any[], key: string) =>
  (rows || []).reduce((acc, r) => acc + Number(r[key] || 0), 0);

export default AdminGlobalReach;