import type { Metadata } from "next";
import { Geist, Geist_Mono, Marck_Script } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const marckScript = Marck_Script({
  variable: "--font-marck-script",
  subsets: ["cyrillic", "latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Petrolero — моторные масла",
  description: "Моторные масла Petrolero. Современные технологии защиты двигателя.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} ${marckScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
