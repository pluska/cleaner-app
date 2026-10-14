import {it,expect} from 'vitest';
import {assessmentSchema,taskSchema} from './schemas';
import {validRooms,enrichTask} from './validators';
import {getStaticRecommendations} from './fallback';
import type {HomeAssessment} from '@/types';
const task={task_name:'Clean',frequency_days:1,importance_level:3,reasoning:'Routine',health_impact:'Remove dust',friendly_explanation:'Use a cloth',tools_required:['cloth'],difficulty:'easy' as const,estimated_total_minutes:5,room_specific:'kitchen' as const,subtasks:[{title:'Wipe',description:'Follow care instructions',estimated_minutes:5,order_index:0,is_required:true,tools_needed:['cloth'],difficulty:'easy' as const}]};
it('rejects out-of-range frequency, duration and missing subtasks',()=>{
 for(const value of [{...task,frequency_days:0},{...task,estimated_total_minutes:10000},{...task,subtasks:[]}])expect(taskSchema.safeParse(value).success).toBe(false);
});
it('validates room membership and derives trusted rewards and references',()=>{
 expect(validRooms([task],['bathroom'])).toBe(false);expect(validRooms([task],['kitchen'])).toBe(true);
 const enriched=enrichTask(task,'openai');expect(enriched.exp_reward).toBe(15);expect(enriched.source_url).toMatch(/^https:\/\/www.cdc.gov\//);
});
it('supports display names in static fallbacks and both languages',()=>{
 const assessment=assessmentSchema.parse({home_type:'house',lifestyle:'busy',cleaning_preferences:'standard',rooms:[{name:'Kitchen',type:'kitchen'}]});
 const complete={...assessment,id:'u1',user_id:'u1',created_at:'',updated_at:''} as HomeAssessment;
 for(const language of ['en','es'] as const){const tasks=getStaticRecommendations(complete,language);expect(tasks.some(t=>t.room_specific==='kitchen')).toBe(true);expect(tasks.every(t=>t.source==='fallback')).toBe(true);}
});
