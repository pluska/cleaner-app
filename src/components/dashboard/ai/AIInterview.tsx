"use client";

import { useState } from "react";
import { Card } from "@/components/ui/layout/Card";
import { Button } from "@/components/ui/forms/Button";
import { Input } from "@/components/ui/forms/Input";
import { Select } from "@/components/ui/forms/Select";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import {
  Home,
  Users,
  Baby,
  Dog,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import {
  AIInterviewQuestion,
  AIInterviewResponse,
  HomeAssessment,
  Room,
  HomeType,
  Lifestyle,
  CleaningPreference,
  RoomType,
  RoomSize,
} from "@/types";

interface AIInterviewProps {
  onComplete: (assessment: HomeAssessment) => void;
  onCancel: () => void;
}

const INTERVIEW_QUESTIONS: AIInterviewQuestion[] = [
  {
    id: "home_type",
    question: "What type of home do you live in?",
    type: "select",
    options: ["apartment", "house", "studio"],
    required: true,
    order: 1,
  },
  {
    id: "lifestyle",
    question: "How would you describe your lifestyle?",
    type: "select",
    options: ["busy", "moderate", "relaxed"],
    required: true,
    order: 2,
  },
  {
    id: "cleaning_preferences",
    question: "What's your preferred cleaning intensity?",
    type: "select",
    options: ["minimal", "standard", "thorough"],
    required: true,
    order: 3,
  },
  {
    id: "pets",
    question: "Do you have pets?",
    type: "boolean",
    required: true,
    order: 4,
  },
  {
    id: "children",
    question: "Do you have children?",
    type: "boolean",
    required: true,
    order: 5,
  },
  {
    id: "allergies",
    question: "Do you or anyone in your household have allergies?",
    type: "boolean",
    required: true,
    order: 6,
  },
  {
    id: "rooms",
    question: "What rooms do you have in your home?",
    type: "multiselect",
    options: [
      "kitchen",
      "bathroom",
      "bedroom",
      "living_room",
      "dining_room",
      "office",
      "laundry_room",
      "garage",
      "basement",
      "attic",
      "hallway",
      "entryway",
    ],
    required: true,
    order: 7,
  },
];

export function AIInterview({ onComplete, onCancel }: AIInterviewProps) {
  const { language } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(
    new Set()
  );

  const currentQuestion = INTERVIEW_QUESTIONS[currentQuestionIndex];

  const handleResponse = (value: any) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
    setCompletedQuestions((prev) => new Set([...prev, currentQuestionIndex]));
  };

  const handleNext = () => {
    if (currentQuestionIndex < INTERVIEW_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleGenerateTasks();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleGenerateTasks = async () => {
    setIsGenerating(true);

    try {
      // Convert responses to HomeAssessment format
      const assessment: HomeAssessment = {
        id: "", // Will be set by the API
        created_at: new Date().toISOString(),
        user_id: "", // Will be set by the API
        home_type: responses.home_type as HomeType,
        lifestyle: responses.lifestyle as Lifestyle,
        cleaning_preferences:
          responses.cleaning_preferences as CleaningPreference,
        pets: responses.pets as boolean,
        children: responses.children as boolean,
        allergies: responses.allergies as boolean,
        rooms: ((responses.rooms as string[]) || []).map((roomType) => ({
          name: roomType,
          type: roomType as RoomType,
          size: "medium" as RoomSize,
          has_carpet: false,
          has_hardwood: false,
          has_tile: false,
          special_features: [],
        })),
      };

      onComplete(assessment);
    } catch (error) {
      console.error("Error generating tasks:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getQuestionLabel = (questionId: string): string => {
    const labels: Record<string, string> = {
      home_type: language === "es" ? "Tipo de vivienda" : "Home Type",
      lifestyle: language === "es" ? "Estilo de vida" : "Lifestyle",
      cleaning_preferences:
        language === "es" ? "Preferencias de limpieza" : "Cleaning Preferences",
      pets: language === "es" ? "Mascotas" : "Pets",
      children: language === "es" ? "Niños" : "Children",
      allergies: language === "es" ? "Alergias" : "Allergies",
      rooms: language === "es" ? "Habitaciones" : "Rooms",
    };
    return labels[questionId] || questionId;
  };

  const getOptionLabel = (option: string): string => {
    const labels: Record<string, Record<string, string>> = {
      home_type: {
        apartment: language === "es" ? "Apartamento" : "Apartment",
        house: language === "es" ? "Casa" : "House",
        studio: language === "es" ? "Estudio" : "Studio",
      },
      lifestyle: {
        busy: language === "es" ? "Ocupado" : "Busy",
        moderate: language === "es" ? "Moderado" : "Moderate",
        relaxed: language === "es" ? "Relajado" : "Relaxed",
      },
      cleaning_preferences: {
        minimal: language === "es" ? "Mínima" : "Minimal",
        standard: language === "es" ? "Estándar" : "Standard",
        thorough: language === "es" ? "Exhaustiva" : "Thorough",
      },
      rooms: {
        kitchen: language === "es" ? "Cocina" : "Kitchen",
        bathroom: language === "es" ? "Baño" : "Bathroom",
        bedroom: language === "es" ? "Dormitorio" : "Bedroom",
        living_room: language === "es" ? "Sala de estar" : "Living Room",
        dining_room: language === "es" ? "Comedor" : "Dining Room",
        office: language === "es" ? "Oficina" : "Office",
        laundry_room: language === "es" ? "Lavandería" : "Laundry Room",
        garage: language === "es" ? "Garaje" : "Garage",
        basement: language === "es" ? "Sótano" : "Basement",
        attic: language === "es" ? "Ático" : "Attic",
        hallway: language === "es" ? "Pasillo" : "Hallway",
        entryway: language === "es" ? "Entrada" : "Entryway",
      },
    };
    return labels[currentQuestion.id]?.[option] || option;
  };

  const renderQuestion = () => {
    const currentValue = responses[currentQuestion.id];

    switch (currentQuestion.type) {
      case "select":
        return (
          <Select
            value={currentValue || ""}
            onChange={(e) => handleResponse(e.target.value)}
            className="w-full"
          >
            <option value="">
              {language === "es" ? "Seleccionar..." : "Select..."}
            </option>
            {currentQuestion.options?.map((option) => (
              <option key={option} value={option}>
                {getOptionLabel(option)}
              </option>
            ))}
          </Select>
        );

      case "multiselect":
        const selectedValues = (currentValue as string[]) || [];
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleResponse([...selectedValues, option]);
                    } else {
                      handleResponse(
                        selectedValues.filter((v) => v !== option)
                      );
                    }
                  }}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">{getOptionLabel(option)}</span>
              </label>
            ))}
          </div>
        );

      case "boolean":
        return (
          <div className="flex space-x-4">
            <Button
              variant={currentValue === true ? "primary" : "outline"}
              onClick={() => handleResponse(true)}
              className="flex-1"
            >
              {language === "es" ? "Sí" : "Yes"}
            </Button>
            <Button
              variant={currentValue === false ? "primary" : "outline"}
              onClick={() => handleResponse(false)}
              className="flex-1"
            >
              {language === "es" ? "No" : "No"}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / INTERVIEW_QUESTIONS.length) * 100;
  };

  const getQuestionIcon = () => {
    const icons: Record<string, React.ReactNode> = {
      home_type: <Home className="w-5 h-5" />,
      lifestyle: <Clock className="w-5 h-5" />,
      cleaning_preferences: <Sparkles className="w-5 h-5" />,
      pets: <Dog className="w-5 h-5" />,
      children: <Baby className="w-5 h-5" />,
      allergies: <Users className="w-5 h-5" />,
      rooms: <Users className="w-5 h-5" />,
    };
    return icons[currentQuestion.id] || <Home className="w-5 h-5" />;
  };

  if (isGenerating) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <h3 className="text-xl font-semibold text-gray-900">
            {language === "es"
              ? "Generando tareas personalizadas..."
              : "Generating personalized tasks..."}
          </h3>
          <p className="text-gray-600">
            {language === "es"
              ? "Nuestro AI está analizando tu hogar y creando un plan de limpieza personalizado."
              : "Our AI is analyzing your home and creating a personalized cleaning plan."}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {language === "es" ? "Progreso" : "Progress"}
          </span>
          <span className="text-sm text-gray-500">
            {currentQuestionIndex + 1} / {INTERVIEW_QUESTIONS.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          {getQuestionIcon()}
          <h2 className="text-xl font-semibold text-gray-900">
            {getQuestionLabel(currentQuestion.id)}
          </h2>
        </div>
        <p className="text-gray-600 mb-4">{currentQuestion.question}</p>
        {renderQuestion()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          {language === "es" ? "Anterior" : "Previous"}
        </Button>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            {language === "es" ? "Cancelar" : "Cancel"}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!responses[currentQuestion.id]}
            className="flex items-center space-x-2"
          >
            {currentQuestionIndex === INTERVIEW_QUESTIONS.length - 1 ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>
                  {language === "es" ? "Generar Tareas" : "Generate Tasks"}
                </span>
              </>
            ) : (
              <>
                <span>{language === "es" ? "Siguiente" : "Next"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
