import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Sword,
  Crown,
  Users,
  Shield,
  Tent,
  Ghost,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/layout/Card";
import { Button } from "@/components/ui/forms/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import characterTemplates from "@/data/onboarding/character-templates.json";

interface FirstLoginReceptionProps {
  userName?: string;
  onComplete: () => void;
}

export const FirstLoginReception: React.FC<FirstLoginReceptionProps> = ({
  userName,
  onComplete,
}) => {
  const { language } = useLanguage();
  const { setThemeId } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<{
    classId: string;
    partyId: string;
    className: string;
    partyName: string;
  } | null>(null);

  useEffect(() => {
    // Check for first login data store in localStorage during onboarding
    const storedData = localStorage.getItem("firstLoginData");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        const classTemplate = characterTemplates.classes.find(
          (c) => c.id === parsed.classId
        );
        const partyTemplate = characterTemplates.party_modes.find(
          (p) => p.id === parsed.partyId
        );

        if (classTemplate && partyTemplate) {
          setData({
            classId: parsed.classId,
            partyId: parsed.partyId,
            className:
              language === "es" && classTemplate.name_es
                ? classTemplate.name_es
                : classTemplate.name,
            partyName:
              language === "es" && partyTemplate.name_es
                ? partyTemplate.name_es
                : partyTemplate.name,
          });
          setIsOpen(true);
        }
      } catch (e) {
        console.error("Error parsing first login data", e);
      }
    }
  }, [language]);

  const handleClose = () => {
    if (data?.classId) {
      setThemeId(data.classId as any); // Set valid theme
    }
    setIsOpen(false);
    localStorage.removeItem("firstLoginData");
    onComplete();
  };

  if (!isOpen || !data) return null;

  const getClassIcon = () => {
    switch (data.classId) {
      case "ranger":
        return <Sword className="w-12 h-12 text-green-600" />;
      case "noble":
        return <Crown className="w-12 h-12 text-blue-600" />;
      case "high_elf":
        return <Sparkles className="w-12 h-12 text-purple-600" />;
      default:
        return <Sparkles className="w-12 h-12 text-yellow-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <Card className="max-w-lg w-full bg-white shadow-2xl transform transition-all scale-100 animate-slideUp border-2 border-blue-100">
        <div className="p-8 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg relative">
            {getClassIcon()}
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-2 rounded-full shadow">
              <span className="text-xl">✨</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              {language === "es" ? "¡Bienvenido, " : "Welcome, "}
              {data.className}!
            </h2>
            <p className="text-lg text-gray-600">
              {language === "es" ? "Tu " : "Your "}
              <span className="font-semibold text-blue-600">
                {data.partyName}
              </span>
              {language === "es"
                ? " espera tus órdenes."
                : " awaits your command."}
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
            <div className="flex items-center space-x-3 text-left">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                {language === "es"
                  ? "Base de Operaciones Establecida"
                  : "Home Base Established"}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                {language === "es"
                  ? "Misiones de Limpieza Generadas"
                  : "Cleaning Quests Generated"}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                {language === "es"
                  ? "Puntos de Experiencia (XP) Listos"
                  : "Experience Points (XP) Ready to Earn"}
              </span>
            </div>
          </div>

          <p className="text-gray-500 italic">
            "
            {language === "es"
              ? "El viaje de mil suelos limpios comienza con una sola pasada."
              : "The journey of a thousand clean floors begins with a single swipe."}
            "
          </p>

          <Button
            size="lg"
            className="w-full text-lg py-6 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]"
            onClick={handleClose}
          >
            {language === "es"
              ? "Comenzar mi Primera Misión"
              : "Start My First Quest"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
