import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";

// Import our databases
import potionsData from "@/data/potions_rules.json";
import stainsData from "@/data/stains_emergencies.json";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export type SparklinIntent = 
  | "SPECIAL_TASK" 
  | "POTIONS" 
  | "NAVIGATION" 
  | "EMERGENCY" 
  | "GUILD" 
  | "GREETING"
  | "OFF_TOPIC"
  | "MOTIVATION"
  | "GRATITUDE"
  | "GOODBYE"
  | "INSULT"
  | "ADVICE"
  | "LORE" 
  | "UNKNOWN";

export interface SparklinChatResponse {
  intent: SparklinIntent;
  text: { en: string; es: string };
  uiAction?: {
    type: "SHOW_ROOM_BUTTONS" | "NAVIGATE_LINKS";
    payload?: Record<string, unknown>;
  };
}

// Sparklin's Persona for LLM
const SPARKLIN_SYSTEM_PROMPT = `
You are Sparklin, a magical cleaning wizard and virtual assistant for the "SparkClean" app.
Your tone is heroic, slightly theatrical, very magical, and encouraging. You treat cleaning tasks like epic quests against "Dust Dragons" and "Grime Goblins".
You should always speak as this character.
Limit your responses to 1-3 short paragraphs, keeping it engaging.
Always translate your response into BOTH English and Spanish, returning it in a JSON format.

Format required:
{
  "en": "Your english response here...",
  "es": "Tu respuesta en español aquí..."
}
`;

function detectIntentAndEntities(message: string): { intent: SparklinIntent, context?: string } {
  const msgLower = message.toLowerCase();
  
  // Case 4: Stain Emergencies (Highest Priority)
  if (msgLower.match(/(stain|spill|derramé|mancha|emergencia|emergency|sangre|blood|vino|wine|oil|aceite|coffee|cafe|ink|tinta|chocolate|cacao|mud|barro|lodo|gum|chicle|wax|cera|vela|pet|mascota|urine|orina|orino|orinó|meo|pipi|perro|gato|dog|cat|vomito|vómito|puke|poop|caca|feces|poó)/)) {
    return { intent: "EMERGENCY", context: message };
  }
  
  // Case 2: Potions / Safety Rules
  // Agregamos "wood", "madera", "marble", "marmol", etc., a las palabras clave
  if (msgLower.match(/(bleach|lejia|lejía|cloro|ammonia|amoniaco|amoníaco|vinegar|vinagre|safe|seguro|mix|mezclar|hydrogen peroxide|agua oxigenada|wood|madera|marble|marmol|granite|granito)/)) {
    // Retornamos el mensaje original como contexto para poder buscar la combinación exacta luego
    return { intent: "POTIONS", context: message }; 
  }
  
  // Case 3: Navigation / Help
  if (msgLower.match(/(where|donde|dónde|how to|como ver|streak|racha|profile|perfil|leaderboard|settings|ajustes|lost|perdido|perdida|mapa|map|navigation|navegar|estoy|encontrar|find)/)) {
    return { intent: "NAVIGATION" };
  }
  
  // Case 5: Guild Management
  if (msgLower.match(/(assign|asigna|give a task to|dile a|task for|tarea para)/)) {
    return { intent: "GUILD" };
  }
  
  // Case 1: Special Task / Routine Creation
  if (msgLower.match(/(routine|rutina|create|crear|list|lista|clean the|limpiar el)/)) {
    const rooms = ["kitchen", "cocina", "bathroom", "baño", "bedroom", "dormitorio", "living room", "sala"];
    const foundRoom = rooms.find(r => msgLower.includes(r));
    return { intent: "SPECIAL_TASK", context: foundRoom };
  }
  
  // Greetings
  if (msgLower.match(/^(hola|hello|hi|hey|buenos dias|buenas tardes|buenas noches|qué tal|que tal|cómo estas|como estas|como andas|como va|cómo va|buen dia)/)) {
    return { intent: "GREETING" };
  }

  // Goodbyes
  if (msgLower.match(/^(adios|adiós|bye|goodbye|hasta luego|hasta pronto|chau|nos vemos)/)) {
    return { intent: "GOODBYE" };
  }

  // Insults
  if (msgLower.match(/(idiota|tonto|estupido|estúpido|mierda|joder|puta|imbecil|imbécil|idiot|stupid|fuck|shit|dumb)/)) {
    return { intent: "INSULT" };
  }

  // Gratitude
  if (msgLower.match(/(gracias|thank you|thanks|te lo agradezco|genial|perfecto|awesome|great|buen trabajo|good job)/)) {
    return { intent: "GRATITUDE" };
  }

  // Off-topic / Tech / Coding / Not Cleaning
  if (msgLower.match(/(react|javascript|python|java|html|css|programar|codigo|código|api|sql|database|base de datos|frontend|backend|framework|app|desarrollo|cocinar|cocinar|receta|jugar|videojuego|deporte|matematicas)/)) {
    if (!msgLower.includes("cocina") || msgLower.includes("cocinar")) { // Avoid conflict with cleaning the kitchen (cocina)
      return { intent: "OFF_TOPIC" };
    }
  }
  
  // Lack of energy / Overwhelmed
  if (msgLower.match(/(no tengo (animos|ánimos|energia|energía|ganas)|cansado|exhausto|no se por donde comenzar|no sé por donde empezar|overwhelmed|abrumado|cansada|agotado|agotada)/)) {
    return { intent: "MOTIVATION" };
  }
  
  // General Advice (Consejos generales)
  if (msgLower.match(/(necesito un consejo|dame un consejo|ayuda con algo|tip para|recomendacion para|recomendación|truco)/)) {
    return { intent: "ADVICE" };
  }
  
  // Default: Lore / Motivation / Chat
  return { intent: "LORE" };
}

export async function POST(req: NextRequest) {
  try {
    await auth();
    // Allow unauthenticated for emergency stains? No, app is mostly auth-based
    
    const body = await req.json();
    const { message, roomContext } = body;
    
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    
    // 1. Classify Intent
    const { intent: initialIntent, context } = detectIntentAndEntities(message);
    let intent = initialIntent;
    const msgLower = message.toLowerCase();
    
    // ==========================================
// Case 4: Emergencies (Static DB + AI Fallback)
// ==========================================
if (intent === "EMERGENCY") {
  // 1. Buscamos coincidencia exacta en nuestra base de datos rápida (Fast-Path)
  const stainMatch = stainsData.emergencies.find(s => 
    s.keywords.some(k => msgLower.includes(k))
  );
  
  if (stainMatch) {
     return NextResponse.json({
       intent: "EMERGENCY",
       text: { en: stainMatch.en, es: stainMatch.es }
     });
  }

  // 2. ESCALADO MÁGICO: Si la mancha no está en el JSON, 
  // le pedimos a Gemini una "Poción de Emergencia" personalizada.
  if (apiKey) {
    const emergencyPrompt = `
      The user has a cleaning EMERGENCY: "${message}".
      1. Identify the stain and material if possible.
      2. Provide a heroic, magical 3-step solution as Sparklin.
      3. Use a tone of "Urgency but Calm".
      Return ONLY this JSON format:
      {
        "en": "🚨 Emergency! [Heroic advice in English]...",
        "es": "🚨 ¡Emergencia! [Consejo heroico en español]..."
      }
    `;

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", 
        systemInstruction: SPARKLIN_SYSTEM_PROMPT 
      });
      const result = await model.generateContent(emergencyPrompt);
      const rawText = result.response.text().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(rawText) as { en: string; es: string };

      return NextResponse.json({
        intent: "EMERGENCY",
        text: { en: parsed.en, es: parsed.es }
      });
    } catch (e) {
      console.error("Gemini Emergency Fallback Error:", e);
      // Si la IA falla, usamos el fallback estático de seguridad
    }
  }

  // 3. ULTIMATE FALLBACK (Si no hay API Key o la IA falló)
  return NextResponse.json({
    intent: "EMERGENCY",
    text: {
      en: "Fear not! For unknown dark stains, start by blotting with a dry cloth and cold water. I shall search my grimoires for more specific spells!",
      es: "¡No temas! Para manchas oscuras desconocidas, comienza secando con un paño seco y agua fría. ¡Buscaré en mis grimorios hechizos más específicos!"
    }
  });
}
    
    /// ==========================================
    // Case 2: Potions and Tools (Static DB)
    // ==========================================
    if (intent === "POTIONS") {
      
      // 1. Primero buscamos si hay una mezcla PELIGROSA (Requiere TODOS los ingredientes)
      const matchedDangerRule = potionsData.safetyRules.find(rule => {
        if (!rule.requiredIngredients) return false;
        return rule.requiredIngredients.every((ingredientGroup: string[]) => 
          ingredientGroup.some((keyword: string) => msgLower.includes(keyword))
        );
      });
      
      if (matchedDangerRule) {
        const textEn = matchedDangerRule.recommendation ? `${matchedDangerRule.en}\n\n${matchedDangerRule.recommendation.en}` : matchedDangerRule.en;
        const textEs = matchedDangerRule.recommendation ? `${matchedDangerRule.es}\n\n${matchedDangerRule.recommendation.es}` : matchedDangerRule.es;
        return NextResponse.json({ intent: "POTIONS", text: { en: textEn, es: textEs } });
      }

      // 2. Si no hay peligro, buscamos si es una pregunta sobre una SUPERFICIE (Requiere 1 coincidencia)
      const matchedSurfaceGuide = potionsData.surfaceGuides?.find(guide => 
        guide.keywords.some((keyword: string) => msgLower.includes(keyword))
      );

      if (matchedSurfaceGuide) {
        // Encontramos la guía estática para la madera, mármol, etc. ¡Respuesta instantánea y gratis!
        return NextResponse.json({ 
          intent: "POTIONS", 
          text: { en: matchedSurfaceGuide.en, es: matchedSurfaceGuide.es } 
        });
      }
      
      // 3. FALLBACK MÁGICO: No es peligroso y no tenemos una guía estática.
      // Se lo pasamos a Gemini para que genere un consejo.
      intent = "LORE"; 
    }
    
    // ==========================================
    // Case 3: Navigation
    // ==========================================
    if (intent === "NAVIGATION") {
      return NextResponse.json({
        intent: "NAVIGATION",
        text: {
          en: "Lost in the castle? Fear not, my map will guide your way. What are you looking for?",
          es: "¿Perdido en el castillo? No temas, mi mapa guiará tu camino. ¿Qué estás buscando?"
        },
        uiAction: {
          type: "NAVIGATE_LINKS",
          payload: {
            links: [
              { labelEn: "My Profile", labelEs: "Mi Perfil", path: "/dashboard/settings" },
              { labelEn: "Leaderboard", labelEs: "Tabla de Clasificación", path: "/dashboard/stats" },
              { labelEn: "Daily Quests", labelEs: "Misiones Diarias", path: "/dashboard" }
            ]
          }
        }
      });
    }
    
    // ==========================================
    // Case 1: Special Task Generation
    // ==========================================
    if (intent === "SPECIAL_TASK") {
      if (!roomContext && !context) {
        // Need to ask for missing context
        return NextResponse.json({
          intent: "SPECIAL_TASK",
          text: {
            en: "A special quest! I can conjure the perfect cleaning spell, but first, tell me: which chamber of the castle are we tackling?",
            es: "¡Una misión especial! Puedo conjurar el hechizo de limpieza perfecto, pero primero, dime: ¿qué cámara del castillo estamos abordando?"
          },
          uiAction: {
            type: "SHOW_ROOM_BUTTONS",
            payload: {
              options: [
                { id: "kitchen", icon: "🍳", labelEn: "Kitchen", labelEs: "Cocina" },
                { id: "bathroom", icon: "🛁", labelEn: "Bathroom", labelEs: "Baño" },
                { id: "bedroom", icon: "🛏️", labelEn: "Bedroom", labelEs: "Dormitorio" },
                { id: "living_room", icon: "🛋️", labelEn: "Living Room", labelEs: "Sala" }
              ]
            }
          }
        });
      }
      
      // We have the room, now generate the tasks using AI
      const finalRoom = roomContext || context || "general";
      
      if (!apiKey) {
        return NextResponse.json({
            intent: "SPECIAL_TASK",
            text: {
              en: "My magical crystal ball (Gemini API) is disconnected right now! I cannot generate the routine.",
              es: "¡Mi bola de cristal mágica (Gemini API) está desconectada en este momento! No puedo generar la rutina."
            }
        });
      }
      
      const prompt = `Generate a 3-step cleaning checklist for the ${finalRoom} based on this request: "${message}".
      Return ONLY a JSON object with this format exactly:
      {
         "en": "I have created the ultimate checklist for the ${finalRoom}! Go to your dashboard to see your new quests.",
         "es": "¡He creado la lista definitiva para el/la ${finalRoom}! Ve a tu panel para ver tus nuevas misiones.",
         "tasks": [
           { "title": "...", "points": 10 }
         ]
      }`;
      
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/\\`\\`\\`json|\\`\\`\\`/g, '').trim();
      
      try {
        const parsed = JSON.parse(text) as { 
          en: string; 
          es: string; 
          tasks: Array<{ title: string; points: number }>; 
        };
        
        // TODO: Save tasks to database here
        
        return NextResponse.json({
          intent: "SPECIAL_TASK",
          text: { en: parsed.en, es: parsed.es }
        });
      } catch(e) {
         console.error("Failed to parse Gemini task response", e);
         // Fallback
      }
    }
    
    // ==========================================
    // Case 5: Guild Management (Not Yet Implemented/No Schema)
    // ==========================================
    if (intent === "GUILD") {
       return NextResponse.json({
         intent: "GUILD",
         text: {
           en: "Your Guild has not been formed yet! Soon you will be able to summon other knights to your castle and assign them tasks.",
           es: "¡Tu Gremio aún no se ha formado! Pronto podrás invocar a otros caballeros a tu castillo y asignarles tareas."
         }
       });
    }
    
    // ==========================================
    // Static Fallbacks for Chat / Lore
    // ==========================================
    if (intent === "GREETING") {
       return NextResponse.json({
         intent: "LORE", // Return LORE to increment the procrastination counter in UI
         text: {
           en: "Greetings, Hero! I am Sparklin. Are you ready to cleanse this castle?",
           es: "¡Saludos, Héroe! Soy Sparklin. ¿Estás listo para purificar este castillo?"
         }
       });
    }

    if (intent === "GOODBYE") {
       return NextResponse.json({
         intent: "LORE", 
         text: {
           en: "Farewell, Hero! May your floors remain forever spotless.",
           es: "¡Hasta pronto, Héroe! Que tus pisos permanezcan impecables por siempre."
         }
       });
    }

    if (intent === "INSULT") {
       return NextResponse.json({
         intent: "LORE", 
         text: {
           en: "Language, Hero! My magical ears are sensitive! Let's channel that fiery energy into fighting Grime Goblins instead.",
           es: "¡Ese lenguaje, Héroe! ¡Mis oídos mágicos son muy sensibles! Mejor canalicemos esa energía en combatir a los Duendes de la Mugre."
         }
       });
    }

    if (intent === "GRATITUDE") {
       return NextResponse.json({
         intent: "LORE", 
         text: {
           en: "Always at your service, Hero! Together we shall defeat all Grime Goblins.",
           es: "¡Siempre a tu servicio, Héroe! Juntos derrotaremos a todos los Duendes de la Mugre."
         }
       });
    }

    if (intent === "OFF_TOPIC") {
       return NextResponse.json({
         intent: "LORE", 
         text: {
           en: "Ah, fascinating! But alas, my magic is bound strictly to the realm of cleaning. I cannot cast spells in that domain.",
           es: "¡Ah, fascinante! Pero, lamentablemente, mi magia está estrictamente ligada al reino de la limpieza. No puedo responder ese tipo de consultas ni enseñarte de esos temas."
         }
       });
    }

    if (intent === "ADVICE") {
       return NextResponse.json({
         intent: "LORE", 
         text: {
           en: "I am filled with ancient wisdom! Tell me exactly what object, room, or stain you wish to conquer, and I shall share the perfect spell.",
           es: "¡Estoy lleno de sabiduría ancestral! Dime exactamente qué objeto, habitación o mancha deseas conquistar, y te compartiré el hechizo perfecto."
         }
       });
    }

    if (intent === "MOTIVATION") {
       return NextResponse.json({
         intent: "LORE", 
         text: {
           en: "Overwhelmed by the Dust Dragons? Remember: even the greatest heroes start small. Why don't you try wiping just one counter? 5 minutes is all you need to start!",
           es: "¿Sin ánimos, Héroe? Recuerda: incluso los más grandes guerreros comienzan con una pequeña acción. ¿Por qué no intentas limpiar un solo mostrador o una mesa? ¡Con solo 5 minutos ganarás impulso!"
         }
       });
    }
    
    // ==========================================
    // Case 6: Lore & Motivation (LLM Fallback)
    // ==========================================
    if (!apiKey) {
        return NextResponse.json({
            intent: "LORE",
            text: {
              en: "I am resting my magical powers at the moment. (No API Key set)",
              es: "Estoy descansando mis poderes mágicos en este momento. (Sin API Key)"
            }
        });
    }
    
    const userPrompt = `The user said: "${message}". Respond as Sparklin. Return ONLY the JSON.`;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: SPARKLIN_SYSTEM_PROMPT });
    
    try {
      const result = await model.generateContent(userPrompt);
      const rawText = result.response.text().replace(/```json|```/g, '').trim();
      
      let parsedResp: { en: string; es: string };
      try {
        parsedResp = JSON.parse(rawText) as { en: string; es: string };
      } catch {
        return NextResponse.json({
          intent: "LORE",
          text: { en: rawText, es: rawText }
        });
      }
      
      return NextResponse.json({
        intent: "LORE",
        text: parsedResp
      });
      
    } catch(apiError) {
      console.error("Gemini API Error in LORE:", apiError);
      return NextResponse.json({
        intent: "LORE",
        text: {
          en: "Forgive me, Hero! My crystal ball is cloudy. Please try again or ask me about cleaning.",
          es: "¡Perdóname, Héroe! Mi bola de cristal mágica está nublada. Inténtalo de nuevo o pregúntame sobre limpieza."
        }
      });
    }

  } catch (error) {
    console.error("Sparklin Chat Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
