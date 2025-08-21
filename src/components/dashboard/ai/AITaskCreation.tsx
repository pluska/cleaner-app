"use client";

import { useState } from "react";
import { Card } from "@/components/ui/layout/Card";
import { Button } from "@/components/ui/forms/Button";
import { Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AIInterview } from "./AIInterview";
import { AITaskRecommendations } from "./AITaskRecommendations";
import { HomeAssessment, HomeAssessmentInput, AIRecommendation } from "@/types";

type AITaskCreationStep =
  | "welcome"
  | "interview"
  | "generating"
  | "recommendations"
  | "complete";

interface AITaskCreationProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function AITaskCreation({ onComplete, onCancel }: AITaskCreationProps) {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState<AITaskCreationStep>("welcome");
  const [assessment, setAssessment] = useState<
    HomeAssessment | HomeAssessmentInput | null
  >(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  const handleStartInterview = () => {
    setCurrentStep("interview");
  };

  const handleInterviewComplete = async (
    homeAssessment: HomeAssessmentInput
  ) => {
    // Set loading state immediately
    console.log("AITaskCreation - Setting isGeneratingTasks to true");
    setIsGeneratingTasks(true);

    // Keep the interview step active to show loading state
    // Don't change step until we have the results

    try {
      console.log("AITaskCreation - Starting API call to generate tasks");
      // Call the AI API to generate recommendations
      const response = await fetch("/api/ai/generate-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...homeAssessment,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate recommendations");
      }

      const data = await response.json();
      console.log("AITaskCreation - Received data from API");
      setAssessment(data.assessment);
      setRecommendations(data.recommendations);

      // Only change step after we have the results
      setCurrentStep("recommendations");
    } catch (error) {
      console.error("Error generating recommendations:", error);
      // For now, show mock recommendations
      setAssessment(homeAssessment as HomeAssessment);
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
          source: "fallback" as const,
        },
      ]);
      setCurrentStep("recommendations");
    } finally {
      console.log("AITaskCreation - Setting isGeneratingTasks to false");
      setIsGeneratingTasks(false);
    }
  };

  const handleAddTasks = async (selectedTasks: AIRecommendation[]) => {
    setIsLoading(true);
    try {
      // Call the API to create tasks
      const response = await fetch("/api/tasks/ai-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          tasks: selectedTasks,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create tasks");
      }

      const result = await response.json();
      console.log("Tasks created successfully:", result);

      // Show success message and complete
      setCurrentStep("complete");
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error("Error adding tasks:", error);
      // You could show an error message to the user here
      alert(
        language === "es"
          ? "Error al crear las tareas. Por favor, intenta de nuevo."
          : "Error creating tasks. Please try again."
      );
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
            variant="outline"
            onClick={() => {
              setCurrentStep("interview");
              setIsGeneratingTasks(true);
              setTimeout(() => {
                setIsGeneratingTasks(false);
              }, 3000);
            }}
          >
            {language === "es" ? "Probar Carga" : "Test Loading"}
          </Button>

          <Button onClick={handleStartInterview}>
            {language === "es" ? "Comenzar" : "Get Started"}
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

  const renderGeneratingTasks = () => (
    <Card className="p-8 max-w-2xl mx-auto text-center">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <Sparkles className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {language === "es"
              ? "Generando Recomendaciones Personalizadas"
              : "Generating Personalized Recommendations"}
          </h2>

          <p className="text-lg text-gray-600 max-w-md">
            {language === "es"
              ? "Nuestro AI está analizando tu hogar y creando un plan de limpieza personalizado basado en tus necesidades específicas..."
              : "Our AI is analyzing your home and creating a personalized cleaning plan based on your specific needs..."}
          </p>

          <div className="bg-blue-50 rounded-lg p-4 text-left max-w-sm">
            <h3 className="font-semibold text-blue-900 mb-2">
              {language === "es" ? "Analizando:" : "Analyzing:"}
            </h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span>{language === "es" ? "Tipo de hogar" : "Home type"}</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span>{language === "es" ? "Habitaciones" : "Rooms"}</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span>
                  {language === "es" ? "Estilo de vida" : "Lifestyle"}
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span>
                  {language === "es" ? "Preferencias" : "Preferences"}
                </span>
              </li>
            </ul>
          </div>

          <div className="text-sm text-gray-500">
            {language === "es"
              ? "Esto puede tomar unos segundos..."
              : "This may take a few seconds..."}
          </div>
        </div>
      </div>
    </Card>
  );

  switch (currentStep) {
    case "welcome":
      return renderWelcome();

    case "interview":
      console.log(
        "AITaskCreation - Rendering AIInterview with isGeneratingTasks:",
        isGeneratingTasks
      );
      console.log("AITaskCreation - Current step:", currentStep);
      return (
        <AIInterview
          onComplete={handleInterviewComplete}
          onCancel={handleCancel}
          isExternalLoading={isGeneratingTasks}
        />
      );

    case "generating":
      console.log("AITaskCreation - Rendering generating state");
      return renderGeneratingTasks();

    case "recommendations":
      console.log("AITaskCreation - Rendering recommendations");
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
