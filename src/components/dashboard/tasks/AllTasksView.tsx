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
  user_task_id: string;
  due_date: string;
  completed: boolean;
  created_at: string;
  user_tasks: {
    id: string;
    user_id: string;
    template_id: string;
    is_active: boolean;
    task_templates: {
      id: string;
      name: string;
      description: string;
      category: string;
      base_frequency_days: number;
      importance_level: number;
      exp_reward: number;
      is_ai_generated: boolean;
    };
  };
}

interface UserTask {
  id: string;
  user_id: string;
  template_id: string;
  is_active: boolean;
  created_at: string;
  task_templates: {
    id: string;
    name: string;
    description: string;
    category: string;
    base_frequency_days: number;
    importance_level: number;
    exp_reward: number;
    is_ai_generated: boolean;
  };
}

interface AllTasksViewProps {
  userTasks: UserTask[];
  taskInstances: TaskInstance[];
  userId: string;
}

export function AllTasksView({
  userTasks,
  taskInstances,
  userId,
}: AllTasksViewProps) {
  const [showInstances, setShowInstances] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);

  const getInstancesForTask = (userTaskId: string) => {
    return taskInstances.filter(
      (instance) => instance.user_task_id === userTaskId
    );
  };

  const filteredUserTasks = userTasks.filter((task) => {
    if (!showCompleted) return true; // No completed field in user_tasks
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
          <h3 className="text-lg font-semibold text-gray-900">User Tasks</h3>
          <p className="text-3xl font-bold text-blue-600">{userTasks.length}</p>
          <p className="text-sm text-gray-600">
            {userTasks.filter((t) => t.is_active).length} active
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
            {userTasks.length + taskInstances.length}
          </p>
          <p className="text-sm text-gray-600">All tasks combined</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Active Tasks</h3>
          <p className="text-3xl font-bold text-orange-600">
            {userTasks.filter((t) => t.is_active).length}
          </p>
          <p className="text-sm text-gray-600">With instances</p>
        </div>
      </div>

      {/* User Tasks Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Tasks</h2>
          <p className="text-gray-600 mt-1">
            Base tasks that can generate instances
          </p>
        </div>
        <div className="p-6">
          {filteredUserTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No tasks found. Create some tasks to get started!
            </p>
          ) : (
            <div className="space-y-4">
              {filteredUserTasks.map((userTask) => (
                <div
                  key={userTask.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {userTask.task_templates.name}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {userTask.task_templates.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">
                          Category: {userTask.task_templates.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          Frequency:{" "}
                          {userTask.task_templates.base_frequency_days} days
                        </span>
                        <span className="text-sm text-gray-500">
                          EXP: {userTask.task_templates.exp_reward}
                        </span>
                        {userTask.task_templates.is_ai_generated && (
                          <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            AI Generated
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userTask.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {userTask.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Task Instances */}
                  {showInstances && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Instances ({getInstancesForTask(userTask.id).length})
                      </h4>
                      <div className="space-y-2">
                        {getInstancesForTask(userTask.id).map((instance) => (
                          <div
                            key={instance.id}
                            className="bg-gray-50 rounded p-3 text-sm"
                          >
                            <div className="flex items-center justify-between">
                              <span>
                                Due:{" "}
                                {format(
                                  new Date(instance.due_date),
                                  "MMM dd, yyyy"
                                )}
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  instance.completed
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {instance.completed ? "Completed" : "Pending"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
