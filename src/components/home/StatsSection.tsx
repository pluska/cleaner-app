"use client";

import { useState } from "react";
import { Users, CheckCircle, Award, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/layout/Card";

export function StatsSection() {
  const { language } = useLanguage();

  // Internal stats state
  const [animatedStats] = useState({
    users: 1250,
    tasks: 45600,
    achievements: 89,
    levels: 25,
  });

  return (
    <div className="mt-20 grid md:grid-cols-4 gap-6">
      <Card className="text-center p-6 hover:scale-105 transition-transform duration-300">
        <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <div className="text-3xl font-bold text-primary mb-2">
          {animatedStats.users.toLocaleString()}+
        </div>
        <p className="text-dark/70 font-medium">
          {language === "es" ? "Usuarios Activos" : "Active Users"}
        </p>
      </Card>

      <Card className="text-center p-6 hover:scale-105 transition-transform duration-300">
        <div className="bg-secondary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-secondary" />
        </div>
        <div className="text-3xl font-bold text-secondary mb-2">
          {animatedStats.tasks.toLocaleString()}+
        </div>
        <p className="text-dark/70 font-medium">
          {language === "es" ? "Tareas Completadas" : "Tasks Completed"}
        </p>
      </Card>

      <Card className="text-center p-6 hover:scale-105 transition-transform duration-300">
        <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Award className="h-8 w-8 text-primary" />
        </div>
        <div className="text-2xl font-bold text-secondary mb-2">
          {animatedStats.achievements.toLocaleString()}+
        </div>
        <p className="text-dark/70 font-medium">
          {language === "es" ? "Logros Desbloqueados" : "Achievements Unlocked"}
        </p>
      </Card>

      <Card className="text-center p-6 hover:scale-105 transition-transform duration-300">
        <div className="bg-secondary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="h-8 w-8 text-secondary" />
        </div>
        <div className="text-3xl font-bold text-secondary mb-2">
          {animatedStats.levels}
        </div>
        <p className="text-dark/70 font-medium">
          {language === "es" ? "Niveles Máximos" : "Max Levels"}
        </p>
      </Card>
    </div>
  );
}
