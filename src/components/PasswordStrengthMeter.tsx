import { useMemo } from "react";

interface PasswordStrengthMeterProps {
  password: string;
}

function getStrength(pw: string): { score: number; label: string; color: string; checks: { label: string; met: boolean }[] } {
  const checks = [
    { label: "At least 6 characters", met: pw.length >= 6 },
    { label: "Uppercase letter", met: /[A-Z]/.test(pw) },
    { label: "Lowercase letter", met: /[a-z]/.test(pw) },
    { label: "Number", met: /\d/.test(pw) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(pw) },
  ];
  const score = checks.filter((c) => c.met).length;

  const levels: Record<number, { label: string; color: string }> = {
    0: { label: "", color: "bg-muted" },
    1: { label: "Very weak", color: "bg-destructive" },
    2: { label: "Weak", color: "bg-orange-500" },
    3: { label: "Fair", color: "bg-yellow-500" },
    4: { label: "Strong", color: "bg-emerald-500" },
    5: { label: "Very strong", color: "bg-emerald-600" },
  };

  return { score, ...levels[score], checks };
}

const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const { score, label, color, checks } = useMemo(() => getStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="space-y-2 pt-1">
      {/* Bar */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < score ? color : "bg-muted"}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${score <= 2 ? "text-destructive" : "text-muted-foreground"}`}>{label}</p>

      {/* Checklist */}
      <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-1">
            <span className={c.met ? "text-emerald-600" : "text-muted-foreground/50"}>
              {c.met ? "✓" : "○"}
            </span>
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrengthMeter;
