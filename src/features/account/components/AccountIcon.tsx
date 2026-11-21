import type { SVGProps } from "react";

type IconName =
  | "overview" | "orders" | "heart" | "pin" | "user" | "settings" | "lock"
  | "help" | "return" | "arrow" | "bag" | "mail" | "chevron" | "check" | "shield";

export default function AccountIcon({
  name, size = 22, ...props
}: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  const common = {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.55,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    ...props,
  };
  switch (name) {
    case "overview":
      return <svg {...common}><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="5" rx="1" /><rect x="13" y="10" width="8" height="11" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /></svg>;
    case "orders":
      return <svg {...common}><path d="m3 7 9-4 9 4v10l-9 4-9-4V7Z" /><path d="m3 7 9 4 9-4M12 11v10M7.5 5l9 4" /></svg>;
    case "heart":
      return <svg {...common}><path d="M20.3 5.6a5 5 0 0 0-7.1 0L12 6.8l-1.2-1.2a5 5 0 0 0-7.1 7.1L12 21l8.3-8.3a5 5 0 0 0 0-7.1Z" /></svg>;
    case "pin":
      return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
    case "user":
      return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2" /></svg>;
    case "settings":
      return <svg {...common}><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="2.5" fill="currentColor" stroke="none"/><circle cx="16" cy="17" r="2.5" fill="currentColor" stroke="none"/></svg>;
    case "lock":
      return <svg {...common}><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></svg>;
    case "help":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.5 2.5 0 0 1 4.4 1.6c0 1.8-2.2 2-2.2 3.7M12 18h.01" /></svg>;
    case "return":
      return <svg {...common}><path d="M9 7H4V2M4 7a9 9 0 1 1-1 6M4 7l4-3" /><path d="M12 8v5l3 2" /></svg>;
    case "arrow":
      return <svg {...common}><path d="M4 12h16m-7-7 7 7-7 7" /></svg>;
    case "bag":
      return <svg {...common}><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 9V6a3 3 0 1 1 6 0v3" /></svg>;
    case "mail":
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 7 9-7" /></svg>;
    case "chevron":
      return <svg {...common}><path d="m9 5 7 7-7 7" /></svg>;
    case "check":
      return <svg {...common}><path d="m4 12 5 5L20 6" /></svg>;
    case "shield":
      return <svg {...common}><path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" /><path d="m9 12 2 2 4-4" /></svg>;
  }
}
