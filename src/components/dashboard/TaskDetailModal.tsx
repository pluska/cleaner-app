import { X, Clock, HeartPulse, Hammer, CheckSquare, Target, Check } from "lucide-react";
import { type TaskType } from "./TaskItem";

export function TaskDetailModal({
  task,
  onClose,
}: {
  task: TaskType;
  onClose: () => void;
}) {
  const difficultyColors = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-red-100 text-red-700",
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-x-0 bottom-0 top-20 md:w-[500px] md:h-[600px] md:inset-auto md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 bg-white rounded-t-3xl md:rounded-3xl z-[101] shadow-xl flex flex-col overflow-hidden animate-slide-up md:animate-scale-in">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                {task.room}
              </span>
              {task.difficulty && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                    difficultyColors[task.difficulty]
                  }`}
                >
                  {task.difficulty}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-dark">{task.title}</h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" />
                {task.duration} min
              </span>
              {task.frequency && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-gray-400" />
                    {task.frequency}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-dark hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Description */}
          {task.description && (
            <div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Health Reason */}
          {task.healthReason && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 text-rose-800">
              <HeartPulse className="w-5 h-5 shrink-0 text-rose-500" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Por tu salud</h4>
                <p className="text-xs opacity-90 leading-relaxed">{task.healthReason}</p>
              </div>
            </div>
          )}

          {/* Tools Needed */}
          {task.tools && task.tools.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 font-semibold text-sm text-dark mb-3">
                <Hammer className="w-4 h-4 text-gray-400" />
                Herramientas Necesarias
              </h4>
              <div className="flex flex-wrap gap-2">
                {task.tools.map((tool, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="flex items-center gap-2 font-semibold text-sm text-dark">
                  <CheckSquare className="w-4 h-4 text-gray-400" />
                  Paso a Paso
                </h4>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {task.subtasks.filter(t => t.completed).length}/{task.subtasks.length}
                </span>
              </div>
              
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-white">
                    <button className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors ${subtask.completed ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-2 border-gray-200'}`}>
                      {subtask.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {subtask.title}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-gray-400 shrink-0">
                      {subtask.duration}m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {task.sourceLink && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-center">
            <a 
              href={task.sourceLink} 
              target="_blank" 
              rel="noreferrer"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
            >
              Leer fuente original →
            </a>
          </div>
        )}
      </div>
    </>
  );
}
