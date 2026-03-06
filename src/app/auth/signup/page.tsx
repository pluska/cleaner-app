"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle } from "lucide-react";
import { AuthForm } from "@/components/auth/AuthForm";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";

import { Suspense } from "react";

function SignupContent() {
  const [isSignup, setIsSignup] = useState(true); // Start in signup mode
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [fromFirstSteps, setFromFirstSteps] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  useEffect(() => {
    const from = searchParams.get("from");
    if (from === "first-steps") {
      setFromFirstSteps(true);
    }
  }, [searchParams]);

  const handleSuccess = () => {
    setIsRedirecting(true);

    // If user came from first-steps, redirect to onboarding
    if (fromFirstSteps) {
      router.push("/onboarding");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <Sparkles className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">SparkClean</span>
        </div>

        {fromFirstSteps && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                {language === "es" ? "¡Ficha de Personaje Lista!" : "Character Sheet Ready!"}
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              {language === "es"
                ? "Ya tenemos tu información del hogar. Ahora crea tu cuenta para comenzar tu aventura."
                : "We have your home information. Now create your account to begin your adventure."}
            </p>
          </div>
        )}

        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isSignup
            ? language === "es" ? "Comienza tu Aventura" : "Begin Your Adventure"
            : language === "es" ? "Reanudar Misión" : "Resume Quest"}
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
              {fromFirstSteps
                ? language === "es"
                  ? "Redirigiendo a configuración..."
                  : "Redirecting to setup..."
                : t("Redirecting to dashboard...", language)}
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
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <SignupContent />
      </Suspense>
    </div>
  );
}
