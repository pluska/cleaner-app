"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/forms/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const { language } = useLanguage();

  const getErrorMessage = () => {
    switch (error) {
      case "link_expired":
        return t("Your password reset link has expired", language);
      case "access_denied":
        if (errorDescription?.includes("expired")) {
          return "The email confirmation link has expired. Please try signing up again.";
        }
        return "Access was denied. Please try again.";
      case "invalid_request":
        return "Invalid request. Please try again.";
      default:
        return errorDescription || "An error occurred during authentication.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              {t("CleanPlanner", language)}
            </span>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {t("Authentication Error", language)}
            </h2>

            <p className="text-gray-600 mb-6">{getErrorMessage()}</p>

            {error === "link_expired" && (
              <p className="text-sm text-gray-500 mb-6">
                {t("Please request a new password reset link", language)}
              </p>
            )}

            <div className="space-y-3">
              {error === "link_expired" ? (
                <Link href="/auth/forgot-password">
                  <Button className="w-full">
                    {t("Request New Reset Link", language)}
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/login">
                  <Button className="w-full">{t("Try Again", language)}</Button>
                </Link>
              )}

              <Link href="/">
                <Button variant="outline" className="w-full font-medium">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("Back to Home", language)}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
