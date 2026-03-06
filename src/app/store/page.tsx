"use client";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/libs/translations";
import { Coins, Gamepad2, Ticket, IceCream, BookOpen, Gift, PartyPopper, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsMenu } from "@/components/ui/layout/SettingsMenu";

const MOCK_REWARDS = [
  { id: 1, title: "1 Hour Video Games", cost: 50, icon: Gamepad2, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 2, title: "Movie Night Choice", cost: 150, icon: Ticket, color: "text-purple-500", bg: "bg-purple-50" },
  { id: 3, title: "Ice Cream Trip", cost: 200, icon: IceCream, color: "text-pink-500", bg: "bg-pink-50" },
  { id: 4, title: "New Book", cost: 300, icon: BookOpen, color: "text-green-500", bg: "bg-green-50" },
  { id: 5, title: "Mystery Gift", cost: 500, icon: Gift, color: "text-yellow-500", bg: "bg-yellow-50" },
  { id: 6, title: "Pizza Party", cost: 1000, icon: PartyPopper, color: "text-red-500", bg: "bg-red-50" },
];

export default function StorePage() {
  const { language } = useLanguage();
  const [balance, setBalance] = useState(450);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePurchase = (reward: any) => {
    if (balance >= reward.cost) {
      setBalance(b => b - reward.cost);
      setToastMessage(
        language === "es" 
          ? `¡Comprado: ${reward.title}!` 
          : `Purchased: ${reward.title}!`
      );
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto min-h-screen bg-[#F8F9FA] px-6 md:px-8 pt-12 md:pt-16 pb-32 relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-white border border-green-100 rounded-full shadow-lg px-6 py-3 flex items-center space-x-3 pointer-events-none"
          >
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-bold text-dark text-sm">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark mb-1">
            {language === "es" ? "Tienda de Recompensas" : "Rewards Store"}
          </h1>
          <p className="text-gray-500 text-sm">
            {language === "es"
              ? "Usa tus monedas para desbloquear premios"
              : "Use your coins to unlock prizes"}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 flex items-center space-x-2 shrink-0 h-12">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="font-extrabold text-dark">{balance}</span>
          </div>
          <SettingsMenu />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {MOCK_REWARDS.map((reward) => (
          <div key={reward.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between items-center text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${reward.bg}`}>
               <reward.icon className={`w-7 h-7 ${reward.color}`} />
            </div>
            <h3 className="font-bold text-dark text-sm mb-4 h-10 flex items-center">{reward.title}</h3>
            
            <button 
              onClick={() => handlePurchase(reward)}
              disabled={balance < reward.cost}
              className={`w-full py-2.5 rounded-full flex items-center justify-center space-x-1.5 font-bold text-sm transition-colors ${
                balance >= reward.cost 
                  ? "bg-primary text-white hover:brightness-110 shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Coins className={`w-4 h-4 ${balance >= reward.cost ? "text-yellow-300" : "text-gray-300"}`} />
              <span>{reward.cost}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
