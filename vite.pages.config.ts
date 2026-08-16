import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function pagesBasePath() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return "/";

  const pathname = new URL(siteUrl).pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export default defineConfig({
  base: pagesBasePath(),
  plugins: [react()],
  build: {
    outDir: "pages-dist",
    emptyOutDir: true,
  },
});
