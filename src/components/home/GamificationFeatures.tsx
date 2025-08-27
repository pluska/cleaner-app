"use client";

import {
  Trophy,
  Coins,
  Heart,
  Gem,
  Star,
  Zap,
  Award,
  Target,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/layout/Card";

export function GamificationFeatures() {
  const { language } = useLanguage();

  return (
    <div className="mt-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-text mb-4">
          {language === "es" ? "Sistema de Recompensas" : "Reward System"}
        </h2>
        <p className="text-text/70 max-w-2xl mx-auto">
          {language === "es"
            ? "Convierte la limpieza en un juego divertido con nuestro sistema de gamificación completo"
            : "Turn cleaning into a fun game with our complete gamification system"}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-8 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-primary to-accent p-3 rounded-2xl">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text mb-2">
                {language === "es" ? "Sistema de Niveles" : "Level System"}
              </h3>
              <p className="text-text/70 mb-4">
                {language === "es"
                  ? "Sube de nivel completando tareas y desbloquea nuevas funcionalidades y recompensas especiales."
                  : "Level up by completing tasks and unlock new features and special rewards."}
              </p>
              <div className="flex items-center space-x-2 text-sm text-primary">
                <Star className="w-4 h-4" />
                <span>25 levels available</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-accent to-primary p-3 rounded-2xl">
              <Coins className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text mb-2">
                {language === "es"
                  ? "Puntos de Experiencia"
                  : "Experience Points"}
              </h3>
              <p className="text-text/70 mb-4">
                {language === "es"
                  ? "Gana XP por cada tarea completada y construye tu perfil de limpieza profesional."
                  : "Earn XP for each completed task and build your professional cleaning profile."}
              </p>
              <div className="flex items-center space-x-2 text-sm text-accent">
                <Zap className="w-4 h-4" />
                <span>5-50 XP per task</span>
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
                {language === "es"
                  ? "Rachas y Logros"
                  : "Streaks & Achievements"}
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
    </div>
  );
}
