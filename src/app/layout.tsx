import type { Metadata } from "next";
import { Geist, Geist_Mono, IBM_Plex_Mono, Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* The marketing surface runs on Inter + IBM Plex Mono (see .brand-surface). */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "FitFlow — Train Smart, Live Stronger",
  description:
    "Your AI-powered fitness coach. Build personalized workout plans, track progress, and train smarter with FitFlow.",
  applicationName: "FitFlow",
  icons: {
    icon: [
      { url: "/brand/fitflow-icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/brand/fitflow-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-hidden">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
