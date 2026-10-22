"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSparklinStore } from "@/hooks/useSparklinStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, Sparkles, Send, Loader2, Navigation, Maximize2, Minimize2 } from "lucide-react";
import { useRouter } from "next/navigation";

type ChatMessage = {
  id: string;
  sender: "user" | "sparklin";
  text: string;
  source?: "openai" | "fallback" | "guide";
  uiAction?: {
    type: "SHOW_ROOM_BUTTONS" | "NAVIGATE_LINKS";
    payload?: Record<string, unknown>;
  };
};

export function SparklinChat() {
  const { isOpen, message, setIsOpen, triggerGreeting, handleSpamClick } = useSparklinStore();
  const { language } = useLanguage();
  const router = useRouter();

  const [bubbles, setBubbles] = useState<{ id: number; left: string; delay: string; duration: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize bubbles on open and set initial greeting
  useEffect(() => {
    if (isOpen) {
      const newBubbles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.2}s`,
        duration: `${0.8 + Math.random() * 1.5}s`
      }));
      setBubbles(newBubbles);

      // If opening for the first time or from store trigger, set the first message
      if (message) {
        setChatHistory([{
            id: Date.now().toString(),
            sender: "sparklin",
            text: language === "es" ? message.es : message.en
        }]);

        // Add the follow-up question after a short delay
        const timerId = setTimeout(() => {
           setChatHistory(prev => {
             // Avoid duplicating if we close/open quickly
             if (prev.length === 1 && prev[0].text !== (language === "es" ? "¿En qué te puedo servir, Héroe?" : "What may I do for you, Hero?")) {
                 return [...prev, {
                    id: (Date.now() + 1).toString(),
                    sender: "sparklin",
                    text: language === "es" ? "¿En qué te puedo servir, Héroe?" : "What may I do for you, Hero?",
                    uiAction: {
                      type: "SHOW_ROOM_BUTTONS", // Abuse this type to show quick actions
                      payload: {
                        options: [
                          { id: "routine", icon: "✨", labelEn: "Create Routine", labelEs: "Crear Rutina" },
                          { id: "stain", icon: "🍷", labelEn: "Stain Emergency", labelEs: "Emergencia (Mancha)" },
                          { id: "potion", icon: "🧪", labelEn: "Potion Safety", labelEs: "Química Segura" },
                          { id: "navigation", icon: "🗺️", labelEn: "I'm lost", labelEs: "Estoy perdido" }
                        ]
                      }
                    }
                 }];
             }
             return prev;
           });
        }, 1500);

        return () => clearTimeout(timerId);
      }
    } else {
      setBubbles([]);
    }
  }, [isOpen, message, language]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleOpen = () => {
    if (!isOpen) {
      triggerGreeting();
    } else {
      handleSpamClick();
    }
  };

  const sendMessageToApi = async (textToSend: string, contextObj?: { roomContext: string }) => {
     setIsLoading(true);

     // Add user message to UI
     const userMsgId = Date.now().toString();
     setChatHistory(prev => [...prev, { id: userMsgId, sender: "user", text: textToSend }]);

     try {
       const res = await fetch("/api/sparklin/chat", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
             message: contextObj && pendingPrompt ? pendingPrompt : textToSend,
             history: chatHistory.slice(-4).map(msg => ({role: msg.sender === "user" ? "user" : "assistant", content: msg.text.slice(0,1000)})),
             ...(contextObj || {})
         })
       });

       const data = await res.json();

       if (res.ok && data.text?.en && data.text?.es) {
          setChatHistory(prev => [...prev, {
             id: (Date.now() + 1).toString(),
             sender: "sparklin",
             text: language === "es" ? data.text.es : data.text.en,
             source: data.source,
             uiAction: data.uiAction
          }]);
        } else {
         throw new Error("Invalid response");
       }

       // Clear pending prompt if it was resolved
       if (contextObj) {
         setPendingPrompt(null);
       }

     } catch (err) {
       console.error(err);
       setChatHistory(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            sender: "sparklin",
            text: language === "es" ? "¡Ay! Mi varita se ha roto. Inténtalo de nuevo." : "Ouch! My wand broke. Try again later."
       }]);
     } finally {
       setIsLoading(false);
     }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const textToSend = inputText;
    setInputText("");

    // Store in case we need context
    setPendingPrompt(textToSend);
    await sendMessageToApi(textToSend);
  };

  const handleRoomSelection = async (roomId: string, label: string) => {
      if (["routine", "stain", "potion", "navigation"].includes(roomId)) {
        // Quick Action clicked
        let promptToUse = "";
        if (roomId === "routine") promptToUse = language === "es" ? "Crea una rutina de limpieza" : "Create a cleaning routine";
        if (roomId === "stain") {
           const stainOptions = [
             {
               en: "A stain attack! Don't panic, Hero. Time is our greatest ally. Tell me, what dark liquid has struck your armor (clothes) or your castle floor?",
               es: "¡Un ataque de manchas! No entres en pánico, Héroe. El tiempo es nuestro mayor aliado. Dime, ¿qué líquido oscuro ha golpeado tu armadura (ropa) o el suelo de tu castillo?"
             },
             {
               en: "By the bristles of my brush! An emergency has arisen. I am preparing the cleaning scrolls as we speak. What is the nature of this grime? (Wine, blood, ink...?)",
               es: "¡Por las cerdas de mi cepillo! Ha surgido una emergencia. Estoy preparando los pergaminos de limpieza en este momento. ¿Cuál es la naturaleza de esta mugre? (¿Vino, sangre, tinta...?)"
             },
             {
               en: "Stay back, Grime Goblin! I've got your back, Hero. Quick! Identify the invader so I can fetch the correct counter-spell from my grimoire.",
               es: "¡Atrás, Duende de la Mugre! Te cuido la espalda, Héroe. ¡Rápido! Identifica al invasor para que pueda buscar el contra-hechizo correcto en mi grimorio."
             }
           ];
           const randomStainGreeting = stainOptions[Math.floor(Math.random() * stainOptions.length)];

           setChatHistory(prev => [...prev, {
              id: Date.now().toString(),
              sender: "user",
              text: language === "es" ? "Emergencia (Mancha)" : "Emergency (Stain)"
           }, {
              id: (Date.now() + 1).toString(),
              sender: "sparklin",
              text: language === "es" ? randomStainGreeting.es : randomStainGreeting.en
           }]);
           return;
        }
        if (roomId === "potion") {
           // Direct UI Action override
           setChatHistory(prev => [...prev, {
              id: Date.now().toString(),
              sender: "user",
              text: language === "es" ? "Química Segura" : "Potion Safety"
           }, {
              id: (Date.now() + 1).toString(),
              sender: "sparklin",
              text: language === "es"
                 ? "¡Ah, adentrándote en las peligrosas artes de la alquimia, ya veo! Mezclar las pociones de limpieza equivocadas puede invocar nubes tóxicas o derretir tu caldero. Dime, aprendiz, ¿qué ingredientes o superficies planeas combinar?"
                 : "Ah, delving into the dangerous arts of alchemy, I see! Mixing the wrong cleaning potions can summon toxic clouds or melt your cauldron. Tell me, apprentice, what ingredients or surfaces are you planning to combine?"
           }]);
           return;
        }
        if (roomId === "navigation") promptToUse = language === "es" ? "Estoy perdido" : "I'm lost";

        await sendMessageToApi(promptToUse);
        return;
      }

      // User clicked a room button to fulfill a Special Task request
      if (!pendingPrompt) return;

      await sendMessageToApi(`Selected: ${label}`, { roomContext: roomId });
  };

  return (
    <div className="sparklin-launcher fixed bottom-6 right-6 flex flex-col items-end z-[9999] drop-shadow-md pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50, transition: { duration: 0.2 } }}
            className={`mb-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-200 pointer-events-auto flex flex-col transition-all duration-300 ease-in-out ${
               isExpanded
                 ? "w-[90vw] sm:w-[500px] h-[80vh] sm:h-[700px] max-h-[85vh] absolute bottom-16 right-0"
                 : "w-80 sm:w-96 h-[500px] max-h-[80vh]"
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-3 flex justify-between items-center text-white shrink-0">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <Sparkles size={16} />
                Sparklin
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  aria-label={language === "es" ? "Cerrar chat" : "Close chat"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="text-white/80 hover:text-white transition-colors p-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat History Area */}
            <div
               ref={scrollRef}
               className="flex-1 overflow-y-auto p-4 bg-slate-50 relative custom-scrollbar flex flex-col gap-4"
            >
              {/* Bubbles & Sparks Animation (Decor) */}
              <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden pointer-events-none">
                  {bubbles.map(bubble => (
                    <motion.div
                      key={bubble.id}
                      className="absolute w-2 h-2 rounded-full bg-yellow-400 opacity-60 z-0"
                      style={{ left: bubble.left, bottom: "-10px" }}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{
                        y: -350,
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1.5, 0.5]
                      }}
                      transition={{
                        duration: parseFloat(bubble.duration),
                        delay: parseFloat(bubble.delay),
                        ease: "easeOut"
                      }}
                    />
                  ))}
              </div>

              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} z-10 w-full`}>

                   {msg.sender === "sparklin" && (
                     <div className="w-10 h-10 shrink-0 mr-2 mt-auto">
                        <Image unoptimized width={64} height={64}
                          src="/sparklin/sparklin-avatar.webp"
                          alt="Sparklin"
                          className="w-full h-full object-contain"
                        />
                     </div>
                   )}

                   <div className={`max-w-[75%] rounded-2xl p-3 text-sm shadow-sm flex flex-col gap-3 ${
                      msg.sender === "user"
                        ? "bg-purple-600 text-white rounded-br-none"
                        : "bg-white border border-purple-100 text-slate-700 rounded-bl-none"
                   }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      {msg.source === "fallback" && <span className="text-xs text-slate-500">{language === "es" ? "Guía básica · IA no disponible" : "Basic guide · AI unavailable"}</span>}

                      {/* UI Actions Rendering */}
                      {msg.uiAction && msg.uiAction.type === "NAVIGATE_LINKS" && (
                         <div className="flex flex-col gap-2 mt-1">
                           {(msg.uiAction.payload?.links as {path: string, labelEs: string, labelEn: string}[] || []).map((link, idx: number) => (
                              <button
                                key={idx}
                                onClick={() => router.push(link.path)}
                                className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left"
                              >
                                <Navigation size={14} />
                                {language === "es" ? link.labelEs : link.labelEn}
                              </button>
                           ))}
                         </div>
                      )}

                      {msg.uiAction && msg.uiAction.type === "SHOW_ROOM_BUTTONS" && (
                         <div className="grid grid-cols-2 gap-2 mt-1">
                           {(msg.uiAction.payload?.options as {id: string, labelEs: string, labelEn: string, icon: string}[] || []).map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => handleRoomSelection(opt.id, language === "es" ? opt.labelEs : opt.labelEn)}
                                className="flex flex-col items-center justify-center gap-1 bg-slate-50 border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-700 py-3 rounded-lg text-xs font-medium transition-colors"
                              >
                                <span className="text-xl">{opt.icon}</span>
                                {language === "es" ? opt.labelEs : opt.labelEn}
                              </button>
                           ))}
                         </div>
                      )}
                   </div>
                </div>
              ))}

              {isLoading && (
                 <div className="flex justify-start z-10 w-full">
                    <div className="w-10 h-10 shrink-0 mr-2 mt-auto">
                        <Image unoptimized width={64} height={64} src="/sparklin/sparklin-avatar.webp" alt="Sparklin" className="w-full h-full object-contain blur-[1px] opacity-70" />
                     </div>
                     <div className="bg-white border border-purple-100 rounded-2xl rounded-bl-none p-3 shadow-sm flex items-center justify-center h-10">
                        <Loader2 className="animate-spin text-purple-400" size={18} />
                     </div>
                 </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-purple-100 flex items-center gap-2 shrink-0 z-20">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={language === 'es' ? "Pregúntale a Sparklin..." : "Ask Sparklin..."}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="submit"
                aria-label={language === "es" ? "Enviar mensaje" : "Send message"}
                disabled={!inputText.trim() || isLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg p-2 transition-colors flex items-center justify-center"
              >
                 <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        aria-label={language === "es" ? "Hablar con Sparklin" : "Chat with Sparklin"}
        onClick={handleOpen}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden pointer-events-auto"
      >
        <Sparkles size={24} className="z-10" />
        <motion.div
          className="absolute inset-0 bg-white/20"
          animate={{
            opacity: [0, 0.5, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.button>
    </div>
  );
}
