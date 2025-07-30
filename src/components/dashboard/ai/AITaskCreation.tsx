"use client";

import { useState } from "react";
import { Card } from "@/components/ui/layout/Card";
import { Button } from "@/components/ui/forms/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { Sparkles, ArrowRight } from "lucide-react";
import { AIInterview } from "./AIInterview";
import { AITaskRecommendations } from "./AITaskRecommendations";
import { HomeAssessment, AIRecommendation } from "@/types";

type AITaskCreationStep =
  | "welcome"
  | "interview"
  | "recommendations"
  | "complete";

interface AITaskCreationProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function AITaskCreation({ onComplete, onCancel }: AITaskCreationProps) {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState<AITaskCreationStep>("welcome");
  const [assessment, setAssessment] = useState<HomeAssessment | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleStartInterview = () => {
    setCurrentStep("interview");
  };

  const handleInterviewComplete = async (homeAssessment: HomeAssessment) => {
    setIsLoading(true);
    try {
      // Call the AI API to generate recommendations
      const response = await fetch("/api/ai/generate-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(homeAssessment),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recommendations");
      }

      const data = await response.json();
      setAssessment(data.assessment);
      setRecommendations(data.recommendations);
      setCurrentStep("recommendations");
    } catch (error) {
      console.error("Error generating recommendations:", error);
      // For now, show mock recommendations
      setAssessment(homeAssessment);
      setRecommendations([
        {
          task_name: "Kitchen Counter Cleaning",
          frequency_days: 1,
          importance_level: 5,
          reasoning: "Daily counter cleaning prevents bacterial growth",
          health_impact: "Prevents foodborne illnesses",
          scientific_source: "CDC Food Safety Guidelines",
          source_url: "https://www.cdc.gov/foodsafety/",
          friendly_explanation:
            "Keeping your kitchen counters clean daily prevents the spread of bacteria.",
          exp_reward: 10,
          area_health_impact: 15,
          tools_required: ["microfiber_cloth", "all_purpose_cleaner"],
        },
      ]);
      setCurrentStep("recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTasks = async (selectedTasks: AIRecommendation[]) => {
    setIsLoading(true);
    try {
      // TODO: Implement task creation logic
      // For now, just complete the flow
      console.log("Selected tasks:", selectedTasks);
      setCurrentStep("complete");

      // Show success message and complete
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error("Error adding tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (currentStep === "welcome") {
      onCancel();
    } else {
      setCurrentStep("welcome");
    }
  };

  const renderWelcome = () => (
    <Card className="p-8 max-w-2xl mx-auto text-center">
      <div className="flex flex-col items-center space-y-6">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-12 h-12 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            {language === "es"
              ? "AI Asistente de Limpieza"
              : "AI Cleaning Assistant"}
          </h1>
        </div>

        <p className="text-lg text-gray-600 max-w-lg">
          {language === "es"
            ? "Nuestro AI inteligente analizará tu hogar y creará un plan de limpieza personalizado basado en tu estilo de vida y necesidades específicas."
            : "Our intelligent AI will analyze your home and create a personalized cleaning plan based on your lifestyle and specific needs."}
        </p>

        <div className="bg-blue-50 rounded-lg p-6 text-left max-w-md">
          <h3 className="font-semibold text-blue-900 mb-3">
            {language === "es" ? "¿Qué incluye?" : "What's included?"}
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
              <span>
                {language === "es"
                  ? "Evaluación personalizada de tu hogar"
                  : "Personalized home assessment"}
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
              <span>
                {language === "es"
                  ? "Recomendaciones basadas en evidencia científica"
                  : "Evidence-based recommendations"}
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
              <span>
                {language === "es"
                  ? "Tareas adaptadas a tu estilo de vida"
                  : "Tasks adapted to your lifestyle"}
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
              <span>
                {language === "es"
                  ? "Explicaciones educativas sobre salud"
                  : "Educational health explanations"}
              </span>
            </li>
          </ul>
        </div>

        <div className="flex space-x-4">
          <Button variant="outline" onClick={handleCancel}>
            {language === "es" ? "Cancelar" : "Cancel"}
          </Button>

          <Button
            onClick={handleStartInterview}
            className="flex items-center space-x-2"
          >
            <span>
              {language === "es" ? "Comenzar Evaluación" : "Start Assessment"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderComplete = () => (
    <Card className="p-8 max-w-2xl mx-auto text-center">
      <div className="flex flex-col items-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-green-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900">
          {language === "es" ? "¡Tareas Creadas!" : "Tasks Created!"}
        </h2>

        <p className="text-gray-600">
          {language === "es"
            ? "Tu plan de limpieza personalizado ha sido creado exitosamente. Puedes ver tus nuevas tareas en el dashboard."
            : "Your personalized cleaning plan has been created successfully. You can view your new tasks in the dashboard."}
        </p>

        <Button onClick={onComplete} className="flex items-center space-x-2">
          <span>{language === "es" ? "Ver Dashboard" : "View Dashboard"}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );

  switch (currentStep) {
    case "welcome":
      return renderWelcome();

    case "interview":
      return (
        <AIInterview
          onComplete={handleInterviewComplete}
          onCancel={handleCancel}
        />
      );

    case "recommendations":
      return (
        <AITaskRecommendations
          recommendations={recommendations}
          onAddTasks={handleAddTasks}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      );

    case "complete":
      return renderComplete();

    default:
      return renderWelcome();
  }
}
