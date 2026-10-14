import { z } from 'zod';
export const roomTypes = ['kitchen','bathroom','bedroom','living_room','dining_room','office','laundry_room','garage','basement','attic','hallway','entryway'] as const;
const shortText = z.string().min(1).max(2000);
export const assessmentSchema = z.object({
  home_type:z.enum(['apartment','house','studio']), lifestyle:z.enum(['busy','moderate','relaxed']),
  cleaning_preferences:z.enum(['minimal','standard','thorough']),
  pets:z.boolean().default(false), children:z.boolean().default(false), allergies:z.boolean().default(false),
  rooms:z.array(z.object({name:z.string().min(1).max(100),type:z.enum(roomTypes),size:z.enum(['small','medium','large']).default('medium'),has_carpet:z.boolean().default(false),has_hardwood:z.boolean().default(false),has_tile:z.boolean().default(false)})).min(1).max(20),
  language:z.enum(['en','es']).default('en'),
});
export const bilingualSchema = z.object({en:shortText,es:shortText}).strict();
export const taskSchema = z.object({
  task_name:z.string().min(1).max(200),frequency_days:z.number().int().min(1).max(30),importance_level:z.number().int().min(1).max(5),
  reasoning:shortText,health_impact:shortText,friendly_explanation:shortText,
  tools_required:z.array(z.string().min(1).max(100)).max(10),difficulty:z.enum(['easy','medium','hard']),
  estimated_total_minutes:z.number().int().min(1).max(240),room_specific:z.enum([...roomTypes,'general']),
  subtasks:z.array(z.object({title:z.string().min(1).max(200),description:shortText,estimated_minutes:z.number().int().min(1).max(120),order_index:z.number().int().min(0).max(20),is_required:z.boolean(),tools_needed:z.array(z.string().max(100)).max(10),difficulty:z.enum(['easy','medium','hard'])}).strict()).min(1).max(12),
}).strict();
export const recommendationsSchema = z.object({tasks:z.array(taskSchema).min(1).max(12)}).strict();
export type GeneratedTask = z.infer<typeof taskSchema>;
