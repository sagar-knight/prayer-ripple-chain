import * as React from "react";

// Custom church icon with a slightly larger cross on top
export const CommunityIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
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
      {/* Prominent cross on top of steeple */}
      <path d="M12 1v6" />
      <path d="M9.5 3h5" />
      {/* Steeple body */}
      <path d="M18 22V8.5L12 5 6 8.5V22" />
      {/* Arched door */}
      <path d="M14 22v-4a2 2 0 0 0-4 0v4" />
      {/* Side wings */}
      <path d="M18 10l3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.382a1 1 0 0 1 .553-.894L6 10" />
    </svg>
  )
);
CommunityIcon.displayName = "CommunityIcon";

export default CommunityIcon;