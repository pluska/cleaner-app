"use client";

import { useSession } from "next-auth/react";
import React, { createContext, useContext, useState, useEffect } from "react";

interface LanguageContextType {
  language: "en" | "es";
  setLanguage: (lang: "en" | "es") => void;
}

interface AppStatusContextType {
  isSessionExpired: boolean;
  setSessionExpired: (expired: boolean) => void;
  redirectToLogin: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);
const AppStatusContext = createContext<AppStatusContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<"en" | "es">("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "en" | "es";
    if (savedLanguage === "en" || savedLanguage === "es") {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {document.documentElement.lang = language;}, [language]);

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

export function AppStatusProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const setSessionExpired = (expired: boolean) => {
    setIsSessionExpired(expired);

    // Don't automatically redirect - let the user see the notification first
    // The notification will handle the redirect after a delay
  };

  const redirectToLogin = () => {
    // Clear any stored auth data
    sessionStorage.clear();

    // Redirect to login
    window.location.href = "/auth/login";
  };

  useEffect(() => {
    const handleSessionExpired = () => setIsSessionExpired(true);
    window.addEventListener('session-expired',handleSessionExpired);
    return () => window.removeEventListener('session-expired',handleSessionExpired);
  }, []);
  useEffect(() => {if (status === 'authenticated') setIsSessionExpired(false);}, [status]);

  // Listen for 401 responses globally
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      // Check if response is 401 Unauthorized
      if (response.status === 401 && status === "authenticated") {
        // Set session expired but don't redirect immediately
        // Let the notification handle the user experience
        setIsSessionExpired(true);
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [status]);

  return (
    <AppStatusContext.Provider
      value={{ isSessionExpired, setSessionExpired, redirectToLogin }}
    >
      {children}
    </AppStatusContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function useAppStatus() {
  const context = useContext(AppStatusContext);
  if (context === undefined) {
    throw new Error("useAppStatus must be used within an AppStatusProvider");
  }
  return context;
}
