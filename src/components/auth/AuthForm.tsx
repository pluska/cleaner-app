"use client";

import { useState } from "react";
import { createClient } from "@/libs/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SuccessMessage } from "@/components/ui/SuccessMessage";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";

interface AuthFormProps {
  mode: "login" | "signup";
  onSuccess?: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/login`,
          },
        });
        if (error) throw error;

        // Check if email confirmation is required
        if (data.user && !data.session) {
          setSuccess(true);
          // Show message about email confirmation
          setTimeout(() => {
            setSuccess(false);
            setError(
              t(
                "Please check your email to confirm your account before signing in.",
                language
              )
            );
          }, 3000);
          return;
        }

        setSuccess(true);
        // For signup, show success message and redirect after a delay
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSuccess(true);
        // For login, redirect immediately
        setTimeout(() => {
          onSuccess?.();
        }, 1000);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 w-full max-w-md bg-white p-6 rounded-lg shadow-sm border border-gray-200"
    >
      <div>
        <Input
          type="email"
          placeholder={t("Email", language)}
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          disabled={loading || success}
          required
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder={t("Password", language)}
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          disabled={loading || success}
          required
        />
      </div>
      {error && <ErrorMessage message={error} />}

      {success && (
        <SuccessMessage
          message={
            mode === "signup"
              ? t("Success!", language)
              : t("Success!", language)
          }
        />
      )}

      <Button type="submit" disabled={loading || success} className="w-full">
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <LoadingSpinner size="sm" />
            <span>Processing...</span>
          </div>
        ) : success ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <span>Success!</span>
          </div>
        ) : mode === "login" ? (
          t("Sign In", language)
        ) : (
          t("Sign Up", language)
        )}
      </Button>
    </form>
  );
}
