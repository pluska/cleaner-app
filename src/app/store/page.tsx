"use client";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Coins, Gamepad2, Ticket, IceCream, BookOpen, Gift, PartyPopper, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SettingsMenu } from "@/components/ui/layout/SettingsMenu";

const iconMap: Record<string, React.ElementType> = {
  Gamepad2, Ticket, IceCream, BookOpen, Gift, PartyPopper
};

interface Reward {
  id: string;
  title: string;
  cost: number;
  iconType: string;
  bg: string;
  color: string;
  isPurchased?: boolean;
}

export default function StorePage() {
  const { language } = useLanguage();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const requests = useRef(new Map<string,string>());
  const purchasingRef = useRef(false);
  const [balance, setBalance] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/store/rewards", {signal:controller.signal})
      .then(async res => {
        if (!res.ok) throw new Error(language === 'es' ? 'No pudimos cargar la tienda.' : 'Could not load the store.');
        const data = await res.json();
        setRewards(data.rewards); setBalance(data.balance);
      }).catch(e => {if (!controller.signal.aborted) setError(e.message);})
      .finally(() => {if (!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
  }, [language]);

  const handlePurchase = async (reward: Reward) => {

    if (purchasingRef.current) return;
    if (balance >= reward.cost && !reward.isPurchased) {
      purchasingRef.current = true; setPurchasing(true); setError('');
      const requestId = requests.current.get(reward.id) ?? crypto.randomUUID();
      requests.current.set(reward.id, requestId);
      try {
        const res = await fetch("/api/store/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rewardId: reward.id, requestId }),
        });
        const json = await res.json();

        if (!res.ok) throw new Error(language === "es" ? "No se pudo comprar. Revisa tu saldo e intenta de nuevo." : "Purchase failed. Check your balance and retry.");
        if (json.success) {
          setBalance(json.newBalance);
          setRewards(prev => prev.map(r => r.id === reward.id ? {...r, isPurchased: true} : r));
          setToastMessage(
            language === "es"
              ? `¡Comprado: ${reward.title}!`
              : `Purchased: ${reward.title}!`
          );
          setTimeout(() => setToastMessage(null), 3000);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Purchase failed");
      } finally {
        purchasingRef.current = false; setPurchasing(false);
      }
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

      {error && <p role="alert" className="text-red-700 mb-4">{error}</p>}
      {loading && <p role="status">{language === 'es' ? 'Cargando…' : 'Loading…'}</p>}
      <div className="grid grid-cols-2 gap-4">
        {rewards.map((reward) => {
          const IconComponent = iconMap[reward.iconType] || Gift;
          return (
            <div key={reward.id} className={`bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col justify-between items-center text-center ${reward.isPurchased ? "opacity-50" : ""}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${reward.bg}`}>
                 <IconComponent className={`w-7 h-7 ${reward.color}`} />
              </div>
              <h3 className="font-bold text-dark text-sm mb-4 h-10 flex items-center">{reward.title}</h3>

              <button
                onClick={() => handlePurchase(reward)}
                disabled={purchasing || balance < reward.cost || reward.isPurchased}
                className={`w-full py-2.5 rounded-full flex items-center justify-center space-x-1.5 font-bold text-sm transition-colors ${
                  reward.isPurchased
                    ? "bg-green-100 text-green-600"
                    : balance >= reward.cost
                    ? "bg-primary text-white hover:brightness-110 shadow-sm"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {!reward.isPurchased && <Coins className={`w-4 h-4 ${balance >= reward.cost ? "text-yellow-300" : "text-gray-300"}`} />}
                <span>{reward.isPurchased ? (language === "es" ? "Comprado" : "Purchased") : reward.cost}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
