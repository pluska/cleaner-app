"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { language } = useLanguage();

  const handleSuccess = () => {
    setIsRedirecting(true);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SparkClean</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignup
              ? t("Create your account", language)
              : t("Welcome back", language)}
          </h2>
          <p className="text-gray-600">
            {isSignup
              ? t(
                  "Please check your email to confirm your account before signing in.",
                  language
                )
              : t("Sign in to your account", language)}
          </p>
        </div>

        <AuthForm
          mode={isSignup ? "signup" : "login"}
          onSuccess={handleSuccess}
        />

        {isRedirecting && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-sm">
                {t("Redirecting to dashboard...", language)}
              </span>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-gray-600">
            {isSignup
              ? t("Already have an account?", language)
              : t("Don't have an account?", language)}{" "}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignup ? t("Sign In", language) : t("Sign Up", language)}
            </button>
          </p>
        </div>

        <div className="text-center">
          <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
