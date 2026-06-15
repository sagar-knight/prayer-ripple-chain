interface Props {
  prayers: number;
  countries: number;
  locations?: number;
  shares: number;
}

const PrayerRippleStats = ({ prayers, countries, shares }: Props) => {
  const items = [
    { icon: "🙏", value: prayers, label: prayers === 1 ? "Prayer" : "Prayers" },
    { icon: "🌎", value: countries, label: countries === 1 ? "Country" : "Countries" },
    { icon: "↗", value: shares, label: shares === 1 ? "Share" : "Shares" },
  ];

  return (
    <div className="rounded-2xl border bg-card/60 p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground/70 text-center mb-3">
        Prayer Ripple
      </p>
      <div className="grid grid-cols-3 gap-2 text-center">
        {items.map((i) => (
          <div key={i.label} className="flex flex-col items-center">
            <div className="text-lg leading-none mb-1" aria-hidden>{i.icon}</div>
            <div className="text-base font-semibold text-foreground tabular-nums">
              {i.value.toLocaleString()}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {i.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrayerRippleStats;