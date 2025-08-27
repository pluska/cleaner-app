"use client";

import {
  Sparkles,
  CheckCircle,
  Calendar,
  Target,
  Star,
  Trophy,
  Coins,
  Gem,
  Heart,
  Zap,
  TrendingUp,
  Users,
  Award,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { LanguageSwitcher } from "@/components/ui/layout/LanguageSwitcher";
import { Card } from "@/components/ui/layout/Card";
import { Button } from "@/components/ui/forms/Button";
import { useRouter } from "next/navigation";

export default function Home() {
  const { language } = useLanguage();
  const router = useRouter();
  const handleSignIn = () => {
    router.push("/auth/login");
  };

  const handleGetStarted = () => {
    router.push("/auth/signup");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base to-bg">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-bounce"></div>
          </div>
          <span className="text-2xl font-bold text-text">SparkClean</span>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <Button variant="ghost" size="lg" onClick={handleSignIn}>
            {t("Sign In", language)}
          </Button>
          <Button variant="primary" size="lg" onClick={handleGetStarted}>
            {t("Get Started", language)}
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="bg-gradient-to-r from-primary to-accent p-3 rounded-2xl shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <span className="text-accent font-bold text-lg animate-pulse">
              {language === "es" ? "¡Gamificado!" : "Gamified!"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-text mb-6">
            {t("Organize your home cleaning", language)}
            <span className="text-primary block">
              {t("Spotless & Organized", language)}
            </span>
          </h1>
          <p className="text-xl text-text/70 mb-8 max-w-3xl mx-auto">
            {t(
              "Create a personalized cleaning schedule and track your progress with our intuitive task management system.",
              language
            )}
          </p>

          {/* Gamification Preview */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 mb-8 border border-primary/20">
            <div className="flex items-center justify-center space-x-8 mb-4">
              <div className="text-center">
                <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <span className="text-sm font-medium text-text/70">
                  Level 1
                </span>
              </div>
              <div className="text-center">
                <div className="bg-accent/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Coins className="h-8 w-8 text-accent" />
                </div>
                <span className="text-sm font-medium text-text/70">0 XP</span>
              </div>
              <div className="text-center">
                <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <span className="text-sm font-medium text-text/70">
                  0 Streak
                </span>
              </div>
            </div>
            <div className="w-full bg-base rounded-full h-3 mb-2">
              <div className="bg-gradient-to-r from-primary to-accent h-3 rounded-full w-1/4 transition-all duration-1000 ease-out"></div>
            </div>
            <p className="text-sm text-text/60">
              {language === "es"
                ? "Completa tareas para subir de nivel y desbloquear logros"
                : "Complete tasks to level up and unlock achievements"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              variant="primary"
              size="lg"
              className="group"
            >
              <Trophy className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              {t("Get Started", language)}
            </Button>
            <Button onClick={handleSignIn} variant="ghost" size="lg">
              {t("Sign In", language)}
            </Button>
          </div>
        </div>

        {/* Stats Section - Hidden until real stats are available */}
        {/* 
        <div className="mt-20 grid md:grid-cols-4 gap-6">
          <Card className="text-center p-6 hover:scale-105 transition-transform duration-300">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-2">
              {animatedStats.users.toLocaleString()}+
            </div>
            <p className="text-text/70 font-medium">
              {language === "es" ? "Usuarios Activos" : "Active Users"}
            </p>
          </Card>

          <Card className="text-center p-6 hover:scale-105 transition-transform duration-300">
            <div className="bg-accent/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <div className="text-3xl font-bold text-accent mb-2">
              {animatedStats.tasks.toLocaleString()}+
            </div>
            <p className="text-text/70 font-medium">
              {language === "es" ? "Tareas Completadas" : "Tasks Completed"}
            </p>
          </Card>

          <Card className="text-center p-6 hover:scale-105 transition-transform duration-300">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-accent mb-2">
              {animatedStats.achievements.toLocaleString()}+
            </div>
            <p className="text-text/70 font-medium">
              {language === "es"
                ? "Logros Desbloqueados"
                : "Achievements Unlocked"}
            </p>
          </Card>

          <Card className="text-center p-6 hover:scale-105 transition-transform duration-300">
            <div className="bg-accent/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
            <div className="text-3xl font-bold text-accent mb-2">
              {animatedStats.levels}
            </div>
            <p className="text-text/70 font-medium">
              {language === "es" ? "Niveles Máximos" : "Max Levels"}
            </p>
          </Card>
        </div>
        */}

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 group">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">
              {t("Smart Task Management", language)}
            </h3>
            <p className="text-text/70 mb-4">
              {t(
                "Create and organize cleaning tasks by room, priority, and frequency. Mark them complete and track your progress.",
                language
              )}
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-primary">
              <Star className="w-4 h-4" />
              <span>+15 XP per task</span>
            </div>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 group">
            <div className="bg-accent/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">
              {t("Flexible Scheduling", language)}
            </h3>
            <p className="text-text/70 mb-4">
              {t(
                "View your cleaning tasks by day, week, month, or year. Customize schedules that fit your lifestyle.",
                language
              )}
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-accent">
              <Zap className="w-4 h-4" />
              <span>Streak bonuses</span>
            </div>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 group">
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">
              {t("Progress Tracking", language)}
            </h3>
            <p className="text-text/70 mb-4">
              {t(
                "Monitor your cleaning habits and see your completion rates. Stay motivated with visual progress indicators.",
                language
              )}
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-primary">
              <Gem className="w-4 h-4" />
              <span>Level progression</span>
            </div>
          </Card>
        </div>

        {/* Gamification Features */}
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

        {/* CTA Section */}
        <Card className="mt-20 text-center p-12 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
          <div className="bg-gradient-to-r from-primary to-accent p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-text mb-4">
            {language === "es"
              ? "¿Listo para Transformar tu Hogar?"
              : "Ready to Transform Your Home?"}
          </h2>
          <p className="text-text/70 mb-8 max-w-2xl mx-auto">
            {language === "es"
              ? "Únete a miles de usuarios que ya han simplificado su rutina de limpieza y creado hogares más organizados y hermosos."
              : "Join thousands of users who have already simplified their cleaning routine and created more organized, beautiful homes."}
          </p>
          <Button
            onClick={handleGetStarted}
            variant="primary"
            size="lg"
            className="group"
          >
            <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            {language === "es"
              ? "Crear Cuenta Gratuita"
              : "Create Your Free Account"}
          </Button>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-accent" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-bold">SparkClean</span>
          </div>
          <p className="text-text/40">
            © 2024 SparkClean. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
