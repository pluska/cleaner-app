"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { InteractiveTaskCard } from "./InteractiveTaskCard";
import { TaskCompletionAnimation } from "./TaskCompletionAnimation";

// Import task templates
import taskTemplatesEn from "@/data/templates/task-templates-en.json";
import taskTemplatesEs from "@/data/templates/task-templates-es.json";

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

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  base_frequency_days: number;
  exp_reward: number;
  subtasks: Array<{
    id: string;
    title: string;
    description: string;
    exp_reward: number;
    difficulty: string;
  }>;
}

interface GamificationPreviewProps {
  showCompletionAnimation?: boolean; // Optional prop to control animation display
}

interface TaskTemplatesData {
  templates: TaskTemplate[];
}

export function GamificationPreview({
  showCompletionAnimation = true,
}: GamificationPreviewProps) {
  const { language } = useLanguage();

  // Internal state management
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [completedSubtasks, setCompletedSubtasks] = useState<Set<string>>(
    new Set()
  );
  const [totalXP, setTotalXP] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [currentVerbIndex, setCurrentVerbIndex] = useState(0);
  const [isAnimationVisible, setIsAnimationVisible] = useState(false);

  // Get task templates based on language
  const taskTemplates =
    language === "es" 
      ? (taskTemplatesEs as unknown as TaskTemplatesData).templates 
      : (taskTemplatesEn as unknown as TaskTemplatesData).templates;

  // Transform templates to our Task format
  const tasks: Task[] = taskTemplates.map((template) => {
    const description = `${template.category.replace("_", " ")} • ${
      template.base_frequency_days === 1
        ? "Daily"
        : template.base_frequency_days === 7
        ? "Weekly"
        : "Monthly"
    }`;

    return {
      id: template.id,
      title: template.name,
      description: description,
      totalXpReward: template.exp_reward,
      subtasks: template.subtasks.map((subtask) => ({
        id: subtask.id,
        title: subtask.title,
        xpReward: subtask.exp_reward,
      })),
    };
  });

  // Cleaning action verbs in both languages
  const cleaningVerbs = [
    { en: "Wipe", es: "Limpia" },
    { en: "Scrub", es: "Frota" },
    { en: "Sweep", es: "Barrer" },
    { en: "Wash", es: "Lava" },
    { en: "Rinse", es: "Enjuaga" },
    { en: "Polish", es: "Pule" },
    { en: "Dust", es: "Desempolva" },
    { en: "Vacuum", es: "Aspira" },
    { en: "Disinfect", es: "Desinfecta" },
    { en: "Declutter", es: "Organiza" },
  ];

  // Get current task to display
  const currentTask = tasks[currentTaskIndex];

  // Task completion handler with progressive unlocking
  const toggleTaskCompletion = (taskId: string, xpReward: number) => {
    const newCompletedTasks = new Set(completedTasks);
    if (newCompletedTasks.has(taskId)) {
      newCompletedTasks.delete(taskId);
      setTotalXP((prev: number) => Math.max(0, prev - xpReward));
    } else {
      newCompletedTasks.add(taskId);
      setTotalXP((prev: number) => prev + xpReward);

      // Check if current task is completed and move to next one
      if (taskId === currentTask.id) {
        // Change to next cleaning verb
        setCurrentVerbIndex((prev) => (prev + 1) % cleaningVerbs.length);

        // Show completion animation
        setIsAnimationVisible(true);

        // Move to next task after animation
        setTimeout(() => {
          setCurrentTaskIndex((prev) => (prev + 1) % tasks.length);
          // Reset subtask completion for new task
          setCompletedSubtasks(new Set());
        }, 2500); // Wait for animation to complete
      }
    }
    setCompletedTasks(newCompletedTasks);

    // Update level based XP (reduced to 100 XP per level)
    const wasCompleted = newCompletedTasks.has(taskId);
    const newXP = wasCompleted ? totalXP + xpReward : totalXP - xpReward;
    const newLevel = Math.floor(newXP / 100) + 1;

    // Check if user leveled up
    if (newLevel > currentLevel) {
      // You could add a celebration effect here
      console.log(`🎉 Level Up! You're now level ${newLevel}!`);
    }

    setCurrentLevel(newLevel);
  };

  // Subtask completion handler
  const toggleSubtaskCompletion = (
    taskId: string,
    subtaskId: string,
    xpReward: number
  ) => {
    const newCompletedSubtasks = new Set(completedSubtasks);
    if (newCompletedSubtasks.has(subtaskId)) {
      newCompletedSubtasks.delete(subtaskId);
      setTotalXP((prev: number) => Math.max(0, prev - xpReward));
    } else {
      newCompletedSubtasks.add(subtaskId);
      setTotalXP((prev: number) => prev + xpReward);
    }
    setCompletedSubtasks(newCompletedSubtasks);

    // Update level based XP (reduced to 100 XP per level)
    const wasCompleted = newCompletedSubtasks.has(subtaskId);
    const newXP = wasCompleted ? totalXP + xpReward : totalXP - xpReward;
    const newLevel = Math.floor(newXP / 100) + 1;

    // Check if user leveled up
    if (newLevel > currentLevel) {
      console.log(`🎉 Level Up! You're now level ${newLevel}!`);
    }

    setCurrentLevel(newLevel);

    // Check if all subtasks are completed and auto-complete the task
    if (newCompletedSubtasks.size === currentTask.subtasks.length) {
      // Auto-complete the task
      const newCompletedTasks = new Set(completedTasks);
      newCompletedTasks.add(taskId);
      setCompletedTasks(newCompletedTasks);

      // Change to next cleaning verb
      setCurrentVerbIndex((prev) => (prev + 1) % cleaningVerbs.length);

      // Show completion animation
      setIsAnimationVisible(true);

      // Move to next task after animation
      setTimeout(() => {
        setCurrentTaskIndex((prev) => (prev + 1) % tasks.length);
        // Reset subtask completion for new task
        setCompletedSubtasks(new Set());
      }, 2500); // Wait for animation to complete
    }
  };

  // Calculate progress to next level (reduced to 100 XP per level)
  const xpForCurrentLevel = (currentLevel - 1) * 100;
  const xpForNextLevel = currentLevel * 100;
  const progressToNextLevel = totalXP - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - totalXP;

  return (
    <>
      {/* Task Completion Animation */}
      <TaskCompletionAnimation
        isVisible={isAnimationVisible}
        onAnimationComplete={() => setIsAnimationVisible(false)}
        showAnimation={showCompletionAnimation} // Controlled by parent component
      />

      <div className="quest-preview">
        <h3>{language === "es" ? `${cleaningVerbs[currentVerbIndex].es} tu tarea` : `${cleaningVerbs[currentVerbIndex].en} your task`}</h3>
        {/* Interactive Task Cards - Show only current task */}
        <div >
          {currentTask && (
            <InteractiveTaskCard
              key={currentTask.id}
              taskId={currentTask.id}
              title={currentTask.title}
              description={currentTask.description}
              totalXpReward={currentTask.totalXpReward}
              subtasks={currentTask.subtasks}
              isCompleted={completedTasks.has(currentTask.id)}
              completedSubtasks={completedSubtasks}
              onToggleCompletion={toggleTaskCompletion}
              onToggleSubtask={toggleSubtaskCompletion}
            />
          )}
        </div>

        <div className="preview-stats" aria-live="polite">
          <div className="preview-stat">Level {currentLevel}</div>
          <div className="preview-stat">{totalXP.toLocaleString()} XP</div>
        </div>
        <div className="preview-progress">
          <p>Progress to Level {currentLevel + 1}</p>
          <span>{progressToNextLevel}/{xpForNextLevel - xpForCurrentLevel} XP</span>
          <div className="preview-progress-track" role="progressbar" aria-label={`Progress to Level ${currentLevel + 1}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressToNextLevel}>
            <div style={{ width: `${Math.min(100, Math.max(0, progressToNextLevel))}%` }} />
          </div>
          <p>{xpNeededForNextLevel > 0
            ? language === "es" ? `¡Solo ${xpNeededForNextLevel} XP más para el siguiente nivel!` : `Just ${xpNeededForNextLevel} XP more to next level!`
            : language === "es" ? "¡Nivel completado! ¡Felicidades!" : "Level completed! Congratulations!"}</p>
        </div>
      </div>
    </>
  );
}
