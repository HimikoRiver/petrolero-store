import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function HeartIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill={filled ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" {...props}>
      <path d="M20.6 5.65a5.15 5.15 0 0 0-7.3 0L12 6.95l-1.3-1.3a5.16 5.16 0 0 0-7.3 7.3L12 21.15l8.6-8.2a5.15 5.15 0 0 0 0-7.3Z"/>
    </svg>
  );
}

export function CompareIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
      stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" {...props}>
      <path d="M4 6h11M4 12h11M4 18h8"/>
      <path d="M19 10v10M14 15h10"/>
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" {...props}>
      <path d="m5 9 7 7 7-7"/>
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
      stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" {...props}>
      <path d="M4 12h16m-7-7 7 7-7 7"/>
    </svg>
  );
}
