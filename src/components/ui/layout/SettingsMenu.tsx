"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, LogOut, Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { signOut, useSession } from "next-auth/react";
import { t } from "@/libs/translations";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Check, X } from "lucide-react";

export function SettingsMenu() {
  const { language, setLanguage } = useLanguage();
  const { data: session, update: updateSession } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsEditingName(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "es" : "en");
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    signOut({ callbackUrl: "/" });
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName === session?.user?.name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    try {
      const res = await fetch("/api/user/hero-name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (res.ok) {
        await updateSession({ name: newName });
        setIsEditingName(false);
      }
    } catch (err) {
      console.error("Failed to update name", err);
    } finally {
      setIsSavingName(false);
    }
  };

  const startEditingName = () => {
    setNewName(session?.user?.name || "");
    setIsEditingName(true);
  };

  return (
    <div ref={menuRef} className="relative z-50 shrink-0">
      <motion.button
        aria-label={language === "es" ? "Ajustes" : "Settings"}
        aria-expanded={isMenuOpen}
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
            className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="py-2">
              {/* Hero Name Edit Section */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  {language === "es" ? "Identidad del Héroe" : "Hero Identity"}
                </div>
                {isEditingName ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      disabled={isSavingName}
                      className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-1 focus:ring-primary outline-none"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={isSavingName}
                      className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      disabled={isSavingName}
                      className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between group">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {session?.user?.name || (language === "es" ? "Héroe Anónimo" : "Anonymous Hero")}
                    </span>
                    <button
                      aria-label={language === "es" ? "Editar nombre" : "Edit name"}
                      onClick={startEditingName}
                      className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-primary transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={toggleLanguage}
                className="w-full px-4 py-3 flex items-center space-x-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Languages className="w-4 h-4 text-gray-400" />
                <span>{language === "en" ? "Español" : "English"}</span>
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
