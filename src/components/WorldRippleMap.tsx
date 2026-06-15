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
  isLoading?: boolean;
  error?: Error | null;
  emptyMessage?: string;
}

const WorldRippleMap = ({ data = [], metric = "prayers", originCode, isLoading = false, error = null, emptyMessage }: Props) => {
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

  // Map ISO-2 country codes from data → metric value, used to highlight regions.
  const valueByCode = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of data || []) {
      const v = Number((d as any)[metric] || 0);
      if (d.country_code) m[d.country_code.toUpperCase()] = v;
    }
    return m;
  }, [data, metric]);

  const nameByCode = useMemo(() => {
    const m: Record<string, string> = {};
    for (const d of data || []) {
      if (d.country_code) m[d.country_code.toUpperCase()] = d.country;
    }
    return m;
  }, [data]);

  // World-atlas topojson uses numeric ISO-3166-1 ids — map to ISO-2 for lookup.
  const NUM_TO_ISO2: Record<string, string> = {
    "004":"AF","008":"AL","012":"DZ","032":"AR","036":"AU","040":"AT","050":"BD","056":"BE","068":"BO","076":"BR",
    "100":"BG","124":"CA","152":"CL","156":"CN","158":"TW","170":"CO","188":"CR","191":"HR","196":"CY","203":"CZ",
    "208":"DK","214":"DO","218":"EC","222":"SV","231":"ET","233":"EE","246":"FI","250":"FR","268":"GE","276":"DE",
    "288":"GH","300":"GR","320":"GT","328":"GY","332":"HT","340":"HN","344":"HK","348":"HU","352":"IS","356":"IN",
    "360":"ID","364":"IR","368":"IQ","372":"IE","376":"IL","380":"IT","388":"JM","392":"JP","398":"KZ","400":"JO",
    "404":"KE","410":"KR","414":"KW","417":"KG","418":"LA","422":"LB","428":"LV","434":"LY","440":"LT","442":"LU",
    "450":"MG","454":"MW","458":"MY","466":"ML","478":"MR","484":"MX","504":"MA","508":"MZ","512":"OM","516":"NA",
    "524":"NP","528":"NL","554":"NZ","558":"NI","562":"NE","566":"NG","578":"NO","586":"PK","591":"PA","598":"PG",
    "600":"PY","604":"PE","608":"PH","616":"PL","620":"PT","624":"GW","630":"PR","634":"QA","642":"RO","643":"RU",
    "646":"RW","682":"SA","686":"SN","688":"RS","694":"SL","702":"SG","703":"SK","704":"VN","705":"SI","706":"SO",
    "710":"ZA","716":"ZW","724":"ES","728":"SS","729":"SD","736":"SD","748":"SZ","752":"SE","756":"CH","760":"SY",
    "762":"TJ","764":"TH","768":"TG","780":"TT","788":"TN","792":"TR","795":"TM","800":"UG","804":"UA","818":"EG",
    "826":"GB","834":"TZ","840":"US","854":"BF","858":"UY","860":"UZ","862":"VE","887":"YE","894":"ZM",
  };

  const getGeoIso2 = (geo: any): string | null => {
    const id = geo?.id != null ? String(geo.id).padStart(3, "0") : null;
    if (id && NUM_TO_ISO2[id]) return NUM_TO_ISO2[id];
    const p = geo?.properties || {};
    return (p.iso_a2 || p.ISO_A2 || p.ISO_A2_EH || null);
  };

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

      <div className="rounded-xl overflow-hidden bg-[#4FB4F0] border border-border/60 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#4FB4F0]/70 backdrop-blur-sm pointer-events-none">
            <div className="flex items-center gap-2 text-xs text-white/95 bg-[#1e6fa8]/80 px-3 py-1.5 rounded-full border border-white/20">
              <span className="h-2 w-2 rounded-full bg-white/80 animate-pulse" />
              Loading prayer map...
            </div>
          </div>
        )}
        {error && !isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#4FB4F0]/80 backdrop-blur-sm pointer-events-none px-4">
            <p className="text-xs text-white/95 text-center max-w-xs">
              We couldn't load the live map right now. It will reconnect on its own.
            </p>
          </div>
        )}
        <ComposableMap
          projectionConfig={{ scale: 145 }}
          width={800}
          height={400}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies
                .filter((geo) => geo.properties?.name !== "Antarctica")
                .map((geo) => {
                  const iso2 = getGeoIso2(geo);
                  const value = iso2 ? (valueByCode[iso2] || 0) : 0;
                  const isOrigin = !!(originCode && iso2 === originCode.toUpperCase());
                  const hasData = value > 0;
                  const fill = isOrigin
                    ? "#f59e0b"
                    : hasData
                      ? "#6FBF4F"
                      : "#9BD27A";
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="#5aa83a"
                      strokeWidth={hasData ? 0.9 : 0.6}
                      onMouseEnter={() => {
                        if (!iso2) return;
                        const country = nameByCode[iso2] || geo.properties?.name || iso2;
                        if (hasData) {
                          setHover({
                            country_code: iso2,
                            country,
                            prayers: metric === "prayers" ? value : undefined,
                            forwards: metric === "forwards" ? value : undefined,
                            participants: metric === "participants" ? value : undefined,
                          });
                        }
                      }}
                      onMouseLeave={() => setHover(null)}
                      style={{
                        default: { outline: "none", transition: "fill 0.2s ease" },
                        hover:   { outline: "none", fill: hasData ? "#5aa83a" : "#7fc25a", cursor: hasData ? "pointer" : "default" },
                        pressed: { outline: "none", fill: "#5aa83a" },
                      }}
                    />
                  );
                })
            }
          </Geographies>

          {points.map((p, idx) => {
            const value = Number(p[metric] || 0);
            const r = Math.max(radius(value), 11);
            const isOrigin = originCode && p.country_code === originCode;
            const delay = `${(idx % 6) * 0.4}s`;
            const label = value > 999 ? `${Math.floor(value / 1000)}k+` : String(value);
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
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={Math.max(9, Math.min(13, r * 0.95))}
                  fontWeight={700}
                  fill="#ffffff"
                  style={{ pointerEvents: "none", fontFamily: "Inter, system-ui, sans-serif" }}
                >
                  {label}
                </text>
              </Marker>
            );
          })}
        </ComposableMap>
        {points.length === 0 && !isLoading && !error && (
          <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
            <p className="text-xs text-white/95 bg-[#1e6fa8]/90 px-3 py-1.5 rounded-full border border-white/30">
              {emptyMessage ?? "As prayers spread across more places, lights will appear on the map."}
            </p>
          </div>
        )}
      </div>

      {hover && (
        <div className="absolute top-2 right-2 bg-background/95 border border-border rounded-md px-3 py-1.5 text-xs shadow-md pointer-events-none">
          {(() => {
            const v = Number((hover as any)[metric] || 0);
            const noun = metric === "forwards"
              ? (v === 1 ? "share" : "shares")
              : metric === "participants"
                ? (v === 1 ? "person praying" : "people praying")
                : (v === 1 ? "prayer" : "prayers");
            return (
              <p className="font-medium">
                {v.toLocaleString()} {noun} from {hover.country}
              </p>
            );
          })()}
        </div>
      )}

      {selected && (
        <div className="mt-3 rounded-lg border border-border bg-card p-3 text-sm flex items-center justify-between">
          {(() => {
            const v = Number((selected as any)[metric] || 0);
            const noun = metric === "forwards"
              ? (v === 1 ? "share" : "shares")
              : metric === "participants"
                ? (v === 1 ? "person praying" : "people praying")
                : (v === 1 ? "prayer" : "prayers");
            return (
              <p>
                <span className="font-medium">{v.toLocaleString()}</span>{" "}
                <span className="text-muted-foreground">{noun} from {selected.country}</span>
              </p>
            );
          })()}
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