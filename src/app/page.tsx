"use client";

import { useState } from "react";
import { Sparkles, Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { LanguageSwitcher } from "@/components/ui/layout/LanguageSwitcher";

import { Button } from "@/components/ui/forms/Button";
import { useRouter } from "next/navigation";
import {
  HeroSection,
  GamificationPreview,
  GamificationFeatures,
  UserPainsSection,
  CTASection,
  Footer,
} from "@/components/home";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language } = useLanguage();
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/auth/login");
  };

  const handleGetStarted = () => {
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base to-bg">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto relative z-50">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
          <span className="text-xl sm:text-2xl font-bold text-dark">SparkClean</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <LanguageSwitcher />
          <Button variant="ghost" className="px-8 text-lg h-12" onClick={handleSignIn}>
            {t("Sign In", language)}
          </Button>
          <Button variant="primary" className="px-8 text-lg h-12" onClick={handleGetStarted}>
            {t("Get Started", language)}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <LanguageSwitcher />
          <button 
            className="ml-4 p-2 text-dark focus:outline-none" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 mx-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-col space-y-4 md:hidden">
            <Button variant="ghost" className="w-full justify-center text-lg h-12" onClick={handleSignIn}>
              {t("Sign In", language)}
            </Button>
            <Button variant="primary" className="w-full justify-center text-lg h-12" onClick={handleGetStarted}>
              {t("Get Started", language)}
            </Button>
          </div>
        )}
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
          <GamificationPreview showCompletionAnimation={false} />
        </div>
        <UserPainsSection />
        <GamificationFeatures />
        <CTASection onGetStarted={handleGetStarted} />
      </main>

      <Footer />
    </div>
  );
}
