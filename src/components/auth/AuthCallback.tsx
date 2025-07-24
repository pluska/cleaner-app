"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/libs/supabase";

export function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const error = searchParams.get("error");

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
  }, [code, error, handleAuthCallback, router, searchParams]);

  // Show loading state while processing
  if (code || error) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">
            {code ? "Completing authentication..." : "Processing error..."}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
