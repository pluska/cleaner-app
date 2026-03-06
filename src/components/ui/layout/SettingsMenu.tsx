"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, LogOut, Sun, Moon, Languages } from "lucide-react";
import { useLanguage, useSession } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { motion, AnimatePresence } from "framer-motion";

export function SettingsMenu() {
  const { language, setLanguage } = useLanguage();
  const { redirectToLogin } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "es" : "en");
    setIsMenuOpen(false);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    setIsMenuOpen(false);
    // Dark mode logic will go here if/when implemented globally
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    redirectToLogin();
  };

  return (
    <div ref={menuRef} className="relative z-50 shrink-0">
      <motion.button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isMenuOpen ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="w-12 h-12 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-dark hover:text-primary hover:bg-gray-50 transition-colors"
      >
        <Settings className="w-5 h-5" />
      </motion.button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="py-2">
              <button
                onClick={toggleLanguage}
                className="w-full px-4 py-3 flex items-center space-x-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Languages className="w-4 h-4 text-gray-400" />
                <span>{language === "en" ? "Español" : "English"}</span>
              </button>

              <button
                onClick={toggleTheme}
                className="w-full px-4 py-3 flex items-center space-x-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-gray-400" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-400" />
                )}
                <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
              </button>

              <div className="h-px bg-gray-100 my-1 mx-4" />

              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 flex items-center space-x-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>{t("Sign Out", language) || "Sign Out"}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
