/** @type {import('next').NextConfig} */
// GitHub Pages: STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/flutlicht27-app npx next build  (Ergebnis in out/)
// Vorschau als Artifact (relative Pfade): ARTIFACT=1 NEXT_PUBLIC_BASE_PATH=. npx next build
const staticExport = process.env.STATIC_EXPORT === "1";
const artifact = process.env.ARTIFACT === "1";
const nextConfig = {
  reactStrictMode: true,
  ...(staticExport ? { output: "export", basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "", images: { unoptimized: true }, trailingSlash: true } : {}),
  ...(artifact ? { output: "export", assetPrefix: "./", images: { unoptimized: true } } : {}),
};
export default nextConfig;
