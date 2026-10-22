"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { LanguageSwitcher } from "@/components/ui/layout/LanguageSwitcher";

import { BrandLogo } from "@/components/ui/layout/BrandLogo";
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
    <div className="landing min-h-screen">
      {/* Navigation */}
      <header className="landing-header"><nav className="landing-nav">
        <BrandLogo priority />

        {/* Desktop Menu */}
        <div className="landing-nav-desktop">
          <LanguageSwitcher />
          <Button variant="secondary" onClick={handleSignIn}>
            {t("Sign In", language)}
          </Button>
          <Button variant="primary"  onClick={handleGetStarted}>
            {t("Get Started", language)}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="landing-nav-mobile">
          <LanguageSwitcher />
          <button
            className="landing-menu-toggle"
            aria-label="Menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="landing-mobile-menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div id="landing-mobile-menu" className="landing-mobile-menu">
            <Button variant="ghost" className="w-full justify-center text-lg h-12" onClick={handleSignIn}>
              {t("Sign In", language)}
            </Button>
            <Button variant="primary" className="w-full justify-center text-lg h-12" onClick={handleGetStarted}>
              {t("Get Started", language)}
            </Button>
          </div>
        )}
      </nav></header>

      {/* Hero Section */}
      <main className="landing-main">
        <div className="landing-hero">
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
        <Footer />
      </main>
    </div>
  );
}
