import { cn } from "@/lib/utils";
import logoImage from "@/assets/prayer-forward-logo.svg";

interface PrayerForwardLogoProps {
  className?: string;
  title?: string;
}

/**
 * PrayerForward icon: uploaded brand mark (red cross with white arrow).
 */
export const PrayerForwardLogo = ({ className, title = "PrayerForward" }: PrayerForwardLogoProps) => (
  <img
    src={logoImage}
    alt={title}
    className={cn("shrink-0 object-contain", className)}
  />
);

export default PrayerForwardLogo;
