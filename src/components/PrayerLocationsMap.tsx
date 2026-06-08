import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { CountryStat } from "@/components/WorldRippleMap";

// Country centroids (lat, lng) — used to position bubbles.
const CENTROIDS: Record<string, [number, number]> = {
  US: [39.8, -98.5], CA: [56.1, -106.3], MX: [23.6, -102.5], BR: [-14.2, -51.9],
  AR: [-38.4, -63.6], CL: [-35.6, -71.5], CO: [4.6, -74.3], PE: [-9.2, -75.0],
  VE: [6.4, -66.6], EC: [-1.8, -78.2], GB: [55.4, -3.4], IE: [53.4, -8.2],
  FR: [46.2, 2.2], DE: [51.2, 10.5], ES: [40.5, -3.7], PT: [39.4, -8.2],
  IT: [41.9, 12.6], NL: [52.1, 5.3], BE: [50.5, 4.5], CH: [46.8, 8.2],
  AT: [47.5, 14.6], PL: [51.9, 19.1], SE: [60.1, 18.6], NO: [60.5, 8.5],
  DK: [56.3, 9.5], FI: [61.9, 25.7], RU: [61.5, 105.3], UA: [48.4, 31.2],
  TR: [39.0, 35.2], GR: [39.1, 21.8], EG: [26.8, 30.8], SA: [23.9, 45.1],
  AE: [23.4, 53.8], IL: [31.0, 34.8], IR: [32.4, 53.7], IQ: [33.2, 43.7],
  ZA: [-30.6, 22.9], NG: [9.1, 8.7], KE: [-0.0, 37.9], ET: [9.1, 40.5],
  GH: [7.9, -1.0], TZ: [-6.4, 34.9], UG: [1.4, 32.3], MA: [31.8, -7.1],
  IN: [20.6, 78.9], PK: [30.4, 69.3], BD: [23.7, 90.4], LK: [7.9, 80.8],
  CN: [35.9, 104.2], JP: [36.2, 138.3], KR: [36.0, 127.8], TW: [23.7, 120.9],
  TH: [15.9, 100.9], VN: [14.1, 108.3], PH: [12.9, 121.8], ID: [-0.8, 113.9],
  MY: [4.2, 101.9], SG: [1.4, 103.8], AU: [-25.7, 134.5], NZ: [-41.0, 171.8],
};

interface Props {
  data: CountryStat[];
  metric?: "prayers" | "participants" | "forwards";
}

const PrayerLocationsMap = ({ data, metric = "participants" }: Props) => {
  const points = useMemo(
    () =>
      data
        .map((d) => ({ ...d, coords: CENTROIDS[d.country_code] }))
        .filter((d) => !!d.coords),
    [data],
  );

  const max = Math.max(1, ...points.map((p) => Number(p[metric] || 0)));

  return (
    <div className="rounded-xl overflow-hidden border border-border/60">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={6}
        scrollWheelZoom={false}
        worldCopyJump
        style={{ height: "420px", width: "100%", background: "#a8d0e6" }}
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => {
          const value = Number(p[metric] || 0);
          const radius = 10 + Math.round((value / max) * 22);
          return (
            <CircleMarker
              key={p.country_code}
              center={p.coords as [number, number]}
              radius={radius}
              pathOptions={{
                color: "hsl(var(--primary))",
                weight: 2,
                fillColor: "hsl(var(--primary))",
                fillOpacity: 0.45,
              }}
            >
              <Tooltip direction="top" offset={[0, -4]} opacity={1}>
                <span className="text-xs font-medium">
                  {value.toLocaleString()} {value === 1 ? "person" : "people"} praying from {p.country}
                </span>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default PrayerLocationsMap;