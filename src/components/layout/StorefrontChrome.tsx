import type { ReactNode } from "react";
import SiteFooter from "@/components/layout/footer/SiteFooter";
import "./storefrontTheme.css";
import "./StorefrontChrome.css";

/** Shared page shell. The one site header is mounted in RootLayout. */
export default function StorefrontChrome({ children }: { children: ReactNode }) {
  return (
    <div className="petrolero-inner-pages">
      {children}
      <SiteFooter />
    </div>
  );
}
