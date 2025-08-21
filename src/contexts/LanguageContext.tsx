"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface LanguageContextType {
  language: "en" | "es";
  setLanguage: (lang: "en" | "es") => void;
}

interface SessionContextType {
  isSessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
  redirectToLogin: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);
const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<"en" | "es">("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "en" | "es";
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (lang: "en" | "es") => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleLanguageChange }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const setSessionExpired = (expired: boolean) => {
    setIsSessionExpired(expired);

    // Don't automatically redirect - let the user see the notification first
    // The notification will handle the redirect after a delay
  };

  const redirectToLogin = () => {
    // Clear any stored auth data
    localStorage.removeItem("supabase.auth.token");
    sessionStorage.clear();

    // Redirect to login
    window.location.href = "/auth/login";
  };

  // Listen for storage events (when other tabs log out)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "supabase.auth.token" && e.newValue === null) {
        // Another tab logged out, expire this session too
        setSessionExpired(true);
      }
    };

    const handleSessionExpired = () => {
      setSessionExpired(true);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("session-expired", handleSessionExpired);
    };
  }, []);

  // Listen for 401 responses globally
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      // Check if response is 401 Unauthorized
      if (response.status === 401) {
        // Set session expired but don't redirect immediately
        // Let the notification handle the user experience
        setIsSessionExpired(true);
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <SessionContext.Provider
      value={{ isSessionExpired, setSessionExpired, redirectToLogin }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
