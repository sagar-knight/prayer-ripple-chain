import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { scaleSqrt } from "d3-scale";

// TopoJSON of the world (countries-110m), hosted CDN.
const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";

// Approximate centroids for common ISO-2 country codes used as map markers.
// Keeps things lightweight (no extra geo lib). Unknown codes fall back to a list.
const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  US: [-98.5, 39.8], CA: [-106.3, 56.1], MX: [-102.5, 23.6], BR: [-51.9, -14.2],
  AR: [-63.6, -38.4], CL: [-71.5, -35.6], CO: [-74.3, 4.6], PE: [-75.0, -9.2],
  VE: [-66.6, 6.4], EC: [-78.2, -1.8], GB: [-3.4, 55.4], IE: [-8.2, 53.4],
  FR: [2.2, 46.2], DE: [10.5, 51.2], ES: [-3.7, 40.5], PT: [-8.2, 39.4],
  IT: [12.6, 41.9], NL: [5.3, 52.1], BE: [4.5, 50.5], CH: [8.2, 46.8],
  AT: [14.6, 47.5], PL: [19.1, 51.9], SE: [18.6, 60.1], NO: [8.5, 60.5],
  DK: [9.5, 56.3], FI: [25.7, 61.9], RU: [105.3, 61.5], UA: [31.2, 48.4],
  TR: [35.2, 39.0], GR: [21.8, 39.1], EG: [30.8, 26.8], SA: [45.1, 23.9],
  AE: [53.8, 23.4], IL: [34.8, 31.0], IR: [53.7, 32.4], IQ: [43.7, 33.2],
  ZA: [22.9, -30.6], NG: [8.7, 9.1], KE: [37.9, -0.0], ET: [40.5, 9.1],
  GH: [-1.0, 7.9], TZ: [34.9, -6.4], UG: [32.3, 1.4], MA: [-7.1, 31.8],
  IN: [78.9, 20.6], PK: [69.3, 30.4], BD: [90.4, 23.7], LK: [80.8, 7.9],
  CN: [104.2, 35.9], JP: [138.3, 36.2], KR: [127.8, 36.0], TW: [120.9, 23.7],
  TH: [100.9, 15.9], VN: [108.3, 14.1], PH: [121.8, 12.9], ID: [113.9, -0.8],
  MY: [101.9, 4.2], SG: [103.8, 1.4], AU: [134.5, -25.7], NZ: [171.8, -41.0],
  XX: [0, 0],
};

export interface CountryStat {
  country_code: string;
  country: string;
  prayers?: number;
  forwards?: number;
  participants?: number;
}

interface Props {
  data: CountryStat[];
  metric?: "prayers" | "forwards" | "participants";
  originCode?: string | null;
}

const WorldRippleMap = ({ data, metric = "prayers", originCode }: Props) => {
  const [hover, setHover] = useState<CountryStat | null>(null);
  const [selected, setSelected] = useState<CountryStat | null>(null);

  const points = useMemo(() => {
    return data
      .map((d) => ({
        ...d,
        coords: COUNTRY_CENTROIDS[d.country_code] || null,
      }))
      .filter((d) => d.coords);
  }, [data]);

  const max = useMemo(
    () => Math.max(1, ...points.map((p) => Number(p[metric] || 0))),
    [points, metric],
  );
  const radius = scaleSqrt().domain([0, max]).range([4, 22]);

  if (points.length === 0) {
    return (
      <div className="rounded-xl bg-muted/40 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No country activity yet. Once people pray from around the world, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="rounded-xl overflow-hidden bg-muted/30 border border-border">
        <ComposableMap
          projectionConfig={{ scale: 140 }}
          width={800}
          height={400}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "hsl(var(--muted-foreground) / 0.2)" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {points.map((p) => {
            const value = Number(p[metric] || 0);
            const r = radius(value);
            const isOrigin = originCode && p.country_code === originCode;
            return (
              <Marker
                key={p.country_code}
                coordinates={p.coords as [number, number]}
                onMouseEnter={() => setHover(p)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setSelected(p)}
                style={{ default: { cursor: "pointer" } }}
              >
                {isOrigin && (
                  <circle
                    r={r + 8}
                    fill="hsl(var(--accent) / 0.25)"
                    className="animate-ping"
                  />
                )}
                <circle
                  r={r}
                  fill="hsl(var(--primary) / 0.7)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.2}
                />
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {hover && (
        <div className="absolute top-2 right-2 bg-background/95 border border-border rounded-md px-3 py-2 text-xs shadow-md pointer-events-none">
          <p className="font-medium">{hover.country}</p>
          <p className="text-muted-foreground">
            {hover.prayers ?? 0} prayers · {hover.forwards ?? 0} forwards
          </p>
        </div>
      )}

      {selected && (
        <div className="mt-3 rounded-lg border border-border bg-card p-3 text-sm flex items-center justify-between">
          <div>
            <p className="font-medium">{selected.country}</p>
            <p className="text-xs text-muted-foreground">
              {selected.prayers ?? 0} prayers · {selected.forwards ?? 0} forwards
              {selected.participants ? ` · ${selected.participants} participants` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default WorldRippleMap;