import { RRule, rrulestr } from "rrule";
import { db } from "../db";
import { taskTemplates, taskInstances, taskSubtemplates, subtaskInstances } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { format, startOfDay, endOfDay } from "date-fns";

/**
 * Helper to generate virtual tasks and merge them with actual DB instances.
 */
export class TaskService {
  /**
   * Get all tasks (virtual or realized) for a given specific date and user.
   */
  static async getTasksForDate(userId: string, targetDate: Date) {
    const targetDateStr = format(targetDate, "yyyy-MM-dd");
    const dayStart = startOfDay(targetDate);
    const dayEnd = endOfDay(targetDate);

    // 1. Fetch all templates for the user
    // In a real app with many templates, you'd filter by startDate/endDate overlap in SQL first.
    const allTemplates = await db
      .select()
      .from(taskTemplates)
      .where(eq(taskTemplates.userId, userId));

    // 2. Fetch actually materialized instances for this specific day
    const materializedInstances = await db
      .select()
      .from(taskInstances)
      .where(eq(taskInstances.dueDate, targetDateStr));

    // Map materialized by templateId for quick O(1) lookups
    const instanceMap = new Map(
      materializedInstances.map((inst) => [inst.templateId, inst])
    );

    const resultingTasks = [];

    // 3. Process the Mathematical Rules
    for (const template of allTemplates) {
      let isScheduledForToday = false;

      // Parse the RRULE (e.g., 'FREQ=DAILY;INTERVAL=1')
      try {
        // RRule logic relies on Date parsing, handling boundaries relative to the template's startDate
        const rule = rrulestr(template.rrule, {
          dtstart: new Date(template.startDate),
        });

        // Does this rule yield any occurrences exactly on our target day?
        const occurrencesToday = rule.between(dayStart, dayEnd, true); // true = inclusive
        if (occurrencesToday.length > 0) {
          isScheduledForToday = true;
        }
      } catch (err) {
        console.error(`Invalid rrule for template: ${template.id}`, err);
        continue;
      }

      if (isScheduledForToday) {
        const existingInstance = instanceMap.get(template.id);
        
        // Let's grab subtasks for the template to enrich the return object
        const subtasks = await db
          .select()
          .from(taskSubtemplates)
          .where(eq(taskSubtemplates.templateId, template.id));

        const baseTask = {
          ...template, // gamification stats
          id: template.id,
          title: template.title,
          description: template.description || undefined,
          room: template.roomId.toUpperCase().replace("_", " "),
          duration: subtasks.reduce((sum, s) => sum + (s.estimatedMinutes || 0), 0) || 15, // Default to 15m if no subtasks
          healthReason: template.healthImpact || undefined,
          sourceLink: template.scientificSource || undefined,
          difficulty: template.importanceLevel >= 4 ? "HIGH" : template.importanceLevel === 3 ? "MEDIUM" : "LOW",
          subtasks,
        };

        if (existingInstance) {
          resultingTasks.push({
            ...baseTask,
            instanceId: existingInstance.id,
            completed: existingInstance.status === "completed",
          });
        } else {
          resultingTasks.push({
            ...baseTask,
            instanceId: null,
            completed: false,
          });
        }
      }
    }

    return resultingTasks;
  }
}
