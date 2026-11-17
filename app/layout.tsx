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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <link rel="preload" href={asset("/fonts/archivo-italic.woff2")} as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href={asset("/fonts/archivo-normal.woff2")} as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
