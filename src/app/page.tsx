"use client";

import { Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { LanguageSwitcher } from "@/components/ui/layout/LanguageSwitcher";

import { Button } from "@/components/ui/forms/Button";
import { useRouter } from "next/navigation";
import {
  HeroSection,
  GamificationPreview,
  FeaturesSection,
  GamificationFeatures,
  StatsSection,
  CTASection,
  Footer,
} from "@/components/home";

export default function Home() {
  const { language } = useLanguage();
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/auth/login");
  };

  const handleGetStarted = () => {
    router.push("/auth/signup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base to-bg">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-bounce"></div>
          </div>
          <span className="text-2xl font-bold text-text">SparkClean</span>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Button variant="ghost" size="lg" onClick={handleSignIn}>
            {t("Sign In", language)}
          </Button>
          <Button variant="primary" size="lg" onClick={handleGetStarted}>
            {t("Get Started", language)}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Headline & Subheadline */}
          <HeroSection
            onGetStarted={handleGetStarted}
            onSignIn={handleSignIn}
          />

          {/* Right Column - Interactive Gamification Preview */}
          <GamificationPreview />
        </div>
        <StatsSection />
        <FeaturesSection />
        <GamificationFeatures />
        <CTASection onGetStarted={handleGetStarted} />
      </main>

      <Footer />
    </div>
  );
}
