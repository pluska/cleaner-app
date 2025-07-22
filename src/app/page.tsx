"use client";

import Link from "next/link";
import { Sparkles, CheckCircle, Calendar, Target } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

export default function Home() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">
            {t("CleanPlanner", language)}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Link
            href="/auth/login"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            {t("Sign In", language)}
          </Link>
          <Link
            href="/auth/signup"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("Get Started", language)}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {t("Organize your home cleaning", language)}
            <span className="text-blue-600 block">
              {t("Spotless & Organized", language)}
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t(
              "Create a personalized cleaning schedule and track your progress with our intuitive task management system.",
              language
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {t("Get Started", language)}
            </Link>
            <Link
              href="/auth/login"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              {t("Sign In", language)}
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("Smart Task Management", language)}
            </h3>
            <p className="text-gray-600">
              {t(
                "Create and organize cleaning tasks by room, priority, and frequency. Mark them complete and track your progress.",
                language
              )}
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("Flexible Scheduling", language)}
            </h3>
            <p className="text-gray-600">
              {t(
                "View your cleaning tasks by day, week, month, or year. Customize schedules that fit your lifestyle.",
                language
              )}
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("Progress Tracking", language)}
            </h3>
            <p className="text-gray-600">
              {t(
                "Monitor your cleaning habits and see your completion rates. Stay motivated with visual progress indicators.",
                language
              )}
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-white rounded-2xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("Ready to Transform Your Home?", language)}
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {t(
              "Join thousands of users who have already simplified their cleaning routine and created more organized, beautiful homes.",
              language
            )}
          </p>
          <Link
            href="/auth/signup"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            {t("Create Your Free Account", language)}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">CleanPlanner</span>
          </div>
          <p className="text-gray-400">
            {t("© 2024 CleanPlanner. All rights reserved.", language)}
          </p>
        </div>
      </footer>
    </div>
  );
}
