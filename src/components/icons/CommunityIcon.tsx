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
      {/* Enlarged cross */}
      <path d="M9 8.5h6" />
      <path d="M12 5v6" />
      {/* Door */}
      <path d="M14 22v-4a2 2 0 0 0-4 0v4" />
      {/* Steeple body */}
      <path d="M18 22V5.618a1 1 0 0 0-.553-.894l-4.553-2.277a2 2 0 0 0-1.788 0L6.553 4.724A1 1 0 0 0 6 5.618V22" />
      {/* Side wings */}
      <path d="m18 7 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.618a1 1 0 0 1 .553-.894L6 7" />
    </svg>
  )
);
CommunityIcon.displayName = "CommunityIcon";

export default CommunityIcon;