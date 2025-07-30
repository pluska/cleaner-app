"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Coins, Gem, Heart, Zap, CheckCircle } from "lucide-react";

interface NotificationProps {
  type: "exp" | "coins" | "gems" | "level" | "health" | "tools";
  value: number;
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const notificationConfig = {
  exp: {
    icon: Star,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  coins: {
    icon: Coins,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  gems: {
    icon: Gem,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  level: {
    icon: Star,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  health: {
    icon: Heart,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  tools: {
    icon: Zap,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
};

export function Notification({
  type,
  value,
  message,
  isVisible,
  onClose,
}: NotificationProps) {
  const config = notificationConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 right-4 z-50"
        >
          <div
            className={`${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg p-4 max-w-sm`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`${config.color} p-2 rounded-full bg-white shadow-sm`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{message}</h4>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  +{value}{" "}
                  {type === "exp"
                    ? "EXP"
                    : type === "coins"
                    ? "coins"
                    : type === "gems"
                    ? "gems"
                    : type === "health"
                    ? "health"
                    : "points"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Notification Manager Hook
export function useNotificationManager() {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      type: "exp" | "coins" | "gems" | "level" | "health" | "tools";
      value: number;
      message: string;
      isVisible: boolean;
    }>
  >([]);

  const showNotification = (
    type: "exp" | "coins" | "gems" | "level" | "health" | "tools",
    value: number,
    message: string
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      id,
      type,
      value,
      message,
      isVisible: true,
    };

    setNotifications((prev) => [...prev, newNotification]);
  };

  const hideNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const showRewards = (rewards: any) => {
    if (rewards.exp_earned > 0) {
      showNotification("exp", rewards.exp_earned, "Experience gained!");
    }
    if (rewards.coins_earned > 0) {
      showNotification("coins", rewards.coins_earned, "Coins earned!");
    }
    if (rewards.gems_earned > 0) {
      showNotification("gems", rewards.gems_earned, "Gems earned!");
    }
    if (rewards.level_up) {
      showNotification("level", 1, "Level up!");
    }
    if (rewards.area_health_restored > 0) {
      showNotification(
        "health",
        rewards.area_health_restored,
        "Area health restored!"
      );
    }
  };

  return {
    notifications,
    showNotification,
    hideNotification,
    showRewards,
  };
}
