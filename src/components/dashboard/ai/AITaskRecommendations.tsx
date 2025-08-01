"use client";

import { useState } from "react";
import { Card } from "@/components/ui/layout/Card";
import { Button } from "@/components/ui/forms/Button";
import { Badge } from "@/components/ui/data-display/Badge";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import {
  CheckCircle,
  Clock,
  Star,
  Target,
  Sparkles,
  ExternalLink,
  Plus,
  Info,
  Zap,
  Shield,
  Heart,
  Trophy,
  Timer,
  TrendingUp,
  Home,
} from "lucide-react";
import { AIRecommendation } from "@/types";

interface AITaskRecommendationsProps {
  recommendations: AIRecommendation[];
  onAddTasks: (selectedTasks: AIRecommendation[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AITaskRecommendations({
  recommendations,
  onAddTasks,
  onCancel,
  isLoading = false,
}: AITaskRecommendationsProps) {
  const { language } = useLanguage();
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const handleTaskToggle = (taskName: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskName)) {
      newSelected.delete(taskName);
    } else {
      newSelected.add(taskName);
    }
    setSelectedTasks(newSelected);
  };

  const handleAddSelected = () => {
    const selectedRecommendations = recommendations.filter((rec) =>
      selectedTasks.has(rec.task_name)
    );
    onAddTasks(selectedRecommendations);
  };

  const getFrequencyText = (days: number): string => {
    if (days === 1) return language === "es" ? "Diario" : "Daily";
    if (days === 2) return language === "es" ? "Cada 2 días" : "Every 2 days";
    if (days === 3) return language === "es" ? "Cada 3 días" : "Every 3 days";
    if (days === 7) return language === "es" ? "Semanal" : "Weekly";
    if (days === 14)
      return language === "es" ? "Cada 2 semanas" : "Every 2 weeks";
    if (days === 30) return language === "es" ? "Mensual" : "Monthly";
    return language === "es" ? `Cada ${days} días` : `Every ${days} days`;
  };

  const getImportanceColor = (level: number): string => {
    if (level >= 4) return "bg-red-100 text-red-700 border-red-200";
    if (level >= 3) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  const getImportanceText = (level: number): string => {
    if (level >= 4) return language === "es" ? "Crítico" : "Critical";
    if (level >= 3) return language === "es" ? "Importante" : "Important";
    return language === "es" ? "Rutinario" : "Routine";
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getDifficultyText = (difficulty: string): string => {
    switch (difficulty) {
      case "easy":
        return language === "es" ? "Fácil" : "Easy";
      case "medium":
        return language === "es" ? "Medio" : "Medium";
      case "hard":
        return language === "es" ? "Difícil" : "Hard";
      default:
        return language === "es" ? "Normal" : "Normal";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return <Zap className="w-3 h-3" />;
      case "medium":
        return <Target className="w-3 h-3" />;
      case "hard":
        return <Trophy className="w-3 h-3" />;
      default:
        return <Star className="w-3 h-3" />;
    }
  };

  const totalExp = recommendations.reduce(
    (sum, rec) => sum + rec.exp_reward,
    0
  );
  const selectedExp = recommendations
    .filter((rec) => selectedTasks.has(rec.task_name))
    .reduce((sum, rec) => sum + rec.exp_reward, 0);

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <LoadingSpinner size="lg" />
            <Sparkles className="w-6 h-6 text-blue-600 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            {language === "es"
              ? "Analizando tu hogar..."
              : "Analyzing your home..."}
          </h3>
          <p className="text-gray-600">
            {language === "es"
              ? "Nuestro AI está creando recomendaciones personalizadas basadas en tu evaluación."
              : "Our AI is creating personalized recommendations based on your assessment."}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Gamification Stats */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Sparkles className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {language === "es"
              ? "Recomendaciones Personalizadas"
              : "Personalized Recommendations"}
          </h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          {language === "es"
            ? "Basado en tu evaluación, nuestro AI ha creado estas tareas de limpieza personalizadas. Selecciona las que quieres agregar a tu rutina."
            : "Based on your assessment, our AI has created these personalized cleaning tasks. Select the ones you want to add to your routine."}
        </p>

        {/* Gamification Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {language === "es" ? "Total EXP" : "Total EXP"}
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-700">{totalExp}</div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                {language === "es" ? "Seleccionadas" : "Selected"}
              </span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {selectedTasks.size}
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                {language === "es" ? "EXP Ganadas" : "EXP Earned"}
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {selectedExp}
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Timer className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">
                {language === "es" ? "Tiempo Total" : "Total Time"}
              </span>
            </div>
            <div className="text-2xl font-bold text-orange-700">
              {recommendations
                .filter((rec) => selectedTasks.has(rec.task_name))
                .reduce((sum, rec) => {
                  // Use estimated_total_minutes if available, otherwise calculate from subtasks
                  if (rec.estimated_total_minutes) {
                    return sum + rec.estimated_total_minutes;
                  } else if (rec.subtasks && rec.subtasks.length > 0) {
                    return (
                      sum +
                      rec.subtasks.reduce(
                        (subSum, subtask) => subSum + subtask.estimated_minutes,
                        0
                      )
                    );
                  } else {
                    // Default time if no subtasks or estimated time
                    return sum + 15;
                  }
                }, 0)}
              min
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((recommendation) => {
          const isSelected = selectedTasks.has(recommendation.task_name);
          const isExpanded = expandedTask === recommendation.task_name;

          return (
            <div
              key={recommendation.task_name}
              className={`transition-all duration-300 cursor-pointer hover:shadow-xl transform hover:-translate-y-1 rounded-2xl overflow-hidden ${
                isSelected
                  ? "ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg"
                  : "bg-white hover:shadow-lg"
              }`}
              onClick={() => handleTaskToggle(recommendation.task_name)}
            >
              <Card className="p-6 h-full border-0 shadow-none">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {recommendation.task_name}
                      </h3>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-green-600 animate-bounce" />
                      )}
                    </div>

                    {/* Gamification Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge
                        variant="primary"
                        className="flex items-center space-x-1 border"
                      >
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">
                          {getFrequencyText(recommendation.frequency_days)}
                        </span>
                      </Badge>

                      <Badge
                        className={`flex items-center space-x-1 border ${getImportanceColor(
                          recommendation.importance_level
                        )}`}
                      >
                        <Star className="w-3 h-3" />
                        <span className="text-xs">
                          {getImportanceText(recommendation.importance_level)}
                        </span>
                      </Badge>

                      <Badge
                        className={`flex items-center space-x-1 border ${getDifficultyColor(
                          recommendation.difficulty || "medium"
                        )}`}
                      >
                        {getDifficultyIcon(
                          recommendation.difficulty || "medium"
                        )}
                        <span className="text-xs">
                          {getDifficultyText(
                            recommendation.difficulty || "medium"
                          )}
                        </span>
                      </Badge>

                      <Badge
                        variant="secondary"
                        className="flex items-center space-x-1 border bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300"
                      >
                        <Target className="w-3 h-3" />
                        <span className="text-xs font-bold">
                          {recommendation.exp_reward} EXP
                        </span>
                      </Badge>

                      {recommendation.estimated_total_minutes && (
                        <Badge
                          variant="secondary"
                          className="flex items-center space-x-1 border bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300"
                        >
                          <Timer className="w-3 h-3" />
                          <span className="text-xs">
                            {recommendation.estimated_total_minutes} min
                          </span>
                        </Badge>
                      )}

                      {recommendation.room_specific && (
                        <Badge
                          variant="secondary"
                          className="flex items-center space-x-1 border bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border-indigo-300"
                        >
                          <Home className="w-3 h-3" />
                          <span className="text-xs capitalize">
                            {recommendation.room_specific.replace("_", " ")}
                          </span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {recommendation.friendly_explanation}
                </p>

                {/* Health Impact with Enhanced Design */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-4 border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Heart className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2">
                        {language === "es"
                          ? "Impacto en la Salud"
                          : "Health Impact"}
                      </h4>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        {recommendation.health_impact}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scientific Source with Enhanced Design */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 p-2 bg-gray-50 rounded border">
                  <span className="font-medium">
                    {language === "es" ? "Fuente:" : "Source:"}{" "}
                    {recommendation.scientific_source}
                  </span>
                  <a
                    href={recommendation.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="font-medium">Ver</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Enhanced Subtasks Section */}
                {recommendation.subtasks &&
                  recommendation.subtasks.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-gray-600" />
                          <span>
                            {language === "es" ? "Subtareas" : "Subtasks"}
                          </span>
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedTask(
                              isExpanded ? null : recommendation.task_name
                            );
                          }}
                          className="text-xs hover:bg-gray-100"
                        >
                          {isExpanded
                            ? language === "es"
                              ? "Ocultar"
                              : "Hide"
                            : language === "es"
                            ? "Ver"
                            : "Show"}
                        </Button>
                      </div>

                      {isExpanded && (
                        <div className="space-y-3">
                          {recommendation.subtasks.map((subtask, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                <div>
                                  <span className="text-sm font-medium text-gray-700">
                                    {subtask.title}
                                  </span>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {subtask.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  className={`text-xs border ${getDifficultyColor(
                                    subtask.difficulty
                                  )}`}
                                >
                                  {getDifficultyText(subtask.difficulty)}
                                </Badge>
                                <span className="text-xs text-gray-500 font-medium">
                                  {subtask.estimated_minutes} min
                                </span>
                                <span className="text-xs text-yellow-600 font-bold">
                                  +{subtask.exp_reward} EXP
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
              </Card>
            </div>
          );
        })}
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex justify-center space-x-4 pt-6">
        <Button variant="outline" onClick={onCancel} className="px-6">
          {language === "es" ? "Cancelar" : "Cancel"}
        </Button>

        <Button
          onClick={handleAddSelected}
          disabled={selectedTasks.size === 0 || isLoading}
          className="flex items-center space-x-2 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{language === "es" ? "Guardando..." : "Saving..."}</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>
                {language === "es"
                  ? `Agregar ${selectedTasks.size} Tareas`
                  : `Add ${selectedTasks.size} Tasks`}
              </span>
              {selectedExp > 0 && (
                <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                  +{selectedExp} EXP
                </Badge>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
