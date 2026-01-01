"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/layout/Card";
import { Button } from "@/components/ui/forms/Button";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import {
  Sword,
  Crown,
  Sparkles,
  ArrowRight,
  Shield,
  Tent,
  Users,
  Ghost,
  Utensils,
  Bath,
  Bed,
  Tv,
  Briefcase,
  Minus,
  Plus,
} from "lucide-react";
import { HomeAssessmentInput, RoomType, RoomSize } from "@/types";
import characterTemplates from "@/data/onboarding/character-templates.json";

// Type definitions for our templates
type CharacterClass = (typeof characterTemplates.classes)[0];
type PartyMode = (typeof characterTemplates.party_modes)[0];

const ROOM_ICONS: Record<string, any> = {
  KitchenIcon: Utensils,
  BathroomIcon: Bath,
  BedroomIcon: Bed,
  LivingIcon: Tv,
  DiningIcon: Utensils,
  OfficeIcon: Briefcase,
};

export default function FirstStepsPage() {
  const { language } = useLanguage();
  const router = useRouter();
  
  const [step, setStep] = useState<"class" | "party" | "map">("class");
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [selectedParty, setSelectedParty] = useState<PartyMode | null>(null);
  const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to get room icon component
  const getRoomIcon = (iconName: string) => {
    const Icon = ROOM_ICONS[iconName] || HomeIcon; // Fallback to HomeIcon if needed
    return <Icon className="w-6 h-6" />;
  };

  const handleComplete = async () => {
    if (!selectedClass || !selectedParty) return;

    setIsSubmitting(true);

    try {
      // Build rooms array based on quantities
      const roomsList = Object.entries(roomQuantities)
        .filter(([_, qty]) => qty > 0)
        .flatMap(([type, qty]) => 
          Array(qty).fill(null).map((_, i) => ({
            name: `${type} ${i + 1}`,
            type: type as RoomType,
            size: "medium" as RoomSize,
            has_carpet: false,
            has_hardwood: false,
            has_tile: false,
            special_features: [],
            quantity: 1
          }))
        );

      const assessment: HomeAssessmentInput = {
        home_type: "house", // Default, not asking anymore
        lifestyle: selectedClass.attributes.lifestyle as any,
        cleaning_preferences: selectedClass.attributes.cleaning_preferences as any,
        pets: selectedParty.attributes.pets,
        children: selectedParty.attributes.children,
        allergies: false, // Default for now
        rooms: roomsList,
      };

      localStorage.setItem("pendingHomeAssessment", JSON.stringify(assessment));
      localStorage.setItem("pendingGamificationProfile", JSON.stringify({
        classId: selectedClass.id,
        partyId: selectedParty.id
      }));
      router.push("/auth/signup?from=first-steps");
    } catch (error) {
      console.error("Error saving assessment:", error);
      setIsSubmitting(false);
    }
  };

  // --- STAGE 1: CHOOSE YOUR CLASS ---
  const renderClassSelection = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          {language === "es" ? "Elige tu Arquetipo" : "Choose Your Archetype"}
        </h1>
        <p className="text-gray-600">
          {language === "es" 
            ? "¿Cuál es tu filosofía de limpieza?" 
            : "What is your cleaning philosophy?"}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {characterTemplates.classes.map((charClass) => (
          <div
            key={charClass.id}
            onClick={() => setSelectedClass(charClass as CharacterClass)}
            className={`cursor-pointer transform transition-all duration-300 hover:scale-105 ${
              selectedClass?.id === charClass.id
                ? "ring-4 ring-blue-500 scale-105"
                : "hover:shadow-xl"
            }`}
          >
            <Card className="h-full overflow-hidden border-2 border-transparent hover:border-blue-200">
              <div className={`p-6 ${
                charClass.id === 'ranger' ? 'bg-green-50' :
                charClass.id === 'noble' ? 'bg-blue-50' : 'bg-purple-50'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    {charClass.id === 'ranger' && <Sword className="w-8 h-8 text-green-600" />}
                    {charClass.id === 'noble' && <Crown className="w-8 h-8 text-blue-600" />}
                    {charClass.id === 'high_elf' && <Sparkles className="w-8 h-8 text-purple-600" />}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/50 px-2 py-1 rounded">
                    {language === "es" && charClass.subtitle_es ? charClass.subtitle_es : charClass.subtitle}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1">
                  {language === "es" && charClass.name_es ? charClass.name_es : charClass.name}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {language === "es" && charClass.description_es ? charClass.description_es : charClass.description}
                </p>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {language === "es" ? "Nivel de Servicio" : "Service Level"}
                  </p>
                  <p className="font-bold text-gray-900">
                    {language === "es" && charClass.service_name_es ? charClass.service_name_es : charClass.service_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {language === "es" && charClass.service_desc_es ? charClass.service_desc_es : charClass.service_desc}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs font-medium italic text-gray-600">
                    "{language === "es" && charClass.motto_es ? charClass.motto_es : charClass.motto}"
                  </p>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-8">
        <Button
          size="lg"
          onClick={() => setStep("party")}
          disabled={!selectedClass}
          className="px-8"
        >
          {language === "es" ? "Continuar" : "Continue"} <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // --- STAGE 2: ASSEMBLE PARTY ---
  const renderPartySelection = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
          {language === "es" ? "Reúne a tu Grupo" : "Assemble Your Party"}
        </h1>
        <p className="text-gray-600">
          {language === "es" 
            ? "¿Quién habita en tu fortaleza?" 
            : "Who inhabits your stronghold?"}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {characterTemplates.party_modes.map((mode) => (
          <div
            key={mode.id}
            onClick={() => setSelectedParty(mode as PartyMode)}
            className={`cursor-pointer transform transition-all duration-300 ${
              selectedParty?.id === mode.id
                ? "ring-4 ring-orange-500 scale-105"
                : "hover:scale-105 hover:shadow-xl"
            }`}
          >
            <Card className="h-full p-6 flex items-start space-x-4 border-2 border-transparent hover:border-orange-200">
              <div className="text-4xl">{mode.icon}</div>
              <div className="space-y-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {language === "es" && mode.name_es ? mode.name_es : mode.name}
                  </h3>
                  <p className="text-xs font-medium text-orange-600 uppercase">
                    {language === "es" && mode.copy_es ? mode.copy_es : mode.copy}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  {language === "es" && mode.detail_es ? mode.detail_es : mode.detail}
                </p>
                {mode.effect && (
                  <div className="inline-block bg-orange-50 text-orange-800 text-xs px-2 py-1 rounded border border-orange-100 mt-2">
                    {language === "es" ? "Efecto: " : "Effect: "}
                    {language === "es" && mode.effect_es ? mode.effect_es : mode.effect}
                  </div>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-8 max-w-4xl mx-auto w-full">
        <Button variant="ghost" onClick={() => setStep("class")}>
          Back
        </Button>
        <Button
          size="lg"
          onClick={() => setStep("map")}
          disabled={!selectedParty}
        >
          {language === "es" ? "Continuar" : "Continue"} <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // --- STAGE 3: BUILD MAP ---
  const renderMapConstruction = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
          {language === "es" ? "Construye tu Reino" : "Build Your Realm"}
        </h1>
        <p className="text-gray-600">
          {language === "es" 
            ? "Define las áreas de tu dominio" 
            : "Define the areas of your domain"}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {characterTemplates.rooms.map((room) => {
          const qty = roomQuantities[room.id] || 0;
          return (
            <Card
              key={room.id}
              className={`p-6 transition-all duration-300 border-2 ${
                qty > 0 ? "border-green-500 bg-green-50/30" : "border-transparent hover:border-gray-200"
              }`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className={`p-3 rounded-full ${qty > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {getRoomIcon(room.icon)}
                </div>
                <h3 className="font-semibold text-gray-900">
                  {language === "es" ? room.label_es : room.label_en}
                </h3>
                
                <div className="flex items-center space-x-3 bg-white rounded-full shadow-sm p-1 border border-gray-200">
                  <button
                    onClick={() => setRoomQuantities(prev => ({ ...prev, [room.id]: Math.max(0, (prev[room.id] || 0) - 1) }))}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                    disabled={qty === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-bold text-gray-900">{qty}</span>
                  <button
                    onClick={() => setRoomQuantities(prev => ({ ...prev, [room.id]: (prev[room.id] || 0) + 1 }))}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between pt-8 max-w-4xl mx-auto w-full">
        <Button variant="ghost" onClick={() => setStep("party")}>
          Back
        </Button>
        <Button
          size="lg"
          onClick={handleComplete}
          disabled={Object.values(roomQuantities).reduce((a, b) => a + b, 0) === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          {language === "es" ? "Comenzar Aventura" : "Start Adventure"} <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base to-bg flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-auto">
          <LoadingSpinner size="lg" />
          <h3 className="text-xl font-semibold mt-4">Generating World...</h3>
        </Card>
      </div>
    );
  }

  // Common Icon fallback
  const HomeIcon = ({ className }: { className?: string }) => <div className={className} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="flex justify-center mb-12 space-x-4">
          {['class', 'party', 'map'].map((s, idx) => (
            <div key={s} className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${
                ['class', 'party', 'map'].indexOf(s) <= ['class', 'party', 'map'].indexOf(step)
                  ? 'bg-blue-600'
                  : 'bg-gray-300'
              }`} />
              {idx < 2 && <div className={`w-12 h-1 ${
                 ['class', 'party', 'map'].indexOf(s) < ['class', 'party', 'map'].indexOf(step)
                  ? 'bg-blue-600'
                  : 'bg-gray-200'
              }`} />}
            </div>
          ))}
        </div>

        {step === "class" && renderClassSelection()}
        {step === "party" && renderPartySelection()}
        {step === "map" && renderMapConstruction()}
      </div>
    </div>
  );
}
