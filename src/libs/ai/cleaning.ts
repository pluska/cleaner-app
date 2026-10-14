import type { HomeAssessment, AIRecommendation } from '@/types';
import { generateStructured } from './generator';
import { recommendationsSchema } from './schemas';
import { CLEANING_PROMPT } from './prompts';
import { enrichTask, validRooms } from './validators';
import { getStaticRecommendations } from './fallback';
export async function generateCleaningTasks(assessment: HomeAssessment, language: 'en'|'es', userId: string): Promise<AIRecommendation[]> {
  const result = await generateStructured({userId,prompt:CLEANING_PROMPT,input:{home_type:assessment.home_type,lifestyle:assessment.lifestyle,cleaning_preferences:assessment.cleaning_preferences,pets:assessment.pets,children:assessment.children,allergies:assessment.allergies,rooms:assessment.rooms,language},schema:recommendationsSchema,name:'cleaning_tasks',
    validate:value=>validRooms(value.tasks,assessment.rooms.map(r=>r.type)),fallback:()=>({tasks:[]})});
  return result.source==='fallback' ? getStaticRecommendations(assessment,language) : result.value.tasks.map(t=>enrichTask(t,'openai'));
}
