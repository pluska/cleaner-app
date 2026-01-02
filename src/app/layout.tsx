import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SessionProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SessionExpiredNotification } from "@/components/ui/feedback/SessionExpiredNotification";
import { ErrorBoundary } from "@/components/ui/data-display/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SparkClean",
  description: "Organize your home cleaning tasks efficiently",
  manifest: "/manifest.json",
  icons: {
    icon: "/sparkles-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-base text-dark overflow-hidden`}
      >
        <LanguageProvider>
          <SessionProvider>
            <ThemeProvider>
              <ErrorBoundary>
                <SessionExpiredNotification />
                {children}
              </ErrorBoundary>
            </ThemeProvider>
          </SessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
