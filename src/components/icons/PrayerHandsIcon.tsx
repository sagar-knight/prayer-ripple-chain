import * as React from "react";

// Custom folded-hands / prayer icon
export const PrayerHandsIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Left hand */}
      <path d="M12 21 7 17c-1-1-1-3 0-4l3-5c1-1 1-3 2-4" />
      {/* Right hand */}
      <path d="M12 21 17 17c1-1 1-3 0-4l-3-5c-1-1-1-3-2-4" />
      {/* Left cuff */}
      <path d="M7 17 4 19v3h8" />
      {/* Right cuff */}
      <path d="M17 17 20 19v3h-8" />
    </svg>
  )
);
PrayerHandsIcon.displayName = "PrayerHandsIcon";

export default PrayerHandsIcon;
