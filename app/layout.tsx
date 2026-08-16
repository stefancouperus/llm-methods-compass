import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource-variable/source-sans-3";
import "@fontsource-variable/source-serif-4";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "localhost:3000";
  const protocol = incoming.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const description =
    "An evidence-led advisor for selecting open-weight LLM systems, evaluation designs, and local or HPC resource plans for qualitative analysis of written or transcribed text.";

  return {
    metadataBase,
    title: "LLM Methods Compass — Qualitative Text Research Advisor",
    description,
    openGraph: {
      title: "LLM Methods Compass — Qualitative Text Research Advisor",
      description,
      type: "website",
      images: [{ url: "/og-v2.png", width: 1731, height: 909, alt: "LLM Methods Compass — evidence-led open-weight LLM advice for qualitative text research" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "LLM Methods Compass — Qualitative Text Research Advisor",
      description,
      images: ["/og-v2.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
