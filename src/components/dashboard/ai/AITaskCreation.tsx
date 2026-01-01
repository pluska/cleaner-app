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
    <Card className="p-8 max-w-2xl mx-auto text-center border-2 border-blue-200">
      <div className="flex flex-col items-center space-y-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-3 rounded-full">
             <Sparkles className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === "es"
              ? "Habla con Sparklin"
              : "Consult Sparklin"}
          </h1>
        </div>

        <p className="text-lg text-gray-600 max-w-lg italic">
          "{language === "es"
            ? "Saludos, Héroe. Los Conejitos de Polvo se reúnen en las esquinas. ¿Debemos desterrarlos?"
            : "Greetings, Hero. The Dust Bunnies gather in the dark corners. Shall we banish them?"}"
        </p>

        <div className="bg-blue-50 rounded-lg p-6 text-left max-w-md border border-blue-100">
          <h3 className="font-bold text-blue-900 mb-3 uppercase tracking-wide text-xs">
            {language === "es" ? "Servicios del Oráculo" : "Oracle Services"}
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-center space-x-2">
              <span className="text-xl">🏰</span>
              <span>
                {language === "es"
                  ? "Evaluación del Reino (Hogar)"
                  : "Realm Assessment (Home Analysis)"}
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-xl">📜</span>
              <span>
                {language === "es"
                  ? "Pergaminos de Sabiduría (Consejos)"
                  : "Scrolls of Wisdom (Tips)"}
              </span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-xl">⚔️</span>
              <span>
                {language === "es"
                  ? "Contratos de Misión (Tareas)"
                  : "Quest Contracts (Tasks)"}
              </span>
            </li>
          </ul>
        </div>

        <div className="flex space-x-4">
          <Button variant="outline" onClick={handleCancel}>
            {language === "es" ? "Retirarse" : "Retreat"}
          </Button>

          <Button onClick={handleStartInterview} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform hover:scale-105 transition-all">
            <Sparkles className="w-4 h-4 mr-2" />
            {language === "es" ? "Invocar a Sparklin" : "Summon Sparklin"}
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderComplete = () => (
    <Card className="p-8 max-w-2xl mx-auto text-center border-2 border-green-200">
      <div className="flex flex-col items-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
          <Sparkles className="w-8 h-8 text-green-600" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900">
          {language === "es" ? "¡Misiones Generadas!" : "Quests Generated!"}
        </h2>

        <p className="text-gray-600">
          {language === "es"
            ? "El Oráculo ha hablado. Tu Diario de Aventuras ha sido actualizado."
            : "The Oracle has spoken. Your Adventure Log has been updated with new quests."}
        </p>

        <Button onClick={onComplete} className="flex items-center space-x-2">
          <span>{language === "es" ? "Ver Tablero" : "View Quest Board"}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );

  const renderGeneratingTasks = () => (
    <Card className="p-8 max-w-2xl mx-auto text-center">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <Sparkles className="w-10 h-10 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-purple-900">
            {language === "es"
              ? "Consultando los Textos Antiguos..."
              : "Consulting the Ancient Texts..."}
          </h2>

          <p className="text-lg text-gray-600 max-w-md italic">
            "{language === "es"
              ? "Sparklin está tejiendo los hilos del destino (y de la limpieza)..."
              : "Sparklin is weaving the threads of fate (and cleaning)..."}"
          </p>
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
