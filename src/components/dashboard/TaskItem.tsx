import { Check, Sofa, Bath, Utensils, Bed, MoreHorizontal } from "lucide-react";

export type RoomType = "LIVING ROOM" | "BATHROOM" | "KITCHEN" | "BEDROOM";

export interface TaskType {
  id: string;
  title: string;
  room: RoomType;
  duration: number; // in minutes
  completed: boolean;
  difficulty?: "LOW" | "MEDIUM" | "HIGH";
  description?: string;
  frequency?: string;
  tools?: string[];
  healthReason?: string;
  sourceLink?: string;
  subtasks?: { id: string; title: string; duration: number; completed: boolean }[];
}

const roomConfig = {
  "LIVING ROOM": {
    icon: Sofa,
    bg: "bg-blue-50/50",
    border: "border-blue-100",
    tagBg: "bg-blue-100",
    tagText: "text-blue-700",
    iconColor: "text-blue-600",
  },
  "BATHROOM": {
    icon: Bath,
    bg: "bg-purple-50/50",
    border: "border-purple-100",
    tagBg: "bg-purple-100",
    tagText: "text-purple-700",
    iconColor: "text-purple-600",
  },
  "KITCHEN": {
    icon: Utensils,
    bg: "bg-orange-50/50",
    border: "border-orange-100",
    tagBg: "bg-orange-100",
    tagText: "text-orange-700",
    iconColor: "text-orange-600",
  },
  "BEDROOM": {
    icon: Bed,
    bg: "bg-emerald-50/50",
    border: "border-emerald-100",
    tagBg: "bg-emerald-100",
    tagText: "text-emerald-700",
    iconColor: "text-emerald-600",
  },
};

export function TaskItem({
  task,
  onToggle,
  onViewDetails,
}: {
  task: TaskType;
  onToggle: (task: TaskType) => void;
  onViewDetails?: (task: TaskType) => void;
}) {
  const config = roomConfig[task.room];
  const Icon = config.icon;

  const difficultyColors = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-red-100 text-red-700",
  };

  return (
    <div
      className={`p-4 rounded-[24px] border ${config.bg} ${config.border} flex items-center space-x-4 transition-all pr-2`}
    >
      <button
        onClick={() => onToggle(task)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
          task.completed
            ? "bg-dark border-dark"
            : "border-gray-200 bg-white"
        }`}
      >
        {task.completed && (
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <h3
          className={`font-semibold text-[15px] mb-1.5 truncate pr-2 ${
            task.completed ? "text-gray-400 line-through" : "text-dark"
          }`}
        >
          {task.title}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`flex items-center space-x-1 px-2.5 py-[3px] rounded-md shrink-0 ${config.tagBg} ${config.tagText}`}
          >
            <Icon className={`w-3 h-3 ${config.iconColor}`} strokeWidth={2.5} />
            <span className="text-[9px] font-bold tracking-widest uppercase">
              {task.room}
            </span>
          </div>
          <span className="text-gray-400 text-xs font-medium shrink-0">
            {task.duration} min
          </span>
          {task.difficulty && (
            <span
              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                difficultyColors[task.difficulty]
              }`}
            >
              {task.difficulty}
            </span>
          )}
        </div>
      </div>

      {onViewDetails && (
        <button 
          onClick={() => onViewDetails(task)}
          className="p-2 text-gray-400 hover:text-dark hover:bg-white/50 rounded-full transition-colors shrink-0"
          title="Ver detalles"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
