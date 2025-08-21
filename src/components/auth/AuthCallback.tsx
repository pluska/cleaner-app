"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/libs/supabase";

export function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const type = searchParams.get("type");
  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");

  // Handle hash-based errors (like expired links)
  const [hashError, setHashError] = useState<string | null>(null);
  const [hashTokens, setHashTokens] = useState<{
    type: string;
    accessToken: string;
    refreshToken: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;

      if (hash.includes("error=")) {
        const errorMatch = hash.match(/error=([^&]+)/);
        const errorCodeMatch = hash.match(/error_code=([^&]+)/);
        const errorDescMatch = hash.match(/error_description=([^&]+)/);

        if (errorMatch) {
          const errorType = decodeURIComponent(errorMatch[1]);
          const errorCode = errorCodeMatch
            ? decodeURIComponent(errorCodeMatch[1])
            : "";
          const errorDesc = errorDescMatch
            ? decodeURIComponent(errorDescMatch[1])
            : "";

          setHashError(`${errorType}: ${errorDesc}`);
        }
      } else {
        // Check for access_token and type in hash
        const accessTokenMatch = hash.match(/access_token=([^&]+)/);
        const typeMatch = hash.match(/(?:^|&)type=([^&]+)/);
        const refreshTokenMatch = hash.match(/refresh_token=([^&]+)/);

        if (accessTokenMatch && typeMatch) {
          const token = decodeURIComponent(accessTokenMatch[1]);
          const tokenType = decodeURIComponent(typeMatch[1]);
          const refreshToken = refreshTokenMatch
            ? decodeURIComponent(refreshTokenMatch[1])
            : "";

          // Store tokens from hash
          if (tokenType === "recovery") {
            setHashTokens({
              type: tokenType,
              accessToken: token,
              refreshToken: refreshToken,
            });
          }
        }
      }
    }
  }, []);

  const handleAuthCallback = useCallback(async () => {
    try {
      const supabase = createClient();

      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code!);

      if (error) {
        console.error("Auth callback error:", error);
        router.push(
          `/auth/error?error=callback_error&error_description=${error.message}`
        );
        return;
      }

      if (data.session) {
        // Successfully authenticated, redirect to dashboard
        router.push("/dashboard");
      } else {
        // No session, redirect to login
        router.push("/auth/login");
      }
    } catch (err) {
      console.error("Auth callback error:", err);
      router.push(
        "/auth/error?error=callback_error&error_description=An unexpected error occurred"
      );
    }
  }, [code, router]);

  useEffect(() => {
    // Handle hash-based errors first (like expired links)
    if (hashError) {
      router.push(
        `/auth/error?error=link_expired&error_description=${encodeURIComponent(
          hashError
        )}`
      );
      return;
    }

    // Handle password recovery from hash tokens
    if (hashTokens && hashTokens.type === "recovery") {
      router.push(
        `/auth/reset-password?access_token=${hashTokens.accessToken}&refresh_token=${hashTokens.refreshToken}`
      );
      return;
    }

    // Handle password recovery from search params
    if (type === "recovery" && accessToken && refreshToken) {
      router.push(
        `/auth/reset-password?access_token=${accessToken}&refresh_token=${refreshToken}`
      );
      return;
    }

    // Handle regular auth callback
    if (code) {
      handleAuthCallback();
    } else if (error) {
      // Handle error - redirect to error page
      router.push(
        `/auth/error?error=${error}&error_description=${
          searchParams.get("error_description") || ""
        }`
      );
    }
  }, [
    code,
    error,
    type,
    accessToken,
    refreshToken,
    hashError,
    hashTokens,
    handleAuthCallback,
    router,
    searchParams,
  ]);

  // Show loading state while processing
  if (
    code ||
    error ||
    (type === "recovery" && accessToken && refreshToken) ||
    hashError
  ) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">
            {hashError
              ? "Processing error..."
              : type === "recovery"
              ? "Processing password reset..."
              : code
              ? "Completing authentication..."
              : "Processing error..."}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
