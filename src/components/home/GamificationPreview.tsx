"use client";

import { useState } from "react";
import { Star, Coins } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { InteractiveTaskCard } from "./InteractiveTaskCard";

interface Subtask {
  id: string;
  title: string;
  xpReward: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  totalXpReward: number;
  subtasks: Subtask[];
}

export function GamificationPreview() {
  const { language } = useLanguage();

  // Internal state management
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [totalXP, setTotalXP] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);

  // Task completion handler
  const toggleTaskCompletion = (taskId: string, xpReward: number) => {
    const newCompletedTasks = new Set(completedTasks);
    if (newCompletedTasks.has(taskId)) {
      newCompletedTasks.delete(taskId);
      setTotalXP((prev: number) => Math.max(0, prev - xpReward));
    } else {
      newCompletedTasks.add(taskId);
      setTotalXP((prev: number) => prev + xpReward);
    }
    setCompletedTasks(newCompletedTasks);

    // Update level based XP
    const wasCompleted = newCompletedTasks.has(taskId);
    const newXP = wasCompleted ? totalXP + xpReward : totalXP - xpReward;
    const newLevel = Math.floor(newXP / 500) + 1;

    // Check if user leveled up
    if (newLevel > currentLevel) {
      // You could add a celebration effect here
      console.log(`🎉 Level Up! You're now level ${newLevel}!`);
    }

    setCurrentLevel(newLevel);
  };

  // Task data
  const tasks: Task[] = [
    {
      id: "dust-surfaces",
      title: "Dust Surfaces",
      description: "Living Room • Weekly",
      totalXpReward: 60,
      subtasks: [
        { id: "tables", title: "Tables & surfaces", xpReward: 20 },
        { id: "shelves", title: "Shelves & bookcases", xpReward: 25 },
        { id: "decorations", title: "Decorations & frames", xpReward: 15 },
      ],
    },
    {
      id: "vacuum-carpets",
      title: "Vacuum Carpets/Floors",
      description: "Living Room • Weekly",
      totalXpReward: 80,
      subtasks: [
        { id: "carpets", title: "Vacuum carpets", xpReward: 40 },
        { id: "hard-floors", title: "Vacuum hard floors", xpReward: 30 },
        { id: "edges", title: "Vacuum edges", xpReward: 10 },
      ],
    },
    {
      id: "clean-windows",
      title: "Clean Windows",
      description: "Living Room • Monthly",
      totalXpReward: 100,
      subtasks: [
        { id: "glass-cleaner", title: "Apply glass cleaner", xpReward: 10 },
        { id: "wipe-windows", title: "Wipe windows clean", xpReward: 40 },
        { id: "frames", title: "Clean window frames", xpReward: 20 },
      ],
    },
  ];

  // Calculate progress to next level
  const xpForCurrentLevel = (currentLevel - 1) * 500;
  const xpForNextLevel = currentLevel * 500;
  const progressToNextLevel = totalXP - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - totalXP;

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 border border-primary/20 shadow-xl">
      {/* Task Completion Example */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-text mb-2">
          {language === "es"
            ? "Ejemplo de Tarea Completada"
            : "Task Completion Example"}
        </h3>
        <p className="text-sm text-text/60">
          {language === "es"
            ? "Completa tareas para ganar XP y subir de nivel"
            : "Complete tasks to earn XP and level up"}
        </p>
      </div>

      {/* Interactive Task Cards */}
      <div className="space-y-4 mb-6">
        {tasks.map((task) => (
          <InteractiveTaskCard
            key={task.id}
            taskId={task.id}
            title={task.title}
            description={task.description}
            totalXpReward={task.totalXpReward}
            subtasks={task.subtasks}
            isCompleted={completedTasks.has(task.id)}
            onToggleCompletion={toggleTaskCompletion}
          />
        ))}
      </div>

      {/* XP & Level Progress */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-gray-100">
          <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary mb-1">
            Level {currentLevel}
          </div>
          <div className="text-sm text-text/60">Current Level</div>
        </div>

        <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-gray-100">
          <div className="bg-accent/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Coins className="h-6 w-6 text-accent" />
          </div>
          <div className="text-2xl font-bold text-accent mb-1">
            {totalXP.toLocaleString()} XP
          </div>
          <div className="text-sm text-text/60">Total Earned</div>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div className="mt-4 bg-white rounded-2xl p-4 shadow-md border border-gray-100">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-text/70">
            Progress to Level {currentLevel + 1}
          </span>
          <span className="text-text font-medium">
            {progressToNextLevel}/{xpForNextLevel - xpForCurrentLevel} XP
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.min(
                100,
                Math.max(
                  0,
                  (progressToNextLevel / (xpForNextLevel - xpForCurrentLevel)) *
                    100
                )
              )}%`,
            }}
          />
        </div>
        <p className="text-xs text-text/50 mt-2 text-center">
          {xpNeededForNextLevel > 0
            ? language === "es"
              ? `¡Solo ${xpNeededForNextLevel} XP más para el siguiente nivel!`
              : `Just ${xpNeededForNextLevel} XP more to next level!`
            : language === "es"
            ? "¡Nivel completado! ¡Felicidades!"
            : "Level completed! Congratulations!"}
        </p>
      </div>
    </div>
  );
}
