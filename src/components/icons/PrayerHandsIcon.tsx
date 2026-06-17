import * as React from "react";

// Two hands pressed together in prayer
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
      <path d="M12 21v-8" />
      <path d="M12 13 9 8c-1-1.5-2.5-2-4-1L3 9c-1.5 1-1.5 3 0 4l5 5c1 1 2.5 1 3.5 0L12 17" />
      <path d="M9 8c.5-1.5 1.5-3 3-3" />
      {/* Right hand */}
      <path d="M12 13 15 8c1-1.5 2.5-2 4-1l2 2c1.5 1 1.5 3 0 4l-5 5c-1 1-2.5 1-3.5 0L12 17" />
      <path d="M15 8c-.5-1.5-1.5-3-3-3" />
      {/* Fingers together */}
      <path d="M12 5v8" />
    </svg>
  )
);
PrayerHandsIcon.displayName = "PrayerHandsIcon";

export default PrayerHandsIcon;
