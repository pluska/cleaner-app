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
    if (level >= 4) return "bg-red-100 text-red-700";
    if (level >= 3) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  const getImportanceText = (level: number): string => {
    if (level >= 4) return language === "es" ? "Crítico" : "Critical";
    if (level >= 3) return language === "es" ? "Importante" : "Important";
    return language === "es" ? "Rutinario" : "Routine";
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
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
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Sparkles className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {language === "es"
              ? "Recomendaciones Personalizadas"
              : "Personalized Recommendations"}
          </h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {language === "es"
            ? "Basado en tu evaluación, nuestro AI ha creado estas tareas de limpieza personalizadas. Selecciona las que quieres agregar a tu rutina."
            : "Based on your assessment, our AI has created these personalized cleaning tasks. Select the ones you want to add to your routine."}
        </p>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((recommendation) => {
          const isSelected = selectedTasks.has(recommendation.task_name);
          const isExpanded = expandedTask === recommendation.task_name;

          return (
            <div
              key={recommendation.task_name}
              className={`transition-all duration-200 cursor-pointer hover:shadow-lg ${
                isSelected ? "ring-2 ring-primary bg-primary/5" : ""
              }`}
              onClick={() => handleTaskToggle(recommendation.task_name)}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {recommendation.task_name}
                      </h3>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <Badge
                        variant="primary"
                        className="flex items-center space-x-1"
                      >
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">
                          {getFrequencyText(recommendation.frequency_days)}
                        </span>
                      </Badge>

                      <Badge
                        className={`flex items-center space-x-1 ${getImportanceColor(
                          recommendation.importance_level
                        )}`}
                      >
                        <Star className="w-3 h-3" />
                        <span className="text-xs">
                          {getImportanceText(recommendation.importance_level)}
                        </span>
                      </Badge>

                      <Badge
                        variant="secondary"
                        className="flex items-center space-x-1"
                      >
                        <Target className="w-3 h-3" />
                        <span className="text-xs">
                          {recommendation.exp_reward} EXP
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {recommendation.friendly_explanation}
                </p>

                {/* Health Impact */}
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        {language === "es"
                          ? "Impacto en la Salud"
                          : "Health Impact"}
                      </h4>
                      <p className="text-xs text-blue-700">
                        {recommendation.health_impact}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Scientific Source */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>
                    {language === "es" ? "Fuente:" : "Source:"}{" "}
                    {recommendation.scientific_source}
                  </span>
                  <a
                    href={recommendation.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Ver</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Subtasks */}
                {recommendation.subtasks &&
                  recommendation.subtasks.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          {language === "es" ? "Subtareas" : "Subtasks"}
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
                          className="text-xs"
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
                        <div className="space-y-2">
                          {recommendation.subtasks.map((subtask, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <div className="w-2 h-2 bg-gray-300 rounded-full" />
                              <span className="text-gray-600">
                                {subtask.title}
                              </span>
                              <span className="text-gray-400">
                                ({subtask.estimated_minutes}{" "}
                                {language === "es" ? "min" : "min"})
                              </span>
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

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-6">
        <Button variant="outline" onClick={onCancel}>
          {language === "es" ? "Cancelar" : "Cancel"}
        </Button>

        <Button
          onClick={handleAddSelected}
          disabled={selectedTasks.size === 0}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>
            {language === "es"
              ? `Agregar ${selectedTasks.size} Tareas`
              : `Add ${selectedTasks.size} Tasks`}
          </span>
        </Button>
      </div>
    </div>
  );
}
