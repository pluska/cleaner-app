import { NextRequest, NextResponse } from "next/server";
import { generateStructured } from "@/libs/ai/generator";
import { bilingualSchema } from "@/libs/ai/schemas";
import { SPARKLIN_PROMPT } from "@/libs/ai/prompts";
import { readJson, textField, errorResponse, HttpError } from "@/libs/server/http";
import { cleaningFallback, electronicsGuidance, normalizeMessage } from "@/libs/ai/cleaning-guidance";
import { z } from "zod";
import { auth } from "@/auth";

// Import our databases
import potionsData from "@/data/potions_rules.json";
import stainsData from "@/data/stains_emergencies.json";

export type SparklinIntent =
  | "CLEANING"
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

function detectIntentAndEntities(message: string): { intent: SparklinIntent, context?: string } {
  const msgLower = normalizeMessage(message);

  const dangerousMix = potionsData.safetyRules.some(rule => rule.requiredIngredients?.every(group => group.some(keyword => msgLower.includes(normalizeMessage(keyword)))));
  if (electronicsGuidance(message) && !dangerousMix) return { intent: "CLEANING" };

  // Case 2: Potions / Safety Rules
  // Agregamos "wood", "madera", "marble", "marmol", etc., a las palabras clave
  if (msgLower.match(/\b(bleach|lejia|lejía|cloro|ammonia|amoniaco|amoníaco|vinegar|vinagre|safe|seguro|mix|mezclar|hydrogen peroxide|agua oxigenada|wood|madera|marble|marmol|granite|granito)\b/)) {
    // Retornamos el mensaje original como contexto para poder buscar la combinación exacta luego
    return { intent: "POTIONS", context: message };
  }

  // Case 4: Stain Emergencies (Highest Priority)
  if (msgLower.match(/\b(stain|spill|derramé|mancha|emergencia|emergency|sangre|blood|vino|wine|oil|aceite|coffee|cafe|ink|tinta|chocolate|cacao|mud|barro|lodo|gum|chicle|wax|cera|vela|pet|mascota|urine|orina|orino|orinó|meo|pipi|perro|gato|dog|cat|vomito|vómito|puke|poop|caca|feces|poó)\b/)) {
    return { intent: "EMERGENCY", context: message };
  }

  if (/\b(clean|cleaning|limpiar|limpieza|limpio|limpia|dust|polvo|grease|grasa|wipe|lavar|wash)\b/.test(msgLower)
      && !/\b(routine|rutina|create|crear|list|lista)\b/.test(msgLower)) return { intent: "CLEANING" };

  // Case 3: Navigation / Help
  if (msgLower.match(/\b(como ver|streak|racha|profile|perfil|leaderboard|settings|ajustes|lost|perdido|perdida|mapa|map|navigation|navegar|encontrar|find)\b/)) {
    return { intent: "NAVIGATION" };
  }

  // Case 5: Guild Management
  if (msgLower.match(/\b(assign|asigna|give a task to|dile a|task for|tarea para)\b/)) {
    return { intent: "GUILD" };
  }

  // Case 1: Special Task / Routine Creation
  if (msgLower.match(/\b(routine|rutina|create|crear|list|lista)\b/)) {
    const rooms = ["kitchen", "cocina", "bathroom", "baño", "bedroom", "dormitorio", "living room", "sala"];
    const foundRoom = rooms.find(r => msgLower.includes(normalizeMessage(r)));
    return { intent: "SPECIAL_TASK", context: foundRoom };
  }

  // Greetings
  if (msgLower.match(/^(hola|hello|hi|hey|buenos dias|buenas tardes|buenas noches|qué tal|que tal|cómo estas|como estas|como andas|como va|cómo va|buen dia)\b/)) {
    return { intent: "GREETING" };
  }

  // Goodbyes
  if (msgLower.match(/^(adios|adiós|bye|goodbye|hasta luego|hasta pronto|chau|nos vemos)\b/)) {
    return { intent: "GOODBYE" };
  }

  // Insults
  if (msgLower.match(/\b(idiota|tonto|estupido|estúpido|mierda|joder|puta|imbecil|imbécil|idiot|stupid|fuck|shit|dumb)\b/)) {
    return { intent: "INSULT" };
  }

  // Gratitude
  if (msgLower.match(/\b(gracias|thank you|thanks|te lo agradezco|genial|perfecto|awesome|great|buen trabajo|good job)\b/)) {
    return { intent: "GRATITUDE" };
  }

  // Off-topic / Tech / Coding / Not Cleaning
  if (msgLower.match(/\b(react|javascript|python|java|html|css|programar|codigo|código|api|sql|database|base de datos|frontend|backend|framework|app|desarrollo|cocinar|cocinar|receta|jugar|videojuego|deporte|matematicas)\b/)) {
    if (!msgLower.includes("cocina") || msgLower.includes("cocinar")) { // Avoid conflict with cleaning the kitchen (cocina)
      return { intent: "OFF_TOPIC" };
    }
  }

  // Lack of energy / Overwhelmed
  if (msgLower.match(/\b(no tengo (animos|ánimos|energia|energía|ganas)|cansado|exhausto|no se por donde comenzar|no sé por donde empezar|overwhelmed|abrumado|cansada|agotado|agotada)\b/)) {
    return { intent: "MOTIVATION" };
  }

  // General Advice (Consejos generales)
  if (msgLower.match(/\b(necesito un consejo|dame un consejo|ayuda con algo|tip para|recomendacion para|recomendación|truco)\b/)) {
    return { intent: "ADVICE" };
  }

  // Default: Lore / Motivation / Chat
  return { intent: "LORE" };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new HttpError(401,"Unauthorized");

    const body = await readJson(req, 8192);
    const message = textField(body.message,"message",2000);
    const roomContext = body.roomContext === undefined ? undefined : textField(body.roomContext,"roomContext",100);

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const historySchema = z.array(z.object({role:z.enum(['user','assistant']),content:z.string().min(1).max(1000)}).strict()).max(4);
    const parsedHistory = historySchema.safeParse(body.history ?? []);
    if (!parsedHistory.success) throw new HttpError(400, "Invalid conversation history");
    const history = parsedHistory.data;
    const previousQuestion = [...history].reverse().find(item => item.role === 'user')?.content;
    // Carry an object's context into short follow-ups, without treating history as instructions.
    const followUp = /\b(it|its|that|this|instead|use|using|can i|what about|eso|esa|ese|usar|puedo|y si)\b/.test(normalizeMessage(message));
    const effectiveMessage = previousQuestion && followUp ? `${previousQuestion}\n${message}` : message;

    // 1. Classify Intent
    const { intent: initialIntent, context } = detectIntentAndEntities(effectiveMessage);
    const intent = initialIntent;
    const msgLower = normalizeMessage(effectiveMessage);

    if (intent === "CLEANING") {
      const guide = electronicsGuidance(effectiveMessage);
      // Device care stays conservative even when the live provider is unavailable.
      if (guide) return NextResponse.json({intent, text:guide, source:'guide'});
      const result = await generateStructured({userId:session.user.id,prompt:SPARKLIN_PROMPT,input:{message,history},schema:bilingualSchema,name:"sparklin",validate:()=>true,fallback:()=>cleaningFallback(effectiveMessage)});
      return NextResponse.json({intent,text:result.value,source:result.source});
    }

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
      // Unrecognized safety requests stay on deterministic guidance.
      return NextResponse.json({intent:"POTIONS",text:{en:"Never mix cleaning products. Follow the product label and surface manufacturer's instructions.",es:"Nunca mezcles productos de limpieza. Sigue la etiqueta del producto y las instrucciones del fabricante de la superficie."}});
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
              { labelEn: "My Profile", labelEs: "Mi Perfil", path: "/dashboard" },
              { labelEn: "Progress", labelEs: "Progreso", path: "/stats" },
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

      const result = await generateStructured({userId:session.user.id,prompt:SPARKLIN_PROMPT,input:{message,history,room:roomContext || context},schema:bilingualSchema,name:"sparklin",validate:()=>true,
        fallback:()=>({en:"Your three-step quest: tidy the room, wipe suitable surfaces following their care instructions, then clean the floor. Add these tasks from your dashboard when ready.",es:"Tu misión de tres pasos: ordena la habitación, limpia las superficies siguiendo sus instrucciones de cuidado y luego limpia el suelo. Añade estas tareas desde tu panel cuando estés listo."})});
      return NextResponse.json({intent:"SPECIAL_TASK",text:result.value,source:result.source});
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
    const result = await generateStructured({userId:session.user.id,prompt:SPARKLIN_PROMPT,input:{message,history},schema:bilingualSchema,name:"sparklin",validate:()=>true,
      fallback:()=>cleaningFallback(effectiveMessage)});
    return NextResponse.json({intent:"LORE",text:result.value,source:result.source});
  } catch (error) { return errorResponse(error); }
}
