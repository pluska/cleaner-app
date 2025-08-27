"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/forms/Button";
import { Input } from "@/components/ui/forms/Input";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { SuccessMessage } from "@/components/ui/feedback/SuccessMessage";
import { ErrorMessage } from "@/components/ui/feedback/ErrorMessage";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset link");
      }

      setSuccess(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
            {t("Password Reset", language)}
          </h2>
          <p className="text-gray-600">
            {t("Enter your email to receive a password reset link", language)}
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder={t("Email", language)}
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                disabled={loading}
                required
              />
            </div>

            {error && <ErrorMessage message={error} />}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                t("Send Reset Link", language)
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <SuccessMessage
              message={t("Reset link sent! Check your email.", language)}
            />
            <div className="text-center text-sm text-gray-600">
              <p>
                {t("Didn't receive the email?", language)}{" "}
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t("Try Again", language)}
                </button>
              </p>
            </div>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-700 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("Back to Sign In", language)}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
