import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SessionProvider } from "@/contexts/LanguageContext";
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
  icons: {
    icon: "/sparkles-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-base text-dark`}
      >
        <LanguageProvider>
          <SessionProvider>
            <ErrorBoundary>
              <SessionExpiredNotification />
              {children}
            </ErrorBoundary>
          </SessionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
