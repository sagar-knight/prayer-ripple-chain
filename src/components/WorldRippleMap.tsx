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

const WorldRippleMap = ({ data = [], metric = "prayers", originCode }: Props) => {
  const [hover, setHover] = useState<CountryStat | null>(null);
  const [selected, setSelected] = useState<CountryStat | null>(null);

  const points = useMemo(() => {
    return (data || [])
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

  return (
    <div className="relative">
      <style>{`
        @keyframes light-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.25); }
        }
        @keyframes light-halo {
          0%   { opacity: 0.45; transform: scale(0.9); }
          100% { opacity: 0;    transform: scale(2.4); }
        }
        .prayer-light-core   { transform-origin: center; transform-box: fill-box; animation: light-pulse 3.2s ease-in-out infinite; }
        .prayer-light-halo   { transform-origin: center; transform-box: fill-box; animation: light-halo  3.2s ease-out  infinite; }
        .prayer-light-origin { filter: drop-shadow(0 0 6px hsl(var(--accent))); }
      `}</style>

      <div className="rounded-xl overflow-hidden bg-[#0a1428] border border-border/60 relative">
        <ComposableMap
          projectionConfig={{ scale: 145 }}
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
                  fill="#27384f"
                  stroke="#4a6280"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none", transition: "fill 0.2s ease" },
                    hover:   { outline: "none", fill: "#3a567a", cursor: "pointer" },
                    pressed: { outline: "none", fill: "#3a567a" },
                  }}
                />
              ))
            }
          </Geographies>

          {points.map((p, idx) => {
            const value = Number(p[metric] || 0);
            const r = radius(value);
            const isOrigin = originCode && p.country_code === originCode;
            const delay = `${(idx % 6) * 0.4}s`;
            return (
              <Marker
                key={p.country_code}
                coordinates={p.coords as [number, number]}
                onMouseEnter={() => setHover(p)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setSelected(p)}
                style={{ default: { cursor: "pointer" } }}
              >
                <circle
                  r={r + 4}
                  fill={isOrigin ? "hsl(var(--accent) / 0.35)" : "hsl(var(--primary) / 0.3)"}
                  className="prayer-light-halo"
                  style={{ animationDelay: delay }}
                />
                <circle
                  r={r}
                  fill={isOrigin ? "hsl(var(--accent))" : "hsl(var(--primary))"}
                  className={`prayer-light-core ${isOrigin ? "prayer-light-origin" : ""}`}
                  style={{ animationDelay: delay, filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.8))" }}
                />
              </Marker>
            );
          })}
        </ComposableMap>
        {points.length === 0 && (
          <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
            <p className="text-xs text-foreground/70 bg-[#0a1428]/80 px-3 py-1.5 rounded-full border border-border/40">
              As people begin praying around the world, lights will appear here.
            </p>
          </div>
        )}
      </div>

      {hover && (
        <div className="absolute top-2 right-2 bg-background/95 border border-border rounded-md px-3 py-1.5 text-xs shadow-md pointer-events-none">
          <p className="font-medium">
            {(hover.prayers ?? 0).toLocaleString()} {hover.prayers === 1 ? "prayer" : "prayers"} from {hover.country}
          </p>
        </div>
      )}

      {selected && (
        <div className="mt-3 rounded-lg border border-border bg-card p-3 text-sm flex items-center justify-between">
          <p>
            <span className="font-medium">{(selected.prayers ?? 0).toLocaleString()}</span>{" "}
            <span className="text-muted-foreground">
              {selected.prayers === 1 ? "prayer" : "prayers"} from {selected.country}
            </span>
          </p>
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