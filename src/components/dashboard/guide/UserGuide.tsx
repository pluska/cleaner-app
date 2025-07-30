"use client";

import { useState } from "react";
import { Card } from "@/components/ui/layout/Card";
import {
  BookOpen,
  Trophy,
  Heart,
  Wrench,
  Calendar,
  Sparkles,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Home,
  Zap,
  Star,
  Clock,
  Users,
  Settings,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface GuideSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
}

export function UserGuide() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("getting-started");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // const toggleSection = (sectionId: string) => {
  //   setExpandedSections((prev) =>
  //     prev.includes(sectionId)
  //       ? prev.filter((id) => id !== sectionId)
  //       : [...prev, sectionId]
  //   );
  // };

  // const isExpanded = (sectionId: string) =>
  //   expandedSections.includes(sectionId);

  const guideSections: GuideSection[] = [
    {
      id: "getting-started",
      title: language === "es" ? "Comenzando" : "Getting Started",
      icon: Target,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              {language === "es"
                ? "¿Qué es CleanPlanner?"
                : "What is CleanPlanner?"}
            </h3>
            <p className="text-blue-800">
              {language === "es"
                ? "CleanPlanner es un gestor de tareas de limpieza gamificado que transforma las tareas domésticas en una experiencia atractiva."
                : "CleanPlanner is a gamified home cleaning task manager that transforms household chores into an engaging experience."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <h4 className="font-semibold">
                  {language === "es" ? "Sistema Gamificado" : "Gamified System"}
                </h4>
              </div>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>
                  •{" "}
                  {language === "es"
                    ? "Gana puntos de experiencia"
                    : "Earn experience points"}
                </li>
                <li>• {language === "es" ? "Sube de nivel" : "Level up"}</li>
                <li>
                  •{" "}
                  {language === "es"
                    ? "Desbloquea logros"
                    : "Unlock achievements"}
                </li>
              </ul>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Heart className="h-6 w-6 text-red-600" />
                <h4 className="font-semibold">
                  {language === "es" ? "Salud de Áreas" : "Area Health"}
                </h4>
              </div>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>
                  •{" "}
                  {language === "es"
                    ? "Monitorea la limpieza"
                    : "Monitor cleanliness"}
                </li>
                <li>
                  •{" "}
                  {language === "es"
                    ? "Indicadores visuales"
                    : "Visual indicators"}
                </li>
                <li>
                  •{" "}
                  {language === "es"
                    ? "Restauración de salud"
                    : "Health restoration"}
                </li>
              </ul>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Wrench className="h-6 w-6 text-blue-600" />
                <h4 className="font-semibold">
                  {language === "es"
                    ? "Gestión de Herramientas"
                    : "Tool Management"}
                </h4>
              </div>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>
                  •{" "}
                  {language === "es"
                    ? "Durabilidad de herramientas"
                    : "Tool durability"}
                </li>
                <li>• {language === "es" ? "Mantenimiento" : "Maintenance"}</li>
                <li>
                  • {language === "es" ? "Sistema de rareza" : "Rarity system"}
                </li>
              </ul>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Calendar className="h-6 w-6 text-green-600" />
                <h4 className="font-semibold">
                  {language === "es"
                    ? "Programación Inteligente"
                    : "Smart Scheduling"}
                </h4>
              </div>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>
                  •{" "}
                  {language === "es"
                    ? "Frecuencia flexible"
                    : "Flexible frequency"}
                </li>
                <li>
                  •{" "}
                  {language === "es"
                    ? "Recomendaciones IA"
                    : "AI recommendations"}
                </li>
                <li>
                  •{" "}
                  {language === "es"
                    ? "Gestión de conflictos"
                    : "Conflict management"}
                </li>
              </ul>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "gamification",
      title:
        language === "es" ? "Sistema de Gamificación" : "Gamification System",
      icon: Trophy,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-yellow-800 mb-4">
              {language === "es"
                ? "Puntos de Experiencia (EXP)"
                : "Experience Points (EXP)"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-yellow-700 mb-2">
                  {language === "es" ? "Cómo Ganar EXP:" : "How to Earn EXP:"}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>
                      {language === "es"
                        ? "Completar tareas: 20-100 EXP"
                        : "Complete tasks: 20-100 EXP"}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>
                      {language === "es"
                        ? "Completar subtareas: 5-30 EXP"
                        : "Complete subtasks: 5-30 EXP"}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>
                      {language === "es"
                        ? "Bonos de racha: EXP extra"
                        : "Streak bonuses: Extra EXP"}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>
                      {language === "es"
                        ? "Logros: EXP de bonificación"
                        : "Achievements: Bonus EXP"}
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-700 mb-2">
                  {language === "es" ? "Sistema de Niveles:" : "Level System:"}
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>
                      {language === "es" ? "Fórmula:" : "Formula:"}
                    </strong>{" "}
                    Level = √(EXP / 100) + 1
                  </p>
                  <p>
                    <strong>
                      {language === "es" ? "Ejemplo:" : "Example:"}
                    </strong>
                  </p>
                  <ul className="ml-4 space-y-1">
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Nivel 1: 0-399 EXP"
                        : "Level 1: 0-399 EXP"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Nivel 2: 400-899 EXP"
                        : "Level 2: 400-899 EXP"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Nivel 3: 900-1599 EXP"
                        : "Level 3: 900-1599 EXP"}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="h-6 w-6 text-yellow-600" />
                <h4 className="font-semibold">
                  {language === "es" ? "Moneda Virtual" : "Virtual Currency"}
                </h4>
              </div>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">
                    💰 {language === "es" ? "Monedas" : "Coins"}
                  </h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Ganadas: 1 moneda por 10 EXP"
                        : "Earned: 1 coin per 10 EXP"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Usadas para: Mantenimiento de herramientas"
                        : "Used for: Tool maintenance"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Cantidad inicial: 100 monedas"
                        : "Starting amount: 100 coins"}
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">
                    💎 {language === "es" ? "Gemas" : "Gems"}
                  </h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Ganadas: 1 gema por subida de nivel"
                        : "Earned: 1 gem per level up"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Usadas para: Herramientas premium"
                        : "Used for: Premium tools"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Cantidad inicial: 10 gemas"
                        : "Starting amount: 10 gems"}
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Star className="h-6 w-6 text-orange-600" />
                <h4 className="font-semibold">
                  {language === "es" ? "Sistema de Racha" : "Streak System"}
                </h4>
              </div>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">
                    {language === "es" ? "Racha Diaria:" : "Daily Streak:"}
                  </h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Completa al menos una tarea por día"
                        : "Complete at least one task per day"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "La racha aumenta con días consecutivos"
                        : "Streak increases with consecutive days"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Bonos por mantener rachas"
                        : "Bonus rewards for maintaining streaks"}
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">
                    {language === "es" ? "Bonos de Racha:" : "Streak Bonuses:"}
                  </h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>
                      •{" "}
                      {language === "es"
                        ? "7 días: +50% EXP"
                        : "7 days: +50% EXP"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "30 días: +100% EXP"
                        : "30 days: +100% EXP"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "100 días: Logro especial"
                        : "100 days: Special achievement"}
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "area-health",
      title:
        language === "es" ? "Sistema de Salud de Áreas" : "Area Health System",
      icon: Heart,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">
              {language === "es"
                ? "¿Cómo Funcionan las Áreas?"
                : "How Areas Work"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-3">
                  {language === "es" ? "Tipos de Áreas:" : "Area Types:"}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-green-600" />
                    <span>
                      <strong>
                        {language === "es" ? "Cocina:" : "Kitchen:"}
                      </strong>{" "}
                      {language === "es"
                        ? "Alto tráfico, necesita limpieza frecuente"
                        : "High traffic, needs frequent cleaning"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-blue-600" />
                    <span>
                      <strong>
                        {language === "es" ? "Baño:" : "Bathroom:"}
                      </strong>{" "}
                      {language === "es"
                        ? "Crítico para higiene"
                        : "Hygiene-critical"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-purple-600" />
                    <span>
                      <strong>
                        {language === "es" ? "Dormitorio:" : "Bedroom:"}
                      </strong>{" "}
                      {language === "es"
                        ? "Espacio personal"
                        : "Personal space"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-orange-600" />
                    <span>
                      <strong>
                        {language === "es" ? "Sala:" : "Living Room:"}
                      </strong>{" "}
                      {language === "es" ? "Área social" : "Social area"}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-green-700 mb-3">
                  {language === "es"
                    ? "Mecánicas de Salud:"
                    : "Health Mechanics:"}
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>
                      {language === "es"
                        ? "Puntos de Salud:"
                        : "Health Points:"}
                    </strong>{" "}
                    0-100 puntos
                  </p>
                  <p>
                    <strong>
                      {language === "es"
                        ? "Salud Inicial:"
                        : "Starting Health:"}
                    </strong>{" "}
                    100% (salud completa)
                  </p>
                  <p>
                    <strong>
                      {language === "es" ? "Nivel Crítico:" : "Critical Level:"}
                    </strong>{" "}
                    {language === "es" ? "Por debajo del 20%" : "Below 20%"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h4 className="font-semibold">
                  {language === "es" ? "Decaimiento de Salud" : "Health Decay"}
                </h4>
              </div>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>
                    {language === "es" ? "Decaimiento Diario:" : "Daily Decay:"}
                  </strong>{" "}
                  1-2% por día
                </p>
                <p>
                  <strong>
                    {language === "es"
                      ? "Factores que Afectan:"
                      : "Factors Affecting:"}
                  </strong>
                </p>
                <ul className="ml-4 space-y-1 text-gray-600">
                  <li>
                    •{" "}
                    {language === "es"
                      ? "Tipo de área (cocina decae más rápido)"
                      : "Area type (kitchen decays faster)"}
                  </li>
                  <li>
                    •{" "}
                    {language === "es"
                      ? "Tamaño (áreas grandes decaen más rápido)"
                      : "Size (larger areas decay faster)"}
                  </li>
                  <li>
                    •{" "}
                    {language === "es"
                      ? "Tráfico (áreas de alto tráfico)"
                      : "Traffic (high-traffic areas)"}
                  </li>
                  <li>
                    •{" "}
                    {language === "es"
                      ? "Tipo de piso (alfombra decae más rápido)"
                      : "Flooring type (carpet decays faster)"}
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h4 className="font-semibold">
                  {language === "es"
                    ? "Restauración de Salud"
                    : "Health Restoration"}
                </h4>
              </div>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>
                    {language === "es"
                      ? "Completar Tareas:"
                      : "Task Completion:"}
                  </strong>{" "}
                  {language === "es"
                    ? "Restaura salud basada en importancia"
                    : "Restores health based on importance"}
                </p>
                <p>
                  <strong>{language === "es" ? "Fórmula:" : "Formula:"}</strong>{" "}
                  {language === "es"
                    ? "Salud Restaurada = Importancia × Restauración Base"
                    : "Health Restored = Importance × Base Restoration"}
                </p>
                <p>
                  <strong>
                    {language === "es" ? "Salud Máxima:" : "Maximum Health:"}
                  </strong>{" "}
                  {language === "es"
                    ? "No puede exceder la salud máxima del área"
                    : "Cannot exceed area's max health"}
                </p>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h4 className="font-semibold text-gray-800 mb-4">
              {language === "es"
                ? "Indicadores Visuales de Salud"
                : "Visual Health Indicators"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h5 className="font-medium text-green-700">
                  🟢 {language === "es" ? "Excelente" : "Excellent"}
                </h5>
                <p className="text-sm text-gray-600">80-100%</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <h5 className="font-medium text-yellow-700">
                  🟡 {language === "es" ? "Bueno" : "Good"}
                </h5>
                <p className="text-sm text-gray-600">40-79%</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <h5 className="font-medium text-orange-700">
                  🟠{" "}
                  {language === "es" ? "Necesita Atención" : "Needs Attention"}
                </h5>
                <p className="text-sm text-gray-600">20-39%</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <h5 className="font-medium text-red-700">
                  🔴 {language === "es" ? "Crítico" : "Critical"}
                </h5>
                <p className="text-sm text-gray-600">0-19%</p>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: "tools",
      title: language === "es" ? "Gestión de Herramientas" : "Tool Management",
      icon: Wrench,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-800 mb-4">
              {language === "es"
                ? "Sistema de Herramientas"
                : "Tool System Overview"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-700 mb-3">
                  {language === "es"
                    ? "Categorías de Herramientas:"
                    : "Tool Categories:"}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    •{" "}
                    <strong>
                      {language === "es"
                        ? "Suministros de Limpieza:"
                        : "Cleaning Supplies:"}
                    </strong>{" "}
                    {language === "es" ? "Herramientas básicas" : "Basic tools"}
                  </li>
                  <li>
                    •{" "}
                    <strong>{language === "es" ? "Baño:" : "Bathroom:"}</strong>{" "}
                    {language === "es"
                      ? "Herramientas especializadas"
                      : "Specialized tools"}
                  </li>
                  <li>
                    •{" "}
                    <strong>
                      {language === "es"
                        ? "Limpieza de Pisos:"
                        : "Floor Cleaning:"}
                    </strong>{" "}
                    {language === "es"
                      ? "Trapeadores, aspiradoras"
                      : "Mops, vacuums"}
                  </li>
                  <li>
                    •{" "}
                    <strong>
                      {language === "es"
                        ? "Limpieza Profunda:"
                        : "Deep Cleaning:"}
                    </strong>{" "}
                    {language === "es"
                      ? "Limpiadores de vapor"
                      : "Steam cleaners"}
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700 mb-3">
                  {language === "es" ? "Niveles de Rareza:" : "Rarity Levels:"}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span>
                      <strong>
                        {language === "es" ? "Común:" : "Common:"}
                      </strong>{" "}
                      {language === "es"
                        ? "Fácil de adquirir"
                        : "Easy to acquire"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span>
                      <strong>
                        {language === "es" ? "Poco Común:" : "Uncommon:"}
                      </strong>{" "}
                      {language === "es" ? "Mejor calidad" : "Better quality"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span>
                      <strong>{language === "es" ? "Raro:" : "Rare:"}</strong>{" "}
                      {language === "es" ? "Alta calidad" : "High quality"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span>
                      <strong>{language === "es" ? "Épico:" : "Epic:"}</strong>{" "}
                      {language === "es"
                        ? "Herramientas premium"
                        : "Premium tools"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span>
                      <strong>
                        {language === "es" ? "Legendario:" : "Legendary:"}
                      </strong>{" "}
                      {language === "es"
                        ? "Mejores herramientas"
                        : "Best tools"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
                <h4 className="font-semibold">
                  {language === "es"
                    ? "Sistema de Durabilidad"
                    : "Durability System"}
                </h4>
              </div>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>
                    {language === "es"
                      ? "Durabilidad Máxima:"
                      : "Max Durability:"}
                  </strong>{" "}
                  {language === "es"
                    ? "Varía por tipo (50-500 usos)"
                    : "Varies by type (50-500 uses)"}
                </p>
                <p>
                  <strong>
                    {language === "es"
                      ? "Pérdida de Durabilidad:"
                      : "Durability Loss:"}
                  </strong>{" "}
                  {language === "es"
                    ? "1-5 puntos por uso"
                    : "1-5 points per use"}
                </p>
                <p>
                  <strong>
                    {language === "es" ? "Mantenimiento:" : "Maintenance:"}
                  </strong>{" "}
                  {language === "es"
                    ? "Limpia herramientas para extender vida"
                    : "Clean tools to extend lifespan"}
                </p>
                <p>
                  <strong>
                    {language === "es" ? "Reemplazo:" : "Replacement:"}
                  </strong>{" "}
                  {language === "es"
                    ? "Inutilizable a 0 durabilidad"
                    : "Unusable at 0 durability"}
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="h-6 w-6 text-yellow-600" />
                <h4 className="font-semibold">
                  {language === "es"
                    ? "Estadísticas de Herramientas"
                    : "Tool Stats"}
                </h4>
              </div>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>
                    {language === "es"
                      ? "Poder de Limpieza:"
                      : "Cleaning Power:"}
                  </strong>{" "}
                  {language === "es"
                    ? "Qué tan efectivamente limpia"
                    : "How effectively it cleans"}
                </p>
                <p>
                  <strong>
                    {language === "es" ? "Durabilidad:" : "Durability:"}
                  </strong>{" "}
                  {language === "es"
                    ? "Cuánto tiempo dura"
                    : "How long it lasts"}
                </p>
                <p>
                  <strong>
                    {language === "es" ? "Versatilidad:" : "Versatility:"}
                  </strong>{" "}
                  {language === "es"
                    ? "Cuántas tareas puede manejar"
                    : "How many tasks it can handle"}
                </p>
                <p>
                  <strong>
                    {language === "es"
                      ? "Costo de Mantenimiento:"
                      : "Maintenance Cost:"}
                  </strong>{" "}
                  {language === "es"
                    ? "Costo para mantener"
                    : "Cost to maintain"}
                </p>
                <p>
                  <strong>
                    {language === "es"
                      ? "Costo de Reemplazo:"
                      : "Replacement Cost:"}
                  </strong>{" "}
                  {language === "es"
                    ? "Costo para reemplazar"
                    : "Cost to replace"}
                </p>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "tips",
      title:
        language === "es"
          ? "Consejos y Mejores Prácticas"
          : "Tips & Best Practices",
      icon: Lightbulb,
      content: (
        <div className="space-y-6">
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-yellow-800 mb-4">
              {language === "es" ? "Comenzando" : "Getting Started"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <h4 className="font-semibold text-yellow-700 mb-2">
                  1.{" "}
                  {language === "es"
                    ? "Configura tu Hogar"
                    : "Set Up Your Home"}
                </h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>
                    •{" "}
                    {language === "es"
                      ? "Agrega todas tus áreas primero"
                      : "Add all your areas first"}
                  </li>
                  <li>
                    •{" "}
                    {language === "es"
                      ? "Sé honesto sobre tamaños"
                      : "Be honest about sizes"}
                  </li>
                  <li>
                    •{" "}
                    {language === "es"
                      ? "Incluye características especiales"
                      : "Include special features"}
                  </li>
                </ul>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold text-yellow-700 mb-2">
                  2.{" "}
                  {language === "es"
                    ? "Elige tus Herramientas"
                    : "Choose Your Tools"}
                </h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>
                    •{" "}
                    {language === "es"
                      ? "Comienza con herramientas básicas"
                      : "Start with basic tools"}
                  </li>
                  <li>
                    •{" "}
                    {language === "es"
                      ? "Enfócate en tu estilo"
                      : "Focus on your style"}
                  </li>
                  <li>
                    •{" "}
                    {language === "es"
                      ? "No te preocupes por herramientas premium"
                      : "Don't worry about premium tools"}
                  </li>
                </ul>
              </Card>
              <Card className="p-4">
                <h4 className="font-semibold text-yellow-700 mb-2">
                  3.{" "}
                  {language === "es"
                    ? "Crea tu Horario"
                    : "Create Your Schedule"}
                </h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>
                    •{" "}
                    {language === "es"
                      ? "Comienza con tareas esenciales"
                      : "Start with essential tasks"}
                  </li>
                  <li>
                    •{" "}
                    {language === "es"
                      ? "Agrega gradualmente más tareas"
                      : "Gradually add more tasks"}
                  </li>
                  <li>
                    •{" "}
                    {language === "es"
                      ? "Usa recomendaciones IA"
                      : "Use AI recommendations"}
                  </li>
                </ul>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Trophy className="h-6 w-6 text-yellow-600" />
                <h4 className="font-semibold">
                  {language === "es"
                    ? "Maximizar Recompensas"
                    : "Maximizing Rewards"}
                </h4>
              </div>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">
                    {language === "es"
                      ? "Mantén tu Racha:"
                      : "Maintain Your Streak:"}
                  </h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Completa al menos una tarea por día"
                        : "Complete at least one task per day"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Usa el bono de racha para EXP extra"
                        : "Use streak bonus for extra EXP"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Planifica para evitar romper la racha"
                        : "Plan ahead to avoid breaking streak"}
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">
                    {language === "es"
                      ? "Usa Herramientas Apropiadas:"
                      : "Use Appropriate Tools:"}
                  </h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Combina herramientas con tareas"
                        : "Match tools to tasks"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Mantén tus herramientas regularmente"
                        : "Maintain tools regularly"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Reemplaza herramientas desgastadas"
                        : "Replace worn tools"}
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="h-6 w-6 text-red-600" />
                <h4 className="font-semibold">
                  {language === "es"
                    ? "Optimización de Salud de Áreas"
                    : "Area Health Optimization"}
                </h4>
              </div>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">
                    {language === "es"
                      ? "Áreas Prioritarias:"
                      : "Priority Areas:"}
                  </h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Enfócate en cocina y baño"
                        : "Focus on kitchen and bathroom"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Mantén áreas de vida"
                        : "Maintain living areas"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "No descuides áreas de almacenamiento"
                        : "Don't neglect storage areas"}
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">
                    {language === "es"
                      ? "Monitoreo de Salud:"
                      : "Health Monitoring:"}
                  </h5>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Revisa salud de áreas diariamente"
                        : "Check area health daily"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Aborda áreas críticas inmediatamente"
                        : "Address critical areas immediately"}
                    </li>
                    <li>
                      •{" "}
                      {language === "es"
                        ? "Usa restauración estratégicamente"
                        : "Use restoration strategically"}
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
  ];

  const tabs = [
    {
      id: "getting-started",
      label: language === "es" ? "Comenzando" : "Getting Started",
      icon: Target,
    },
    {
      id: "gamification",
      label: language === "es" ? "Gamificación" : "Gamification",
      icon: Trophy,
    },
    {
      id: "area-health",
      label: language === "es" ? "Salud de Áreas" : "Area Health",
      icon: Heart,
    },
    {
      id: "tools",
      label: language === "es" ? "Herramientas" : "Tools",
      icon: Wrench,
    },
    {
      id: "tips",
      label: language === "es" ? "Consejos" : "Tips",
      icon: Lightbulb,
    },
  ];

  const currentSection = guideSections.find(
    (section) => section.id === activeTab
  );

  return (
    <div className="space-y-6">
      {/* Quick Navigation */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">
            {language === "es" ? "Guía Rápida" : "Quick Guide"}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Main Content */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          {currentSection && (
            <currentSection.icon className="h-6 w-6 text-blue-600" />
          )}
          <h2 className="text-2xl font-bold text-gray-900">
            {currentSection?.title}
          </h2>
        </div>
        {currentSection?.content}
      </Card>

      {/* Navigation Help */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {language === "es" ? "¿Necesitas Ayuda?" : "Need Help?"}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">
                {language === "es"
                  ? "Soporte Comunitario"
                  : "Community Support"}
              </h4>
              <p className="text-sm text-gray-600">
                {language === "es"
                  ? "Conecta con otros usuarios"
                  : "Connect with other users"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Settings className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">
                {language === "es" ? "Configuración" : "Settings"}
              </h4>
              <p className="text-sm text-gray-600">
                {language === "es"
                  ? "Personaliza tu experiencia"
                  : "Customize your experience"}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
