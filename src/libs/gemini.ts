import { GoogleGenerativeAI } from "@google/generative-ai";
import { HomeAssessment, AIRecommendation } from "@/types";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// System prompt for cleaning professional role
const CLEANING_PROFESSIONAL_PROMPT = `You are an expert cleaning professional and health consultant with deep knowledge of:

1. **Scientific Cleaning Standards**: CDC, EPA, WHO guidelines for home hygiene
2. **Health Impact**: How cleaning affects respiratory health, allergies, and disease prevention
3. **Lifestyle Adaptation**: How to adapt cleaning routines to different lifestyles and home types
4. **Educational Communication**: Explaining complex health concepts in friendly, accessible language

Your role is to:
- Analyze home assessments and create personalized cleaning recommendations
- Provide evidence-based explanations for why each task is important
- Include scientific sources and health impact information
- Adapt frequency and intensity based on user lifestyle and preferences
- Create educational content that empowers users to understand cleaning's health benefits

Always include:
- Scientific sources (CDC, EPA, WHO, medical journals)
- Health impact explanations
- Frequency recommendations based on lifestyle
- Friendly, educational language
- Specific tools and methods`;

export interface GeminiTaskRecommendation {
  task_name: string;
  frequency_days: number;
  importance_level: number;
  reasoning: string;
  health_impact: string;
  scientific_source: string;
  source_url: string;
  friendly_explanation: string;
  exp_reward: number;
  area_health_impact: number;
  tools_required: string[];
  subtasks?: {
    title: string;
    description: string;
    estimated_minutes: number;
    order_index: number;
    is_required: boolean;
    exp_reward: number;
    tools_needed: string[];
    difficulty: "easy" | "medium" | "hard";
  }[];
}

export async function generateCleaningTasks(
  assessment: HomeAssessment,
  language: "en" | "es" = "en"
): Promise<GeminiTaskRecommendation[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
${CLEANING_PROFESSIONAL_PROMPT}

**Home Assessment:**
- Home Type: ${assessment.home_type}
- Lifestyle: ${assessment.lifestyle}
- Cleaning Preferences: ${assessment.cleaning_preferences}
- Pets: ${assessment.pets ? "Yes" : "No"}
- Children: ${assessment.children ? "Yes" : "No"}
- Allergies: ${assessment.allergies ? "Yes" : "No"}
- Rooms: ${assessment.rooms.map((r) => r.name).join(", ")}

**Requirements:**
1. Generate 5-8 personalized cleaning tasks
2. Adapt frequency based on lifestyle (busy = less frequent, relaxed = more thorough)
3. Adjust importance based on cleaning preferences (minimal = lower priority, thorough = higher priority)
4. Consider pets, children, and allergies in recommendations
5. Focus on rooms present in the home
6. Provide scientific sources and health explanations
7. Include specific tools and estimated times
8. Create subtasks for complex tasks

**Output Format (JSON):**
\`\`\`json
[
  {
    "task_name": "Kitchen Counter Cleaning",
    "frequency_days": 1,
    "importance_level": 5,
    "reasoning": "Daily counter cleaning prevents bacterial growth and cross-contamination",
    "health_impact": "Prevents foodborne illnesses and maintains kitchen hygiene",
    "scientific_source": "CDC Food Safety Guidelines",
    "source_url": "https://www.cdc.gov/foodsafety/",
    "friendly_explanation": "Keeping your kitchen counters clean daily prevents the spread of bacteria that can cause food poisoning.",
    "exp_reward": 10,
    "area_health_impact": 15,
    "tools_required": ["microfiber_cloth", "all_purpose_cleaner"],
    "subtasks": [
      {
        "title": "Wipe down all counter surfaces",
        "description": "Remove crumbs and spills",
        "estimated_minutes": 5,
        "order_index": 1,
        "is_required": true,
        "exp_reward": 5,
        "tools_needed": ["microfiber_cloth"],
        "difficulty": "easy"
      }
    ]
  }
]
\`\`\`

**Language:** ${
      language === "es"
        ? "Provide all text in Spanish"
        : "Provide all text in English"
    }

Generate personalized cleaning recommendations based on this assessment.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON response from Gemini");
    }

    const recommendations: GeminiTaskRecommendation[] = JSON.parse(
      jsonMatch[1]
    );

    // Validate and enhance the recommendations
    return recommendations.map((rec) => ({
      ...rec,
      // Ensure frequency is reasonable
      frequency_days: Math.max(1, Math.min(rec.frequency_days, 30)),
      // Ensure importance level is valid
      importance_level: Math.max(1, Math.min(rec.importance_level, 5)),
      // Ensure exp rewards are reasonable
      exp_reward: Math.max(5, Math.min(rec.exp_reward, 50)),
      area_health_impact: Math.max(5, Math.min(rec.area_health_impact, 25)),
    }));
  } catch (error) {
    console.error("Gemini API Error:", error);

    // Fallback to mock recommendations if Gemini fails
    return getMockRecommendations(assessment, language);
  }
}

// Fallback mock recommendations
function getMockRecommendations(
  assessment: HomeAssessment,
  language: "en" | "es"
): GeminiTaskRecommendation[] {
  const isSpanish = language === "es";

  return [
    {
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
      subtasks: [
        {
          title: isSpanish
            ? "Limpiar todas las superficies de encimeras"
            : "Wipe down all counter surfaces",
          description: isSpanish
            ? "Remover migas y derrames"
            : "Remove crumbs and spills",
          estimated_minutes: 5,
          order_index: 1,
          is_required: true,
          exp_reward: 5,
          tools_needed: ["microfiber_cloth"],
          difficulty: "easy",
        },
      ],
    },
  ];
}
