import type { AIRecommendation } from '@/types';
import type { GeneratedTask } from './schemas';
export const CLEANING_SOURCE = {scientific_source:'CDC: Cleaning and Disinfecting Your Home',source_url:'https://www.cdc.gov/hygiene/about/when-and-how-to-clean-and-disinfect-your-home.html'};
export function validRooms(tasks: GeneratedTask[], roomTypes: string[]) {
  return tasks.every(t => t.room_specific === 'general' || roomTypes.includes(t.room_specific));
}
export function enrichTask(task: GeneratedTask, source: 'openai'|'fallback'): AIRecommendation {
  return {...task,...CLEANING_SOURCE,source,exp_reward:task.importance_level*5,area_health_impact:task.importance_level*5,
    subtasks:task.subtasks.map((s,i)=>({...s,order_index:i,exp_reward:5}))};
}
