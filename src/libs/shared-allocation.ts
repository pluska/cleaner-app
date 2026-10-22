import type { SharedOccurrence, WorkAssignment, WorkMember } from '@/types/shared-work';

/** Fill unassigned work within each member's opt-in daily budget. Keep published assignments. */
export function allocateSharedWork(tasks:SharedOccurrence[],members:WorkMember[],today:string):{assignments:WorkAssignment[];unassigned:number}{
  const load=new Map<string,number>(),total=new Map<string,number>();
  for(const task of tasks)if(task.assigneeId){
    const key=`${task.assigneeId}:${task.dueDate}`;
    load.set(key,(load.get(key)??0)+task.minutes);total.set(task.assigneeId,(total.get(task.assigneeId)??0)+task.minutes);
  }
  const assignments:WorkAssignment[]=[];
  const pending=tasks.filter(t=>!t.assigneeId&&!t.completedAt&&t.dueDate>=today).sort((a,b)=>a.dueDate.localeCompare(b.dueDate)||b.minutes-a.minutes||a.taskId.localeCompare(b.taskId));
  const roster=[...members].sort((a,b)=>a.userId.localeCompare(b.userId));
  for(const task of pending){
    const day=new Date(`${task.dueDate}T00:00:00Z`).getUTCDay(),offset=Math.floor(Date.parse(task.dueDate)/86400000)%Math.max(1,roster.length);
    const eligible=roster.filter(m=>!m.resting&&m.dailyMinutes>0&&(m.days&(1<<day))!==0&&(load.get(`${m.userId}:${task.dueDate}`)??0)+task.minutes<=m.dailyMinutes);
    eligible.sort((a,b)=>{
      const aDays=Math.max(1,a.days.toString(2).replaceAll('0','').length),bDays=Math.max(1,b.days.toString(2).replaceAll('0','').length);
      return ((total.get(a.userId)??0)/(a.dailyMinutes*aDays)-(total.get(b.userId)??0)/(b.dailyMinutes*bDays))
        ||((roster.indexOf(a)-offset+roster.length)%roster.length)-((roster.indexOf(b)-offset+roster.length)%roster.length);
    });
    const selected=eligible[0];if(!selected)continue;
    assignments.push({taskId:task.taskId,dueDate:task.dueDate,assigneeId:selected.userId});
    const key=`${selected.userId}:${task.dueDate}`;load.set(key,(load.get(key)??0)+task.minutes);total.set(selected.userId,(total.get(selected.userId)??0)+task.minutes);
  }
  return {assignments,unassigned:pending.length-assignments.length};
}
