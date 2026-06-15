import { Globe, Share2 } from "lucide-react";
import PrayerHandsIcon from "@/components/icons/PrayerHandsIcon";

interface Props {
  prayers: number;
  countries: number;
  locations?: number;
  shares: number;
}

const PrayerRippleStats = ({ prayers, countries, shares }: Props) => {
  const items = [
    { icon: PrayerHandsIcon, value: prayers, label: prayers === 1 ? "Prayer" : "Prayers" },
    { icon: Globe, value: countries, label: countries === 1 ? "Country" : "Countries" },
    { icon: Share2, value: shares, label: shares === 1 ? "Share" : "Shares" },
  ];

  return (
    <div className="rounded-2xl border bg-card/60 p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground/70 text-center mb-3">
        Prayer Ripple
      </p>
      <div className="grid grid-cols-3 gap-2 text-center">
        {items.map((i) => {
          const Icon = i.icon;
          return (
            <div key={i.label} className="flex flex-col items-center">
              <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-full border bg-background/80" aria-hidden>
                <Icon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
              </div>
              <div className="text-base font-semibold text-foreground tabular-nums">
                {i.value.toLocaleString()}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {i.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrayerRippleStats;