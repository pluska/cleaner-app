"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/layout/Card";
import { Button } from "@/components/ui/forms/Button";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import {
  Sparkles,
  CheckCircle,
  Home,
  Users,
  Baby,
  Dog,
  Clock,
  Star,
} from "lucide-react";
import {
  HomeAssessmentInput,
  TaskTemplate,
  UserTask,
  TaskInstance,
} from "@/types";

interface OnboardingStep {
  id: string;
  title: string;
  title_es: string;
  description: string;
  description_es: string;
  icon: React.ReactNode;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "loading",
    title: "Loading your information...",
    title_es: "Cargando tu información...",
    description: "We're retrieving your home assessment data",
    description_es: "Estamos recuperando los datos de tu evaluación del hogar",
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    id: "creating_profile",
    title: "Establishing the Base...",
    title_es: "Estableciendo la base...",
    description: "Setting up your personalized user profile",
    description_es: "Configurando tu perfil de usuario personalizado",
    icon: <Users className="w-6 h-6" />,
  },
  {
    id: "generating_tasks",
    title: "Scouting the Realm for Quests...",
    title_es: "Explorando el Reino en busca de Misiones...",
    description: "Creating a personalized cleaning plan based on your home",
    description_es: "Creando un plan de limpieza personalizado basado en tu hogar",
    icon: <Home className="w-6 h-6" />,
  },
  {
    id: "finalizing",
    title: "Preparing Adventure Log...",
    title_es: "Preparando Diario de Aventuras...",
    description: "Preparing your dashboard and tools",
    description_es: "Preparando tu panel de control y herramientas",
    icon: <Star className="w-6 h-6" />,
  },
];

export default function OnboardingPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [assessment, setAssessment] = useState<HomeAssessmentInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedTasks, setGeneratedTasks] = useState<number>(0);

  useEffect(() => {
    const initializeOnboarding = async () => {
      try {
        // Step 1: Load assessment from localStorage
        setCurrentStep(0);
        const savedAssessment = localStorage.getItem("pendingHomeAssessment");
        
        if (!savedAssessment) {
          throw new Error("No home assessment found");
        }

        const parsedAssessment: HomeAssessmentInput = JSON.parse(savedAssessment);
        setAssessment(parsedAssessment);

        // Step 2: Create user profile
        setCurrentStep(1);
        await createUserProfile(parsedAssessment);

        // Step 3: Generate suggested tasks
        setCurrentStep(2);
        const tasks = await generateSuggestedTasks(parsedAssessment);
        setGeneratedTasks(tasks.length);

        // Step 4: Finalize setup
        setCurrentStep(3);
        await finalizeSetup();

        // Step 5: Redirect to dashboard
        setTimeout(() => {
          const gamificationProfile = localStorage.getItem("pendingGamificationProfile");
          if (gamificationProfile) {
            localStorage.setItem("firstLoginData", gamificationProfile);
            localStorage.removeItem("pendingGamificationProfile");
          }
          localStorage.removeItem("pendingHomeAssessment");
          router.push("/");
        }, 2000);

      } catch (error) {
        console.error("Onboarding error:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      }
    };

    initializeOnboarding();
  }, [router]);

  const createUserProfile = async (assessment: HomeAssessmentInput) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const response = await fetch("/api/user/home-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assessment),
      });

      if (!response.ok) {
        throw new Error("Failed to create home assessment");
      }

      // Create home areas based on rooms
      for (const room of assessment.rooms) {
        await fetch("/api/user/areas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            area_name: room.name,
            area_type: room.type,
            size: room.size,
            has_carpet: room.has_carpet,
            has_hardwood: room.has_hardwood,
            has_tile: room.has_tile,
            special_features: room.special_features,
          }),
        });
      }
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  };

  const generateSuggestedTasks = async (assessment: HomeAssessmentInput): Promise<any[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Get task templates based on user's rooms
      const roomTypes = assessment.rooms.map(room => room.type);
      
      const response = await fetch("/api/tasks/suggested", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rooms: roomTypes,
          lifestyle: assessment.lifestyle,
          cleaning_preferences: assessment.cleaning_preferences,
          pets: assessment.pets,
          children: assessment.children,
          allergies: assessment.allergies,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate suggested tasks");
      }

      const data = await response.json();
      return data.tasks || [];
    } catch (error) {
      console.error("Error generating suggested tasks:", error);
      throw error;
    }
  };

  const finalizeSetup = async () => {
    // Simulate final setup delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const getCurrentStep = () => ONBOARDING_STEPS[currentStep];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base to-bg flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md mx-auto">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {language === "es" ? "Error en la configuración" : "Setup Error"}
            </h3>
            <p className="text-gray-600">{error}</p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="mt-4"
            >
              {language === "es" ? "Ir al Dashboard" : "Go to Dashboard"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base to-bg flex items-center justify-center p-6">
      <Card className="p-8 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SparkClean</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {language === "es" ? "Configurando tu experiencia" : "Setting up your experience"}
          </h1>
          <p className="text-gray-600">
            {language === "es"
              ? "Estamos personalizando todo para ti"
              : "We're personalizing everything for you"}
          </p>
        </div>

        {/* Current Step */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              {getCurrentStep().icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {language === "es" ? getCurrentStep().title_es : getCurrentStep().title}
              </h3>
              <p className="text-sm text-gray-600">
                {language === "es" ? getCurrentStep().description_es : getCurrentStep().description}
              </p>
            </div>
          </div>
          
          {currentStep === 2 && generatedTasks > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {language === "es" 
                    ? `${generatedTasks} tareas generadas`
                    : `${generatedTasks} tasks generated`
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {language === "es" ? "Progreso" : "Progress"}
            </span>
            <span className="text-sm text-gray-500">
              {currentStep + 1} / {ONBOARDING_STEPS.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
            <div>
              <h3 className="font-medium text-blue-900">
                {language === "es" ? "¿Qué estamos haciendo?" : "What are we doing?"}
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                {language === "es"
                  ? "Creando tu perfil, configurando las áreas de tu hogar y generando un plan de limpieza personalizado basado en tus respuestas."
                  : "Creating your profile, setting up your home areas, and generating a personalized cleaning plan based on your answers."}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
