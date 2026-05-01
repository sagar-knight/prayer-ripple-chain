import { cn } from "@/lib/utils";

interface PrayerForwardLogoProps {
  className?: string;
  title?: string;
}

/**
 * PrayerForward icon: red cross with a white arrow emerging from behind it.
 * Pure SVG so it stays crisp at any size and the background is fully transparent.
 */
export const PrayerForwardLogo = ({ className, title = "PrayerForward" }: PrayerForwardLogoProps) => (
  <svg
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label={title}
    className={cn("shrink-0", className)}
  >
    <title>{title}</title>
    {/* White arrow (drawn first so the cross sits on top on the left side) */}
    <path
      d="M22 28 H46 V20 L60 32 L46 44 V36 H22 Z"
      fill="#FFFFFF"
      stroke="#1F2937"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    {/* Red cross */}
    <path
      d="M26 6 H34 V26 H50 V34 H34 V58 H26 V34 H14 V26 H26 Z"
      fill="#DC2626"
    />
  </svg>
);

export default PrayerForwardLogo;
