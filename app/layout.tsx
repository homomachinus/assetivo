import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@/app/globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-display"
});

const BASE_URL = "https://assetivo.store";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Assetivo — Digital Assets Store & Management",
    template: "%s | Assetivo",
  },
  description:
    "Assetivo adalah platform digital assets store dan management premium. Temukan, kelola, dan beli produk digital berkualitas tinggi dengan mudah.",
  keywords: [
    "digital assets",
    "assetivo",
    "produk digital",
    "toko digital",
    "aset digital",
    "template digital",
  ],
  authors: [{ name: "Assetivo", url: BASE_URL }],
  creator: "Assetivo",
  publisher: "Assetivo",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: BASE_URL,
    siteName: "Assetivo",
    title: "Assetivo — Digital Assets Store & Management",
    description:
      "Platform digital assets store dan management premium. Temukan, kelola, dan beli produk digital berkualitas tinggi.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Assetivo — Digital Assets Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Assetivo — Digital Assets Store & Management",
    description:
      "Platform digital assets store dan management premium. Produk digital berkualitas tinggi dengan harga terjangkau.",
    images: [`${BASE_URL}/og-image.png`],
    creator: "@assetivo",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />

      <body className={`${dmSans.variable} ${playfair.variable}`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
