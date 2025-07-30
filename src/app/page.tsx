"use client";

import { Sparkles, CheckCircle, Calendar, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { LanguageSwitcher } from "@/components/ui/layout/LanguageSwitcher";
import { Card } from "@/components/ui/layout/Card";
import { Button } from "@/components/ui/forms/Button";
import { useRouter } from "next/navigation";

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
          <Sparkles className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-text">
            {t("CleanPlanner", language)}
          </span>
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
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-text mb-6">
            {t("Organize your home cleaning", language)}
            <span className="text-primary block">
              {t("Spotless & Organized", language)}
            </span>
          </h1>
          <p className="text-xl text-text/70 mb-8 max-w-3xl mx-auto">
            {t(
              "Create a personalized cleaning schedule and track your progress with our intuitive task management system.",
              language
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGetStarted} variant="primary" size="lg">
              {t("Get Started", language)}
            </Button>
            <Button onClick={handleSignIn} variant="ghost" size="lg">
              {t("Sign In", language)}
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <Card className="text-center p-6">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">
              {t("Smart Task Management", language)}
            </h3>
            <p className="text-text/70">
              {t(
                "Create and organize cleaning tasks by room, priority, and frequency. Mark them complete and track your progress.",
                language
              )}
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">
              {t("Flexible Scheduling", language)}
            </h3>
            <p className="text-text/70">
              {t(
                "View your cleaning tasks by day, week, month, or year. Customize schedules that fit your lifestyle.",
                language
              )}
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">
              {t("Progress Tracking", language)}
            </h3>
            <p className="text-text/70">
              {t(
                "Monitor your cleaning habits and see your completion rates. Stay motivated with visual progress indicators.",
                language
              )}
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="mt-20 text-center p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-text mb-4">
            {t("Ready to Transform Your Home?", language)}
          </h2>
          <p className="text-text/70 mb-8 max-w-2xl mx-auto">
            {t(
              "Join thousands of users who have already simplified their cleaning routine and created more organized, beautiful homes.",
              language
            )}
          </p>
          <Button onClick={handleGetStarted} variant="primary" size="lg">
            {t("Create Your Free Account", language)}
          </Button>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="h-6 w-6 text-accent" />
            <span className="text-xl font-bold">CleanPlanner</span>
          </div>
          <p className="text-text/40">
            {t("© 2024 CleanPlanner. All rights reserved.", language)}
          </p>
        </div>
      </footer>
    </div>
  );
}
