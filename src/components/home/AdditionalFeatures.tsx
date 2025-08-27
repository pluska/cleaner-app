"use client";

import { Zap, Heart, Gem, Target, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/layout/Card";

export function AdditionalFeatures() {
  const { language } = useLanguage();

  return (
    <div className="mt-20 grid md:grid-cols-3 gap-8">
      <Card className="p-8 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-start space-x-4">
          <div className="bg-gradient-to-br from-accent to-primary p-3 rounded-2xl">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text mb-2">
              {language === "es"
                ? "Limpieza Inteligente con IA"
                : "AI-Powered Cleaning"}
            </h3>
            <p className="text-text/70 mb-4">
              {language === "es"
                ? "Nuestra IA analiza tu hogar y sugiere tareas personalizadas basadas en tu espacio y hábitos."
                : "Our AI analyzes your home and suggests personalized tasks based on your space and habits."}
            </p>
            <div className="flex items-center space-x-2 text-sm text-accent">
              <Target className="w-4 h-4" />
              <span>Personalized recommendations</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-start space-x-4">
          <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-2xl">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text mb-2">
              {language === "es" ? "Rachas y Logros" : "Streaks & Achievements"}
            </h3>
            <p className="text-text/70 mb-4">
              {language === "es"
                ? "Mantén rachas de limpieza diaria y desbloquea logros especiales por tu consistencia."
                : "Maintain daily cleaning streaks and unlock special achievements for your consistency."}
            </p>
            <div className="flex items-center space-x-2 text-sm text-primary">
              <Award className="w-4 h-4" />
              <span>100+ achievements</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-start space-x-4">
          <div className="bg-gradient-to-br from-accent to-primary p-3 rounded-2xl">
            <Gem className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text mb-2">
              {language === "es"
                ? "Inventario de Herramientas"
                : "Tool Inventory"}
            </h3>
            <p className="text-text/70 mb-4">
              {language === "es"
                ? "Desbloquea y personaliza tu inventario de herramientas de limpieza mientras progresas."
                : "Unlock and customize your cleaning tool inventory as you progress."}
            </p>
            <div className="flex items-center space-x-2 text-sm text-accent">
              <Target className="w-4 h-4" />
              <span>50+ tools available</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
