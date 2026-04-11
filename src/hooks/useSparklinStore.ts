import { create } from 'zustand';
import sparklinData from '@/data/sparklin.json';

interface SparklinStore {
  isOpen: boolean;
  message: { en: string; es: string } | null;
  setIsOpen: (isOpen: boolean) => void;
  setMessage: (message: { en: string; es: string } | null) => void;
  triggerGreeting: () => void;
  triggerStatus: (code: string) => void;
  triggerWarning: (type: keyof typeof sparklinData.warnings) => void;
  triggerCompletedTask: () => void;
  triggerStreak: () => void;
  handleSpamClick: () => void;
  _clickCount: number;
  _lastClickTime: number;
}

export const useSparklinStore = create<SparklinStore>((set, get) => ({
  isOpen: false,
  message: null,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
  setMessage: (message) => set({ message }),
  
  _clickCount: 0,
  _lastClickTime: 0,

  handleSpamClick: () => {
    const now = Date.now();
    const state = get();
    
    // Reset count if more than 3 seconds have passed
    if (now - state._lastClickTime > 3000) {
      set({ _clickCount: 1, _lastClickTime: now });
      return;
    }

    const newCount = state._clickCount + 1;
    set({ _clickCount: newCount, _lastClickTime: now });

    // Trigger anti-spam at 5 clicks
    if (newCount === 5) {
      const messages = sparklinData.antiSpam;
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      set({ message: randomMsg, isOpen: true });
      // Reset after triggering so they can trigger another one if they keep spamming
      set({ _clickCount: 0 });
    }
  },

  triggerGreeting: () => {
    const currentHour = new Date().getHours();
    const greetings = sparklinData.greetings;
    const greeting = greetings.find(g => currentHour >= g.startHour && currentHour <= g.endHour) || greetings[0];
    
    set({ message: { en: greeting.en, es: greeting.es }, isOpen: true });
  },
  
  triggerStatus: (code: string) => {
    let category = "2xx";
    if (code.startsWith("4")) {
      category = code === "404" ? "404" : "401_403";
    } else if (code.startsWith("5")) {
      category = "5xx";
    }
    
    const messages = sparklinData.statusCodes[category as keyof typeof sparklinData.statusCodes];
    if (messages && messages.length > 0) {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      set({ message: randomMsg, isOpen: true });
    }
  },
  
  triggerWarning: (type: keyof typeof sparklinData.warnings) => {
    const msg = sparklinData.warnings[type];
    if (msg) {
      set({ message: msg, isOpen: true });
    }
  },
  
  triggerCompletedTask: () => {
    const messages = sparklinData.completedTasks;
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    set({ message: randomMsg, isOpen: true });
  },
  
  triggerStreak: () => {
    const messages = sparklinData.streaks;
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    set({ message: randomMsg, isOpen: true });
  }
}));
