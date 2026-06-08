import type { RippleStats } from "@/lib/prayerLocations";

interface Props {
  stats: RippleStats;
}

const PrayerRippleStats = ({ stats }: Props) => {
  if (stats.total <= 0) return null;
  const items = [
    { label: stats.total === 1 ? "Person praying with you" : "People praying with you", value: stats.total },
    { label: stats.regions === 1 ? "Region reached" : "Regions reached", value: stats.regions },
    { label: stats.countries === 1 ? "Country reached" : "Countries reached", value: stats.countries },
  ].filter((i) => i.value > 0);
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      {items.map((i) => (
        <div key={i.label} className="rounded-lg border bg-card/60 px-2 py-3">
          <div className="text-lg font-semibold text-foreground">{i.value.toLocaleString()}</div>
          <div className="text-[11px] leading-tight text-muted-foreground">{i.label}</div>
        </div>
      ))}
    </div>
  );
};

export default PrayerRippleStats;