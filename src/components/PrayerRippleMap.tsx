import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { RippleLocationRow } from "@/lib/prayerLocations";

interface Props {
  token: string;
  locations: RippleLocationRow[];
}

/**
 * Renders approximate prayer locations on a calm light Mapbox map.
 * Locations are clustered when close together; single points show a
 * soft glowing dot with a gentle ripple pulse.
 *
 * PRIVACY: locations passed in are already coarsened upstream; this
 * component never receives or displays raw GPS coordinates.
 */
const PrayerRippleMap = ({ token, locations }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Initialize the map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !token) return;
    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [0, 20],
      zoom: 1.2,
      attributionControl: false,
      cooperativeGestures: true,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("ripple", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 45,
      });

      // Country-aggregate source: one bubble per country with prayer count.
      map.addSource("ripple-countries", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // Cluster bubble — soft Horizon Blue.
      map.addLayer({
        id: "ripple-clusters",
        type: "circle",
        source: "ripple",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#5D8AA8",
          "circle-opacity": 0.85,
          "circle-radius": [
            "step",
            ["get", "point_count"],
            18,
            10, 24,
            50, 32,
          ],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "ripple-cluster-count",
        type: "symbol",
        source: "ripple",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12,
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
        },
        paint: { "text-color": "#ffffff" },
      });

      // Single point — outer glow + inner dot.
      map.addLayer({
        id: "ripple-point-glow",
        type: "circle",
        source: "ripple",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#5D8AA8",
          "circle-opacity": 0.22,
          "circle-radius": 18,
          "circle-blur": 0.6,
        },
      });
      map.addLayer({
        id: "ripple-point",
        type: "circle",
        source: "ripple",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#5D8AA8",
          "circle-radius": 6,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      // Country bubble — visible when zoomed out, hidden once zoomed in
      // so individual points/clusters can take over.
      map.addLayer({
        id: "ripple-country-bubble",
        type: "circle",
        source: "ripple-countries",
        maxzoom: 4,
        paint: {
          "circle-color": "#5D8AA8",
          "circle-opacity": 0.9,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-radius": [
            "interpolate", ["linear"], ["get", "count"],
            1, 16,
            10, 22,
            100, 30,
            1000, 40,
          ],
        },
      });
      map.addLayer({
        id: "ripple-country-count",
        type: "symbol",
        source: "ripple-countries",
        maxzoom: 4,
        layout: {
          "text-field": ["to-string", ["get", "count"]],
          "text-size": 13,
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          "text-allow-overlap": true,
        },
        paint: { "text-color": "#ffffff" },
      });
      map.addLayer({
        id: "ripple-country-label",
        type: "symbol",
        source: "ripple-countries",
        maxzoom: 4,
        layout: {
          "text-field": ["get", "country"],
          "text-size": 11,
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          "text-offset": [0, 1.8],
          "text-anchor": "top",
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#1f2937",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.2,
        },
      });

      map.on("click", "ripple-clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["ripple-clusters"] });
        const clusterId = features[0]?.properties?.cluster_id;
        const src = map.getSource("ripple") as mapboxgl.GeoJSONSource;
        if (clusterId != null && src && (src as any).getClusterExpansionZoom) {
          (src as any).getClusterExpansionZoom(clusterId, (err: unknown, zoom: number) => {
            if (err || !features[0]) return;
            const geom = features[0].geometry as GeoJSON.Point;
            map.easeTo({ center: geom.coordinates as [number, number], zoom });
          });
        }
      });
      map.on("mouseenter", "ripple-clusters", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "ripple-clusters", () => (map.getCanvas().style.cursor = ""));

      // Render any locations already provided at load time.
      applyData(map, locationsRef.current);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Keep latest locations in a ref so the load handler can read them.
  const locationsRef = useRef(locations);
  locationsRef.current = locations;

  // Update data and fit bounds when locations change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.isStyleLoaded()) {
      map.once("load", () => applyData(map, locations));
      return;
    }
    applyData(map, locations);
  }, [locations]);

  return <div ref={containerRef} className="h-full w-full rounded-xl overflow-hidden" />;
};

function applyData(map: mapboxgl.Map, rows: RippleLocationRow[]) {
  const src = map.getSource("ripple") as mapboxgl.GeoJSONSource | undefined;
  const countrySrc = map.getSource("ripple-countries") as mapboxgl.GeoJSONSource | undefined;
  if (!src) return;

  const features: GeoJSON.Feature[] = rows
    .filter((r) => Number.isFinite(r.approximate_lat) && Number.isFinite(r.approximate_lng))
    .map((r) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [Number(r.approximate_lng), Number(r.approximate_lat)] },
      properties: { id: r.id },
    }));

  src.setData({ type: "FeatureCollection", features });

  // Build per-country aggregate bubbles at the centroid of their points.
  if (countrySrc) {
    const byCountry = new Map<string, { lat: number; lng: number; count: number }>();
    for (const r of rows) {
      if (!r.country) continue;
      const lat = Number(r.approximate_lat);
      const lng = Number(r.approximate_lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const entry = byCountry.get(r.country);
      if (entry) {
        entry.lat += lat;
        entry.lng += lng;
        entry.count += 1;
      } else {
        byCountry.set(r.country, { lat, lng, count: 1 });
      }
    }
    const countryFeatures: GeoJSON.Feature[] = Array.from(byCountry.entries()).map(
      ([country, v]) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [v.lng / v.count, v.lat / v.count] },
        properties: { country, count: v.count },
      }),
    );
    countrySrc.setData({ type: "FeatureCollection", features: countryFeatures });
  }

  if (features.length === 0) return;
  if (features.length === 1) {
    const [lng, lat] = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];
    map.easeTo({ center: [lng, lat], zoom: 4, duration: 600 });
    return;
  }
  const bounds = new mapboxgl.LngLatBounds();
  for (const f of features) {
    const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates as [number, number];
    bounds.extend([lng, lat]);
  }
  map.fitBounds(bounds, { padding: 48, maxZoom: 6, duration: 600 });
}

export default PrayerRippleMap;