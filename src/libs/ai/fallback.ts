import { HomeAssessment, AIRecommendation } from "@/types";

// Fallback mock recommendations
export function getStaticRecommendations(
  assessment: HomeAssessment,
  language: "en" | "es"
): AIRecommendation[] {
  const isSpanish = language === "es";
  const userRooms = assessment.rooms.map((r) => r.type || r.name.toLowerCase().replaceAll(" ","_"));

  const recommendations: AIRecommendation[] = [];

  // Kitchen tasks (if user has kitchen)
  if (userRooms.includes("kitchen")) {
    recommendations.push({
      task_name: isSpanish
        ? "Limpieza de Encimeras de Cocina"
        : "Kitchen Counter Cleaning",
      frequency_days: assessment.lifestyle === "busy" ? 2 : 1,
      importance_level: assessment.cleaning_preferences === "thorough" ? 5 : 4,
      reasoning: isSpanish
        ? "La limpieza diaria de encimeras previene el crecimiento bacteriano"
        : "Daily counter cleaning prevents bacterial growth and cross-contamination",
      health_impact: isSpanish
        ? "Previene enfermedades transmitidas por alimentos"
        : "Prevents foodborne illnesses and maintains kitchen hygiene",
      scientific_source: "CDC Food Safety Guidelines",
      source_url: "https://www.cdc.gov/foodsafety/",
      friendly_explanation: isSpanish
        ? "Mantener las encimeras de cocina limpias diariamente previene la propagación de bacterias que pueden causar intoxicación alimentaria."
        : "Keeping your kitchen counters clean daily prevents the spread of bacteria that can cause food poisoning.",
      exp_reward: 10,
      area_health_impact: 15,
      tools_required: ["microfiber_cloth", "all_purpose_cleaner"],
      difficulty: "easy",
      estimated_total_minutes: 15,
      source: "fallback",
      room_specific: "kitchen",
      subtasks: [
        {
          title: isSpanish
            ? "Limpiar todas las superficies de encimeras"
            : "Wipe down all counter surfaces",
          description: isSpanish
            ? "Remover migas y derrames"
            : "Remove crumbs and spills",
          estimated_minutes: 8,
          order_index: 1,
          is_required: true,
          exp_reward: 5,
          tools_needed: ["microfiber_cloth"],
          difficulty: "easy",
        },
        {
          title: isSpanish
            ? "Limpiar fregadero y grifo"
            : "Clean sink and faucet",
          description: isSpanish
            ? "Desinfectar el fregadero y limpiar el grifo"
            : "Disinfect sink and clean faucet",
          estimated_minutes: 7,
          order_index: 2,
          is_required: true,
          exp_reward: 5,
          tools_needed: ["sink_cleaner", "sponge"],
          difficulty: "easy",
        },
      ],
    });
  }

  // Bathroom tasks (if user has bathroom)
  if (userRooms.includes("bathroom")) {
    recommendations.push({
      task_name: isSpanish ? "Limpieza del Baño" : "Bathroom Cleaning",
      frequency_days: assessment.lifestyle === "busy" ? 3 : 2,
      importance_level: assessment.cleaning_preferences === "thorough" ? 5 : 4,
      reasoning: isSpanish
        ? "La limpieza regular del baño previene el crecimiento de moho y bacterias"
        : "Regular bathroom cleaning prevents mold and bacteria growth",
      health_impact: isSpanish
        ? "Reduce irritantes respiratorios y previene infecciones"
        : "Reduces respiratory irritants and prevents infections",
      scientific_source: "EPA Mold Remediation Guidelines",
      source_url: "https://www.epa.gov/mold",
      friendly_explanation: isSpanish
        ? "Limpiar el baño regularmente ayuda a prevenir el moho y las bacterias que pueden causar problemas respiratorios."
        : "Cleaning your bathroom regularly helps prevent mold and bacteria that can cause respiratory issues.",
      exp_reward: 12,
      area_health_impact: 18,
      tools_required: ["bathroom_cleaner", "sponge", "toilet_brush"],
      difficulty: "medium",
      estimated_total_minutes: 25,
      source: "fallback",
      room_specific: "bathroom",
      subtasks: [
        {
          title: isSpanish
            ? "Limpiar inodoro y lavabo"
            : "Clean toilet and sink",
          description: isSpanish
            ? "Usar limpiador específico para baño"
            : "Use bathroom-specific cleaner",
          estimated_minutes: 10,
          order_index: 1,
          is_required: true,
          exp_reward: 6,
          tools_needed: ["bathroom_cleaner"],
          difficulty: "medium",
        },
        {
          title: isSpanish
            ? "Limpiar ducha y espejos"
            : "Clean shower and mirrors",
          description: isSpanish
            ? "Remover manchas de agua y limpiar espejos"
            : "Remove water spots and clean mirrors",
          estimated_minutes: 8,
          order_index: 2,
          is_required: true,
          exp_reward: 4,
          tools_needed: ["glass_cleaner", "sponge"],
          difficulty: "medium",
        },
        {
          title: isSpanish ? "Limpiar pisos del baño" : "Clean bathroom floors",
          description: isSpanish
            ? "Trapear y desinfectar pisos"
            : "Mop and disinfect floors",
          estimated_minutes: 7,
          order_index: 3,
          is_required: true,
          exp_reward: 2,
          tools_needed: ["mop", "floor_cleaner"],
          difficulty: "easy",
        },
      ],
    });
  }

  // Bedroom tasks (if user has bedroom)
  if (userRooms.includes("bedroom")) {
    recommendations.push({
      task_name: isSpanish ? "Limpieza del Dormitorio" : "Bedroom Cleaning",
      frequency_days: assessment.lifestyle === "busy" ? 4 : 2,
      importance_level: assessment.cleaning_preferences === "thorough" ? 4 : 3,
      reasoning: isSpanish
        ? "Los dormitorios limpios mejoran la calidad del sueño"
        : "Clean bedrooms improve sleep quality",
      health_impact: isSpanish
        ? "Reduce alérgenos y mejora la calidad del aire"
        : "Reduces allergens and improves air quality",
      scientific_source: "EPA Indoor Air Quality Guidelines",
      source_url: "https://www.epa.gov/indoor-air-quality-iaq",
      friendly_explanation: isSpanish
        ? "Mantener el dormitorio limpio ayuda a mejorar la calidad del sueño y reduce los alérgenos."
        : "Keeping your bedroom clean helps improve sleep quality and reduces allergens.",
      exp_reward: 8,
      area_health_impact: 12,
      tools_required: ["microfiber_cloth", "vacuum", "duster"],
      difficulty: "easy",
      estimated_total_minutes: 20,
      source: "fallback",
      room_specific: "bedroom",
      subtasks: [
        {
          title: isSpanish
            ? "Cambiar sábanas y almohadas"
            : "Change sheets and pillows",
          description: isSpanish
            ? "Lavar y cambiar ropa de cama"
            : "Wash and change bedding",
          estimated_minutes: 8,
          order_index: 1,
          is_required: true,
          exp_reward: 4,
          tools_needed: ["laundry_basket"],
          difficulty: "easy",
        },
        {
          title: isSpanish
            ? "Limpiar superficies y polvo"
            : "Dust surfaces and furniture",
          description: isSpanish
            ? "Limpiar muebles y superficies"
            : "Clean furniture and surfaces",
          estimated_minutes: 6,
          order_index: 2,
          is_required: true,
          exp_reward: 3,
          tools_needed: ["duster", "microfiber_cloth"],
          difficulty: "easy",
        },
        {
          title: isSpanish
            ? "Aspirar pisos y alfombras"
            : "Vacuum floors and carpets",
          description: isSpanish
            ? "Aspirar para remover polvo y alérgenos"
            : "Vacuum to remove dust and allergens",
          estimated_minutes: 6,
          order_index: 3,
          is_required: true,
          exp_reward: 1,
          tools_needed: ["vacuum"],
          difficulty: "easy",
        },
      ],
    });
  }

  // Living room tasks (if user has living room)
  if (userRooms.includes("living_room")) {
    recommendations.push({
      task_name: isSpanish
        ? "Limpieza de la Sala de Estar"
        : "Living Room Cleaning",
      frequency_days: assessment.lifestyle === "busy" ? 3 : 2,
      importance_level: assessment.cleaning_preferences === "thorough" ? 4 : 3,
      reasoning: isSpanish
        ? "La sala de estar es donde pasas más tiempo, necesita limpieza regular"
        : "Living room is where you spend most time, needs regular cleaning",
      health_impact: isSpanish
        ? "Reduce alérgenos y mejora la calidad del aire"
        : "Reduces allergens and improves air quality",
      scientific_source: "EPA Indoor Air Quality Guidelines",
      source_url: "https://www.epa.gov/indoor-air-quality-iaq",
      friendly_explanation: isSpanish
        ? "La sala de estar es el corazón de tu hogar. Mantenerla limpia mejora la calidad del aire y reduce alérgenos."
        : "The living room is the heart of your home. Keeping it clean improves air quality and reduces allergens.",
      exp_reward: 10,
      area_health_impact: 15,
      tools_required: ["microfiber_cloth", "vacuum", "duster"],
      difficulty: "medium",
      estimated_total_minutes: 25,
      source: "fallback",
      room_specific: "living_room",
      subtasks: [
        {
          title: isSpanish
            ? "Limpiar muebles y superficies"
            : "Clean furniture and surfaces",
          description: isSpanish
            ? "Limpiar mesas, estantes y superficies"
            : "Clean tables, shelves and surfaces",
          estimated_minutes: 10,
          order_index: 1,
          is_required: true,
          exp_reward: 5,
          tools_needed: ["microfiber_cloth", "duster"],
          difficulty: "easy",
        },
        {
          title: isSpanish
            ? "Aspirar alfombras y pisos"
            : "Vacuum carpets and floors",
          description: isSpanish
            ? "Aspirar para remover polvo y alérgenos"
            : "Vacuum to remove dust and allergens",
          estimated_minutes: 8,
          order_index: 2,
          is_required: true,
          exp_reward: 3,
          tools_needed: ["vacuum"],
          difficulty: "easy",
        },
        {
          title: isSpanish
            ? "Limpiar ventanas y espejos"
            : "Clean windows and mirrors",
          description: isSpanish
            ? "Limpiar cristales para mejor iluminación"
            : "Clean glass for better lighting",
          estimated_minutes: 7,
          order_index: 3,
          is_required: true,
          exp_reward: 2,
          tools_needed: ["window_cleaner", "microfiber_cloth"],
          difficulty: "easy",
        },
      ],
    });
  }

  // Add general tasks that apply to most homes
  recommendations.push({
    task_name: isSpanish ? "Limpieza de Suelos" : "Floor Cleaning",
    frequency_days: assessment.lifestyle === "busy" ? 4 : 2,
    importance_level: assessment.cleaning_preferences === "thorough" ? 4 : 3,
    reasoning: isSpanish
      ? "Los suelos limpios mejoran la calidad del aire interior"
      : "Clean floors improve indoor air quality",
    health_impact: isSpanish
      ? "Reduce alérgenos y mejora la calidad del aire"
      : "Reduces allergens and improves air quality",
    scientific_source: "EPA Indoor Air Quality Guidelines",
    source_url: "https://www.epa.gov/indoor-air-quality-iaq",
    friendly_explanation: isSpanish
      ? "Limpiar los suelos regularmente ayuda a eliminar alérgenos y mejora la calidad del aire en tu hogar."
      : "Cleaning floors regularly helps remove allergens and improves the air quality in your home.",
    exp_reward: 8,
    area_health_impact: 12,
    tools_required: ["mop", "floor_cleaner", "vacuum"],
    difficulty: "medium",
    estimated_total_minutes: 35,
    source: "fallback",
    room_specific: "general",
    subtasks: [
      {
        title: isSpanish ? "Aspirar todas las áreas" : "Vacuum all areas",
        description: isSpanish
          ? "Aspirar alfombras y superficies duras"
          : "Vacuum carpets and hard surfaces",
        estimated_minutes: 15,
        order_index: 1,
        is_required: true,
        exp_reward: 4,
        tools_needed: ["vacuum"],
        difficulty: "easy",
      },
      {
        title: isSpanish ? "Trapear superficies duras" : "Mop hard surfaces",
        description: isSpanish
          ? "Limpiar y desinfectar pisos de madera y azulejos"
          : "Clean and disinfect wood and tile floors",
        estimated_minutes: 20,
        order_index: 2,
        is_required: true,
        exp_reward: 4,
        tools_needed: ["mop", "floor_cleaner"],
        difficulty: "medium",
      },
    ],
  });

  return recommendations;
}
