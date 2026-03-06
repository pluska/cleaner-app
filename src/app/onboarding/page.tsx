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
  ChevronRight,
  ChevronLeft,
  Building,
  Briefcase,
  Coffee,
  Heart,
  Shield,
  Sofa,
  BedDouble,
  Bath,
  Utensils
} from "lucide-react";
import {
  HomeAssessmentInput,
  Room,
  RoomType,
} from "@/types";

interface OnboardingStep {
  id: string;
  title: string;
  title_es: string;
  description: string;
  description_es: string;
  icon: React.ReactNode;
}

const PROCESS_STEPS: OnboardingStep[] = [
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

  // Questionnaire State
  const [isOnboardingForm, setIsOnboardingForm] = useState(true);
  const [formStep, setFormStep] = useState(0);
  
  const [formData, setFormData] = useState<Partial<HomeAssessmentInput>>({
    home_type: "house",
    rooms: [
      { name: "Kitchen", type: "kitchen", size: "medium", has_carpet: false, has_hardwood: true, has_tile: false },
      { name: "Bathroom", type: "bathroom", size: "small", has_carpet: false, has_hardwood: false, has_tile: true },
      { name: "Bedroom", type: "bedroom", size: "medium", has_carpet: true, has_hardwood: false, has_tile: false },
      { name: "Living Room", type: "living_room", size: "large", has_carpet: false, has_hardwood: true, has_tile: false }
    ],
    pets: false,
    children: false,
    allergies: false,
    lifestyle: "moderate",
    cleaning_preferences: "standard",
  });

  const [selectedRooms, setSelectedRooms] = useState<string[]>(["kitchen", "bathroom", "bedroom", "living_room"]);

  // Processing State
  const [processStep, setProcessStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedTasks, setGeneratedTasks] = useState<number>(0);

  useEffect(() => {
    if (isOnboardingForm) return;

    const initializeOnboarding = async () => {
      try {
        setProcessStep(0);
        const savedAssessment = localStorage.getItem("pendingHomeAssessment");
        
        if (!savedAssessment) {
          throw new Error("No home assessment found");
        }

        const parsedAssessment: HomeAssessmentInput = JSON.parse(savedAssessment);

        // Step 2: Create user profile
        setProcessStep(1);
        await createUserProfile(parsedAssessment);

        // Step 3: Generate suggested tasks
        setProcessStep(2);
        const tasks = await generateSuggestedTasks(parsedAssessment);
        setGeneratedTasks(tasks.length);

        // Step 4: Finalize setup
        setProcessStep(3);
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
        }, 1500);

      } catch (err) {
        console.error("Onboarding error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    };

    initializeOnboarding();
  }, [isOnboardingForm, router]);

  const createUserProfile = async (assessment: HomeAssessmentInput) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      const response = await fetch("/api/user/home-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assessment),
      });

      if (!response.ok) throw new Error("Failed to create home assessment");

      for (const room of assessment.rooms) {
        await fetch("/api/user/areas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            area_name: room.name,
            area_type: room.type,
            size: room.size,
            has_carpet: room.has_carpet,
            has_hardwood: room.has_hardwood,
            has_tile: room.has_tile,
            special_features: room.special_features || [],
          }),
        });
      }
    } catch (err) {
      console.error("Error creating user profile:", err);
      // We ignore error for now to let user proceed even if mock fails
    }
  };

  const generateSuggestedTasks = async (assessment: HomeAssessmentInput): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const roomTypes = assessment.rooms.map(room => room.type);
      const response = await fetch("/api/tasks/suggested", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rooms: roomTypes,
          lifestyle: assessment.lifestyle,
          cleaning_preferences: assessment.cleaning_preferences,
          pets: assessment.pets,
          children: assessment.children,
          allergies: assessment.allergies,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate suggested tasks");
      const data = await response.json();
      return data.tasks || [];
    } catch (err) {
      console.error("Error generating suggested tasks:", err);
      return []; // Return empty array if error
    }
  };

  const finalizeSetup = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleNextForm = () => {
    if (formStep < 4) {
      setFormStep(prev => prev + 1);
    } else {
      // Build final rooms based on selection
      const mappedRooms: Room[] = selectedRooms.map((roomCode) => {
        let name = roomCode.charAt(0).toUpperCase() + roomCode.slice(1).replace('_', ' ');
        return {
          name,
          type: roomCode as RoomType,
          size: "medium",
          has_carpet: roomCode === "bedroom" || roomCode === "living_room",
          has_hardwood: roomCode === "kitchen" || roomCode === "living_room",
          has_tile: roomCode === "bathroom" || roomCode === "kitchen",
        };
      });

      const finalData = { ...formData, rooms: mappedRooms } as HomeAssessmentInput;
      localStorage.setItem("pendingHomeAssessment", JSON.stringify(finalData));
      setIsOnboardingForm(false);
    }
  };

  const handlePrevForm = () => {
    if (formStep > 0) setFormStep(prev => prev - 1);
  };

  const updateFormData = (key: keyof HomeAssessmentInput, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleRoom = (room: string) => {
    if (selectedRooms.includes(room)) {
      setSelectedRooms(selectedRooms.filter(r => r !== room));
    } else {
      setSelectedRooms([...selectedRooms, room]);
    }
  };

  // -------------------------
  // RENDER QUESTIONNAIRE FORM
  // -------------------------
  if (isOnboardingForm) {
    const isEs = language === "es";

    return (
      <div className="min-h-screen bg-gradient-to-br from-base to-bg flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl mb-8 flex justify-between items-center px-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
            <span className="text-2xl font-bold text-gray-900">SparkClean</span>
          </div>
          <div className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
            {formStep + 1} / 5
          </div>
        </div>

        <Card className="p-8 max-w-2xl mx-auto w-full border-t-4 border-t-primary shadow-xl">
          <div className="min-h-[350px]">
            {/* Step 0: Home Type */}
            {formStep === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isEs ? "¿Qué tipo de hogar tienes?" : "What type of home do you have?"}
                </h2>
                <p className="text-gray-500 mb-8">
                  {isEs ? "Esto nos ayuda a dimensionar el trabajo." : "This helps us properly size the work."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: "apartment", icon: <Building className="w-8 h-8 mb-3" />, title: isEs ? "Apartamento" : "Apartment" },
                    { id: "house", icon: <Home className="w-8 h-8 mb-3" />, title: isEs ? "Casa" : "House" },
                    { id: "studio", icon: <Sofa className="w-8 h-8 mb-3" />, title: isEs ? "Estudio" : "Studio" },
                  ].map(ht => (
                    <button
                      key={ht.id}
                      onClick={() => updateFormData("home_type", ht.id)}
                      className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${
                        formData.home_type === ht.id 
                          ? "border-primary bg-primary/5 text-primary shadow-md transform scale-105" 
                          : "border-gray-100 bg-white text-gray-500 hover:border-primary/30 hover:bg-gray-50"
                      }`}
                    >
                      {ht.icon}
                      <span className="font-semibold">{ht.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1: Rooms */}
            {formStep === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isEs ? "¿Qué habitaciones debemos limpiar?" : "Which rooms should we clean?"}
                </h2>
                <p className="text-gray-500 mb-6">
                  {isEs ? "Selecciona todas las áreas aplicables." : "Select all areas that apply."}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: "kitchen", icon: <Utensils className="w-5 h-5 mb-1" />, label: isEs ? "Cocina" : "Kitchen" },
                    { id: "bathroom", icon: <Bath className="w-5 h-5 mb-1" />, label: isEs ? "Baño" : "Bathroom" },
                    { id: "bedroom", icon: <BedDouble className="w-5 h-5 mb-1" />, label: isEs ? "Habitación" : "Bedroom" },
                    { id: "living_room", icon: <Sofa className="w-5 h-5 mb-1" />, label: isEs ? "Sala" : "Living" },
                    { id: "dining_room", icon: <Coffee className="w-5 h-5 mb-1" />, label: isEs ? "Comedor" : "Dining" },
                    { id: "office", icon: <Briefcase className="w-5 h-5 mb-1" />, label: isEs ? "Oficina" : "Office" },
                  ].map(room => (
                    <button
                      key={room.id}
                      onClick={() => toggleRoom(room.id)}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                        selectedRooms.includes(room.id)
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-gray-100 bg-white text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {room.icon}
                      <span className="text-sm font-medium">{room.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Occupants */}
            {formStep === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isEs ? "¿Quién vive aquí?" : "Who lives here?"}
                </h2>
                <p className="text-gray-500 mb-8">
                  {isEs ? "Esto adapta las tareas de limpieza a tu realidad." : "This tailors cleaning tasks to your reality."}
                </p>
                <div className="space-y-4">
                  {[
                    { key: "pets", icon: <Dog className="w-6 h-6 text-orange-500" />, label: isEs ? "Tengo mascotas (pelos por doquier)" : "I have pets (hair everywhere)" },
                    { key: "children", icon: <Baby className="w-6 h-6 text-blue-500" />, label: isEs ? "Tengo niños (juguetes y manchas)" : "I have children (toys and spills)" },
                    { key: "allergies", icon: <Shield className="w-6 h-6 text-green-500" />, label: isEs ? "Alguien sufre de alergias" : "Someone here has allergies" },
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => updateFormData(item.key as keyof HomeAssessmentInput, !formData[item.key as keyof HomeAssessmentInput])}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                        formData[item.key as keyof HomeAssessmentInput]
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-gray-100 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-white rounded-full shadow-sm">
                          {item.icon}
                        </div>
                        <span className="font-semibold text-gray-800">{item.label}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        formData[item.key as keyof HomeAssessmentInput] ? "border-primary bg-primary text-white" : "border-gray-300"
                      }`}>
                        {formData[item.key as keyof HomeAssessmentInput] && <CheckCircle className="w-4 h-4" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Lifestyle */}
            {formStep === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isEs ? "¿Cómo es tu ritmo de vida?" : "What's your lifestyle like?"}
                </h2>
                <p className="text-gray-500 mb-8">
                  {isEs ? "Para no agobiarte con tareas imposibles." : "So we don't overwhelm you with impossible tasks."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: "busy", icon: <Briefcase className="w-8 h-8 mb-3 text-red-500" />, title: isEs ? "Ocupado" : "Busy", desc: isEs ? "Poco tiempo libre" : "Little free time" },
                    { id: "moderate", icon: <Coffee className="w-8 h-8 mb-3 text-yellow-500" />, title: isEs ? "Moderado" : "Moderate", desc: isEs ? "Equilibrio normal" : "Normal balance" },
                    { id: "relaxed", icon: <Heart className="w-8 h-8 mb-3 text-green-500" />, title: isEs ? "Relajado" : "Relaxed", desc: isEs ? "Disfruto estar en casa" : "I enjoy home time" },
                  ].map(ls => (
                    <button
                      key={ls.id}
                      onClick={() => updateFormData("lifestyle", ls.id)}
                      className={`flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all ${
                        formData.lifestyle === ls.id 
                          ? "border-primary bg-primary/5 text-primary shadow-md transform scale-105" 
                          : "border-gray-100 bg-white text-gray-500 hover:border-primary/30 hover:bg-gray-50"
                      }`}
                    >
                      {ls.icon}
                      <span className="font-bold text-gray-900 mb-1">{ls.title}</span>
                      <span className="text-xs text-gray-500">{ls.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Cleaning Preferences */}
            {formStep === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isEs ? "¿Qué tan limpio quieres todo?" : "How clean do you want everything?"}
                </h2>
                <p className="text-gray-500 mb-8">
                  {isEs ? "Establecemos tu nivel de excelencia." : "We establish your level of excellence."}
                </p>
                <div className="space-y-4">
                  {[
                    { id: "minimal", title: isEs ? "Lo básico" : "The basics", desc: isEs ? "Solo quiero que se vea ordenado." : "I just want it looking tidy." },
                    { id: "standard", title: isEs ? "Estándar" : "Standard", desc: isEs ? "Limpio y saludable, sin obsesiones." : "Clean and healthy, no obsessions." },
                    { id: "thorough", title: isEs ? "Impecable" : "Spotless", desc: isEs ? "Quiero que mi casa brille como un espejo." : "I want my house shining like a mirror." },
                  ].map(pref => (
                    <button
                      key={pref.id}
                      onClick={() => updateFormData("cleaning_preferences", pref.id)}
                      className={`w-full flex items-center p-5 rounded-2xl border-2 transition-all text-left ${
                        formData.cleaning_preferences === pref.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-gray-100 bg-white hover:border-primary/30"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center ${
                        formData.cleaning_preferences === pref.id ? "border-primary" : "border-gray-300"
                      }`}>
                        {formData.cleaning_preferences === pref.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <div className={`font-bold ${formData.cleaning_preferences === pref.id ? "text-primary" : "text-gray-900"}`}>
                          {pref.title}
                        </div>
                        <div className="text-sm text-gray-500">{pref.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handlePrevForm}
              disabled={formStep === 0}
              className={formStep === 0 ? "opacity-0 pointer-events-none" : "flex items-center pl-2"}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              {isEs ? "Atrás" : "Back"}
            </Button>
            
            <Button
              onClick={handleNextForm}
              className="flex items-center pr-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              {formStep === 4 ? (isEs ? "Finalizar" : "Finish") : (isEs ? "Siguiente" : "Next")}
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // -------------------------
  // RENDER PROCESSING STEPS
  // -------------------------
  const currentProcessStep = PROCESS_STEPS[processStep];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base to-bg flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md mx-auto shadow-xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {language === "es" ? "Error en la configuración" : "Setup Error"}
            </h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => router.push("/")} className="mt-4 w-full">
              {language === "es" ? "Volver al Inicio" : "Back to Home"}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base to-bg flex items-center justify-center p-6">
      <Card className="p-10 max-w-md mx-auto w-full shadow-2xl border-t-4 border-t-primary">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Sparkles className="h-10 w-10 text-blue-600 animate-pulse" />
            <span className="text-3xl font-bold text-gray-900 tracking-tight">SparkClean</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {language === "es" ? "Configurando tu viaje" : "Setting up your journey"}
          </h1>
          <p className="text-gray-500 font-medium">
            {language === "es"
              ? "Forjando tus misiones de limpieza..."
              : "Forging your cleaning quests..."}
          </p>
        </div>

        {/* Current Step */}
        <div className="mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
              {currentProcessStep?.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">
                {language === "es" ? currentProcessStep?.title_es : currentProcessStep?.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {language === "es" ? currentProcessStep?.description_es : currentProcessStep?.description}
              </p>
            </div>
          </div>
          
          {processStep === 2 && generatedTasks > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold">
                  {language === "es" 
                    ? `¡${generatedTasks} misiones creadas!`
                    : `${generatedTasks} quests forged!`
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              {language === "es" ? "Progreso" : "Progress"}
            </span>
            <span className="text-sm font-bold text-primary">
              {Math.round(((processStep + 1) / PROCESS_STEPS.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${((processStep + 1) / PROCESS_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center mt-8">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    </div>
  );
}
