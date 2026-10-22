import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppStatusProvider } from "@/contexts/LanguageContext";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SessionExpiredNotification } from "@/components/ui/feedback/SessionExpiredNotification";
import { ErrorBoundary } from "@/components/ui/data-display/ErrorBoundary";
import { SparklinChat } from "@/components/sparklin/SparklinChat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const lora = Lora({ variable: "--font-lora", subsets: ["latin"], weight: ["400", "600"] });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://sparkclean.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SparkClean - Turn Cleaning Into an RPG Quest",
    template: "%s | SparkClean",
  },
  description:
    "Turn boring chores into rewarding quests, track your XP, defeat clutter bosses, and build a home you're proud of.",
  applicationName: "SparkClean",
  authors: [{ name: "SparkClean Team" }],
  keywords: [
    "cleaning planner",
    "gamified chores",
    "habit tracker",
    "RPG cleaning",
    "home organizer",
    "chore gamification",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "SparkClean",
    title: "SparkClean - Turn Cleaning Into an RPG Quest",
    description:
      "Stop procrastinating. Turn daily chores into rewarding quests, earn XP, defeat clutter bosses, and level up your kingdom.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SparkClean - Turn Cleaning Into an RPG Quest",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SparkClean - Turn Cleaning Into an RPG Quest",
    description:
      "Stop procrastinating. Turn daily chores into rewarding quests, earn XP, defeat clutter bosses, and level up your kingdom.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SparkClean",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E3A8A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} antialiased bg-base text-dark`}
      >
        <LanguageProvider>
          <SessionProvider>
            <AppStatusProvider>
              <ThemeProvider>
                <ErrorBoundary>
                  <SessionExpiredNotification />
                  {children}
                  <SparklinChat />
                </ErrorBoundary>
              </ThemeProvider>
            </AppStatusProvider>
          </SessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
