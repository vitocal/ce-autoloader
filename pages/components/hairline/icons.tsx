/**
 * The three icons the command output uses.
 *
 * The upstream source imports them from `lucide-react`; this repo has no React
 * icon package, so the same paths are kept here as plain components with the
 * same defaults (24×24 viewBox, `stroke="currentColor"`, `fill="none"`).
 * `className` is the sizing hook — the component passes Tailwind `size-*`
 * utilities, which `hairline.css` provides.
 */
import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

const base: IconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
};

export function ChevronRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function Square(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </svg>
  );
}

export function X(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
