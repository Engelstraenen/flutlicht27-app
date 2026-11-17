import type { Metadata, Viewport } from "next";
import "./fonts.css";
import "./globals.css";
import { asset } from "@/lib/asset";

export const metadata: Metadata = {
  title: "FLUTLICHT 27 – App (Demo)",
  description: "Live-Belegung der 8 Courts, Court buchen, offene Matches, Rangliste, Americano, Schlägerverleih und Bar an den Court. Demo-App der Padelhalle FLUTLICHT 27.",
  manifest: asset("/manifest.webmanifest"),
  appleWebApp: { capable: true, title: "FLUTLICHT 27", statusBarStyle: "black-translucent" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0d12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Archivo lokal (Achsen wdth 100–125, wght 400–900), Pfad über asset() → funktioniert auch im Unterordner
const FONT_FACES = ["normal", "italic"]
  .map((st) => `@font-face{font-family:"Archivo Variable";font-style:${st};font-display:swap;font-weight:400 900;font-stretch:100% 125%;src:url(${asset(`/fonts/archivo-${st}.woff2`)}) format("woff2-variations");}`)
  .join("");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <style dangerouslySetInnerHTML={{ __html: FONT_FACES }} />
        <link rel="preload" href={asset("/fonts/archivo-italic.woff2")} as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href={asset("/fonts/archivo-normal.woff2")} as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
