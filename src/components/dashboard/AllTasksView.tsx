"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Task } from "@/types";

import {
  getPriorityColor,
  getCategoryColor,
  formatTaskCategory,
} from "@/libs/task-utils";

interface TaskInstance {
  id: string;
  task_id: string;
  due_date: string;
  completed: boolean;
  user_id: string;
  created_at: string;
  tasks: Task;
}

interface GenerationState {
  task_id: string;
  last_generated_date: string;
  created_at: string;
  updated_at: string;
}

interface AllTasksViewProps {
  baseTasks: Task[];
  taskInstances: TaskInstance[];
  generationState: GenerationState[];
  userId: string;
}

export function AllTasksView({
  baseTasks,
  taskInstances,
  generationState,
}: AllTasksViewProps) {
  const [showInstances, setShowInstances] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);

  const getGenerationState = (taskId: string) => {
    return generationState.find((gs) => gs.task_id === taskId);
  };

  const getInstancesForTask = (taskId: string) => {
    return taskInstances.filter((instance) => instance.task_id === taskId);
  };

  const filteredBaseTasks = baseTasks.filter((task) => {
    if (!showCompleted && task.completed) return false;
    return true;
  });

  const filteredInstances = taskInstances.filter((instance) => {
    if (!showCompleted && instance.completed) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Base Tasks</h3>
          <p className="text-3xl font-bold text-blue-600">{baseTasks.length}</p>
          <p className="text-sm text-gray-600">
            {baseTasks.filter((t) => t.is_recurring).length} recurring
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Task Instances
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {taskInstances.length}
          </p>
          <p className="text-sm text-gray-600">
            {taskInstances.filter((t) => t.completed).length} completed
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Total Tasks</h3>
          <p className="text-3xl font-bold text-purple-600">
            {baseTasks.length + taskInstances.length}
          </p>
          <p className="text-sm text-gray-600">All tasks combined</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Recurring Tasks
          </h3>
          <p className="text-3xl font-bold text-orange-600">
            {baseTasks.filter((t) => t.is_recurring).length}
          </p>
          <p className="text-sm text-gray-600">With instances</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showInstances}
              onChange={(e) => setShowInstances(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Show Task Instances
            </span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Show Completed Tasks
            </span>
          </label>
        </div>
      </div>

      {/* Base Tasks */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Base Tasks ({filteredBaseTasks.length})
          </h2>
          <p className="text-gray-600 mt-1">
            Your original tasks, including recurring ones
          </p>
        </div>
        <div className="divide-y">
          {filteredBaseTasks.map((task) => {
            const instances = getInstancesForTask(task.id);
            const genState = getGenerationState(task.id);

            return (
              <div key={task.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3
                        className={`text-lg font-semibold ${
                          task.completed
                            ? "line-through text-gray-500"
                            : "text-gray-900"
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.is_recurring && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Recurring
                        </span>
                      )}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                          task.category
                        )}`}
                      >
                        {formatTaskCategory(task.category)}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-gray-600 mb-2">{task.description}</p>
                    )}

                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Frequency: {task.frequency}</p>
                      {task.day_of_week !== null && (
                        <p>Day of week: {task.day_of_week}</p>
                      )}
                      {task.due_date && (
                        <p>
                          Due date: {format(new Date(task.due_date), "PPP")}
                        </p>
                      )}
                      {task.is_recurring && (
                        <div>
                          <p>
                            Recurrence start:{" "}
                            {format(
                              new Date(task.recurrence_start_date),
                              "PPP"
                            )}
                          </p>
                          {task.recurrence_end_date && (
                            <p>
                              Recurrence end:{" "}
                              {format(
                                new Date(task.recurrence_end_date),
                                "PPP"
                              )}
                            </p>
                          )}
                          {genState && (
                            <p>
                              Last generated:{" "}
                              {format(
                                new Date(genState.last_generated_date),
                                "PPP"
                              )}
                            </p>
                          )}
                        </div>
                      )}
                      <p>Created: {format(new Date(task.created_at), "PPP")}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        task.completed ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  </div>
                </div>

                {/* Show instances if enabled */}
                {showInstances && task.is_recurring && instances.length > 0 && (
                  <div className="mt-4 pl-6 border-l-2 border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Generated Instances ({instances.length})
                    </h4>
                    <div className="space-y-2">
                      {instances.slice(0, 5).map((instance) => (
                        <div
                          key={instance.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span
                            className={`${
                              instance.completed
                                ? "line-through text-gray-500"
                                : "text-gray-700"
                            }`}
                          >
                            {format(new Date(instance.due_date), "PPP")}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                instance.completed
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            <span className="text-xs text-gray-500">
                              Instance ID: {instance.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      ))}
                      {instances.length > 5 && (
                        <p className="text-xs text-gray-500">
                          +{instances.length - 5} more instances
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Instances */}
      {showInstances && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              Task Instances ({filteredInstances.length})
            </h2>
            <p className="text-gray-600 mt-1">
              Generated instances from recurring tasks
            </p>
          </div>
          <div className="divide-y">
            {filteredInstances.map((instance) => (
              <div key={instance.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3
                        className={`text-lg font-semibold ${
                          instance.completed
                            ? "line-through text-gray-500"
                            : "text-gray-900"
                        }`}
                      >
                        {instance.tasks.title}
                      </h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Instance
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                          instance.tasks.priority
                        )}`}
                      >
                        {instance.tasks.priority}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                          instance.tasks.category
                        )}`}
                      >
                        {instance.tasks.category.replace("_", " ")}
                      </span>
                    </div>

                    <div className="text-sm text-gray-500 space-y-1">
                      <p>
                        Due date: {format(new Date(instance.due_date), "PPP")}
                      </p>
                      <p>Original task: {instance.tasks.title}</p>
                      <p>Instance ID: {instance.id}</p>
                      <p>
                        Created: {format(new Date(instance.created_at), "PPP")}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        instance.completed ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
