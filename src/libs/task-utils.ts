import { Task } from "@/types";

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "text-red-600 bg-red-100";
    case "medium":
      return "text-primary bg-primary/10";
    case "low":
      return "text-accent bg-accent/20";
    default:
      return "text-text bg-base";
  }
};

export const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    general: "bg-base text-text",
    kitchen: "bg-orange-100 text-orange-800",
    bathroom: "bg-primary/20 text-primary",
    bedroom: "bg-purple-100 text-purple-800",
    living_room: "bg-green-100 text-green-800",
    laundry: "bg-accent/20 text-accent",
    exterior: "bg-indigo-100 text-indigo-800",
  };
  return colors[category] || colors.general;
};

export const isTaskOverdue = (task: Task) => {
  const today = new Date().toISOString().split("T")[0];
  return task.due_date && task.due_date < today && !task.completed;
};

export const getOverdueStyle = (task: Task) => {
  if (isTaskOverdue(task)) {
    return "text-red-600 font-semibold";
  }
  return task.completed ? "line-through text-gray-500" : "text-gray-900";
};

export const getDaysOfWeek = (language: "en" | "es" = "en") => [
  { value: 0, label: language === "es" ? "Domingo" : "Sunday" },
  { value: 1, label: language === "es" ? "Lunes" : "Monday" },
  { value: 2, label: language === "es" ? "Martes" : "Tuesday" },
  { value: 3, label: language === "es" ? "Miércoles" : "Wednesday" },
  { value: 4, label: language === "es" ? "Jueves" : "Thursday" },
  { value: 5, label: language === "es" ? "Viernes" : "Friday" },
  { value: 6, label: language === "es" ? "Sábado" : "Saturday" },
];

export const getTaskCategories = (language: "en" | "es" = "en") => [
  { value: "general", label: language === "es" ? "General" : "General" },
  { value: "kitchen", label: language === "es" ? "Cocina" : "Kitchen" },
  { value: "bathroom", label: language === "es" ? "Baño" : "Bathroom" },
  { value: "bedroom", label: language === "es" ? "Dormitorio" : "Bedroom" },
  {
    value: "living_room",
    label: language === "es" ? "Sala de estar" : "Living Room",
  },
  { value: "laundry", label: language === "es" ? "Lavandería" : "Laundry" },
  { value: "exterior", label: language === "es" ? "Exterior" : "Exterior" },
];

export const getTaskPriorities = (language: "en" | "es" = "en") => [
  {
    value: "low",
    label: language === "es" ? "Baja prioridad" : "Low Priority",
  },
  {
    value: "medium",
    label: language === "es" ? "Prioridad media" : "Medium Priority",
  },
  {
    value: "high",
    label: language === "es" ? "Alta prioridad" : "High Priority",
  },
];

export const getTaskFrequencies = (language: "en" | "es" = "en") => [
  { value: "daily", label: language === "es" ? "Diario" : "Daily" },
  { value: "weekly", label: language === "es" ? "Semanal" : "Weekly" },
  { value: "monthly", label: language === "es" ? "Mensual" : "Monthly" },
  { value: "yearly", label: language === "es" ? "Anual" : "Yearly" },
];

export const formatTaskCategory = (category: string) => {
  return category.replace("_", " ");
};

export const getTaskStatusBadge = (
  task: Task,
  language: "en" | "es" = "en"
) => {
  if (isTaskOverdue(task)) {
    return {
      text: language === "es" ? "Atrasado" : "Overdue",
      className:
        "px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600",
    };
  }

  if (task.completed) {
    return {
      text: language === "es" ? "Completado" : "Completed",
      className:
        "px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600",
    };
  }

  return null;
};
