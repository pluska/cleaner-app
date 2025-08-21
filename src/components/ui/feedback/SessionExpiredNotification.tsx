"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/contexts/LanguageContext";
import { AlertTriangle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/forms/Button";

export function SessionExpiredNotification() {
  const { isSessionExpired, redirectToLogin } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState(30);

  useEffect(() => {
    if (isSessionExpired) {
      setIsVisible(true);
      setAutoRedirectCountdown(30);

      // Auto-hide after 30 seconds instead of 10
      const timer = setInterval(() => {
        setAutoRedirectCountdown((prev) => {
          if (prev <= 1) {
            setIsVisible(false);
            redirectToLogin();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSessionExpired, redirectToLogin]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm bg-red-50 border border-red-200 rounded-2xl shadow-lg p-4 animate-in slide-in-from-top-2">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-900">
            Session Expired
          </h3>
          <p className="text-sm text-red-700 mt-1">
            Your session has expired. Please log in again to continue.
          </p>
          <p className="text-xs text-red-600 mt-2">
            Auto-redirect in {autoRedirectCountdown} seconds
          </p>
          <div className="mt-3 flex space-x-2">
            <Button
              size="sm"
              variant="primary"
              onClick={redirectToLogin}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Log In Now
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setIsVisible(false);
                // Reset the session expired state so user can continue
                window.location.reload();
              }}
              className="text-red-700 border-red-300 hover:bg-red-100"
            >
              Stay on Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
