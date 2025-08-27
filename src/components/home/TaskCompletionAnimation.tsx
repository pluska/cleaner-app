"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles } from "lucide-react";

interface TaskCompletionAnimationProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
  showAnimation?: boolean; // Optional prop to control animation display
}

export function TaskCompletionAnimation({
  isVisible,
  onAnimationComplete,
  showAnimation = true, // Default to true for backward compatibility
}: TaskCompletionAnimationProps) {
  // Enhanced spark particles
  const sparks = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    delay: i * 0.03,
    angle: (i / 24) * 360,
    distance: 50 + Math.random() * 60,
    size: 0.8 + Math.random() * 0.8,
  }));

  // Shine particles for extra sparkle
  const shineParticles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    delay: i * 0.04,
    angle: (i / 16) * 360,
    distance: 30 + Math.random() * 40,
    size: 0.6 + Math.random() * 0.6,
  }));

  // Floating sparkles
  const floatingSparkles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 0.1,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 200,
    size: 1 + Math.random() * 1.5,
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {showAnimation && (
            <>
              {/* Background glow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-pink-400/20"
              />

              {/* Central celebration icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2,
                }}
                className="relative z-10"
              >
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-6 shadow-2xl">
                  <Star className="h-16 w-16 text-white" fill="white" />
                </div>
              </motion.div>
            </>
          )}
          {/* Enhanced spark particles radiating outward */}
          {sparks.map((spark) => (
            <motion.div
              key={spark.id}
              initial={{
                opacity: 0,
                scale: 0,
                x: 0,
                y: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, spark.size, 0],
                x: Math.cos((spark.angle * Math.PI) / 180) * spark.distance,
                y: Math.sin((spark.angle * Math.PI) / 180) * spark.distance,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 1.8,
                delay: spark.delay,
                ease: "easeOut",
              }}
              className="absolute"
            >
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </motion.div>
          ))}

          {/* Shine particles for extra sparkle */}
          {shineParticles.map((shine) => (
            <motion.div
              key={shine.id}
              initial={{
                opacity: 0,
                scale: 0,
                x: 0,
                y: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, shine.size, 0],
                x: Math.cos((shine.angle * Math.PI) / 180) * shine.distance,
                y: Math.sin((shine.angle * Math.PI) / 180) * shine.distance,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 1.2,
                delay: shine.delay,
                ease: "easeOut",
              }}
              className="absolute"
            >
              <Star className="h-4 w-4 text-orange-400" fill="currentColor" />
            </motion.div>
          ))}

          {/* Floating sparkles around the screen */}
          {floatingSparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              initial={{
                opacity: 0,
                scale: 0,
                x: 0,
                y: 0,
              }}
              animate={{
                opacity: [0, 1, 0.8, 0],
                scale: [0, sparkle.size, 0.8, 0],
                x: sparkle.x,
                y: sparkle.y,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 2.5,
                delay: sparkle.delay,
                ease: "easeInOut",
              }}
              className="absolute"
            >
              <Sparkles className="h-6 w-6 text-pink-400" />
            </motion.div>
          ))}

          {/* Success text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.5,
              delay: 0.8,
            }}
            className="absolute bottom-20 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 1,
              }}
              className="bg-white rounded-2xl px-6 py-3 shadow-lg border border-gray-100"
            >
              <span className="text-lg font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                ✨ Task Completed! ✨
              </span>
            </motion.div>
          </motion.div>

          {/* Auto-hide after animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onAnimationComplete={() => {
              setTimeout(() => {
                onAnimationComplete?.();
              }, 2500); // Hide after 2.5 seconds
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
