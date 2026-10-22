"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/forms/Button";
import { Input } from "@/components/ui/forms/Input";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { SuccessMessage } from "@/components/ui/feedback/SuccessMessage";
import { ErrorMessage } from "@/components/ui/feedback/ErrorMessage";
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
  const { language } = useLanguage();

  // Password strength logic
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 8 && new TextEncoder().encode(pass).length <= 72) score += 1; // Base length
    if (/(?=.*[A-Z])(?=.*[a-z])/.test(pass)) score += 1; // Uppercase
    if (/(?=.*\d)/.test(pass)) score += 1; // Number or Symbol
    return score;
  };

  const strengthScore = getPasswordStrength(password);

  const getStrengthColor = () => {
    switch (strengthScore) {
      case 0: return "bg-gray-200";
      case 1: return "bg-red-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-green-500";
      default: return "bg-gray-200";
    }
  };

  const getStrengthText = () => {
    switch (strengthScore) {
      case 0: return "";
      case 1: return language === "es" ? "Santo y seña débil" : "Weak pass-phrase";
      case 2: return language === "es" ? "Santo y seña aceptable" : "Acceptable pass-phrase";
      case 3: return language === "es" ? "Santo y seña inquebrantable" : "Unbreakable pass-phrase";
      default: return "";
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (mode === "signup") {
        if (!email) {
          setError(
            language === "es"
              ? "Necesitamos tu correo para saber a qué reino enviaremos las provisiones."
              : "We need your email to know which kingdom we should send the provisions to."
          );
          setLoading(false);
          return;
        }

        // RPG Themed Frontend Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          setError(
            language === "es"
              ? "Tu correo no parece pertenecer a ningún reino conocido."
              : "Your email does not seem to belong to any known kingdom."
          );
          setLoading(false);
          return;
        }

        if (!password) {
           setError(
            language === "es"
              ? "Necesitas proteger a tu reino con un santo y seña."
              : "You need to protect your kingdom with a pass-phrase."
          );
          setLoading(false);
          return;
        }

        if (strengthScore < 3) {
           setError(
            language === "es"
              ? "Tu santo y seña debe contener al menos 8 caracteres, mayúsculas y números para ser seguro."
              : "Your pass-phrase must contain at least 8 characters, uppercase letters, and numbers to be secure."
          );
          setLoading(false);
          return;
        }

        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Signup failed");
        }

        // Automatically sign in after signup
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          setError((language === "es" ? "Inicia sesión con tu contraseña existente o recupera tu contraseña." : "Please sign in with your existing password, or use password recovery."));
          return;
        }

        setSuccess(true);
        onSuccess?.();
      } else {
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          throw new Error(t("Invalid email or password", language));
        }

        setSuccess(true);
        onSuccess?.();
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
      className="space-y-4 w-full max-w-md"
    >
      <div>
        <Input
          type="email"
          label={t("Email", language)}
          placeholder={t("Email", language)}
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
          disabled={loading || success}
          required
        />
      </div>
      <div className="space-y-1">
        <Input
          type="password"
          label={t("Password", language)}
          placeholder={t("Password", language)}
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          disabled={loading || success}
          required={mode === "login"}
        />

        {/* RPG Password Strength Meter */}
        {mode === "signup" && password.length > 0 && (
          <div className="pt-2">
            <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-gray-200">
              <div className={`h-full transition-all duration-300 ${strengthScore >= 1 ? getStrengthColor() : 'bg-transparent'}`} style={{ width: '33.33%' }} />
              <div className={`h-full transition-all duration-300 ${strengthScore >= 2 ? getStrengthColor() : 'bg-transparent'}`} style={{ width: '33.33%' }} />
              <div className={`h-full transition-all duration-300 ${strengthScore === 3 ? getStrengthColor() : 'bg-transparent'}`} style={{ width: '33.33%' }} />
            </div>
            <p className={`text-xs mt-1 font-medium transition-colors ${
              strengthScore === 1 ? 'text-red-500' :
              strengthScore === 2 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {getStrengthText()}
            </p>
          </div>
        )}
      </div>

      {mode === "login" && (
        <div className="text-right">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {t("Forgot Password?", language)}
          </Link>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {success && (
        <SuccessMessage
          message={
            mode === "signup"
              ? t(
                  "Account created successfully! Please check your email.",
                  language
                )
              : t("Successfully signed in!", language)
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
