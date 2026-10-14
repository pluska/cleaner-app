// @vitest-environment node
import {beforeEach,afterEach,it,expect,vi} from 'vitest';
import {testDatabase,seedUser,seedTask} from '@/test/d1';
const state=vi.hoisted(()=>({fixture:undefined as unknown}));
vi.mock('@/db',()=>({database:()=>(state.fixture as ReturnType<typeof testDatabase>).binding,get db(){return (state.fixture as ReturnType<typeof testDatabase>).db;}}));
vi.mock('@/auth',()=>({auth:async()=>({user:{id:'u1'}})}));
import {TaskService} from './taskService';
import {moveOccurrence} from './rescheduleService';
import {scheduledOn,calendarDate} from '@/libs/task-schedule';
import {POST as complete} from '@/app/api/tasks/[id]/complete/route';
import {POST as createAi} from '@/app/api/tasks/ai-create/route';
import {DELETE as remove} from '@/app/api/tasks/[id]/route';
import {NextRequest} from 'next/server';
let fixture:ReturnType<typeof testDatabase>;
beforeEach(()=>{fixture=testDatabase();state.fixture=fixture;seedUser(fixture.sqlite);seedTask(fixture.sqlite);vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-05T12:00:00Z'));});
afterEach(()=>{fixture.close();vi.useRealTimers();});
const day=(value:string)=>new Date(value+'T00:00:00Z');
it('shows a moved weekly occurrence and suppresses its original date',async()=>{
 await moveOccurrence('u1','t1','2026-10-06','2026-10-05');
 expect(await TaskService.getTasksForDate('u1',day('2026-10-05'))).toHaveLength(0);
 const tasks=await TaskService.getTasksForDate('u1',day('2026-10-06'));expect(tasks).toHaveLength(1);expect(tasks[0].instanceId).toBeTruthy();
});
it('rejects concurrent moves and rolls back the losing destination',async()=>{
 const results=await Promise.allSettled([moveOccurrence('u1','t1','2026-10-06','2026-10-05'),moveOccurrence('u1','t1','2026-10-07','2026-10-05')]);
 expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(fixture.sqlite.prepare("SELECT count(*) AS n FROM taskInstances WHERE status='pending'").get()!.n).toBe(1);
});
it('rejects destination collisions without losing the source occurrence',async()=>{
 fixture.sqlite.prepare("INSERT INTO taskInstances(id,templateId,dueDate,status) VALUES('occupied','t1','2026-10-06','pending')").run();
 await expect(moveOccurrence('u1','t1','2026-10-06','2026-10-05')).rejects.toMatchObject({status:409});
 expect(await TaskService.getTasksForDate('u1',day('2026-10-05'))).toHaveLength(1);
});
it('cannot move another user’s task',async()=>{seedUser(fixture.sqlite,'u2');await expect(moveOccurrence('u2','t1','2026-10-06','2026-10-05')).rejects.toMatchObject({status:404});});
it('honors end dates and local calendar days',async()=>{
 fixture.sqlite.prepare('UPDATE taskTemplates SET endDate=? WHERE id=?').run(Date.parse('2026-10-10'),'t1');
 expect(await TaskService.getTasksForDate('u1',day('2026-10-12'))).toHaveLength(0);
 const template={rrule:'DTSTART:20261006T020000Z\nRRULE:FREQ=WEEKLY',startDate:Date.parse('2026-10-06T02:00:00Z')};
 expect(scheduledOn(template,'2026-10-05','America/Lima')).toBe(true);expect(scheduledOn(template,'2026-10-06','America/Lima')).toBe(false);
});
it('awards a completion once, including concurrent requests',async()=>{
 const request=()=>new Request('http://localhost',{method:'POST',body:JSON.stringify({dueDate:'2026-10-05'})});
 const responses=await Promise.all([complete(request(),{params:Promise.resolve({id:'t1'})}),complete(request(),{params:Promise.resolve({id:'t1'})})]);
 expect(responses.every(r=>r.status===200)).toBe(true);
 expect(fixture.sqlite.prepare('SELECT count(*) AS n FROM rewardEvents').get()!.n).toBe(1);
 expect(fixture.sqlite.prepare('SELECT xp,coins FROM userProfiles WHERE userId=?').get('u1')).toEqual({xp:10,coins:2});
 const instance=fixture.sqlite.prepare('SELECT id FROM taskInstances').get()!;
 await expect(moveOccurrence('u1',String(instance.id),'2026-10-06')).rejects.toMatchObject({status:409});
});
it('blocks completion of skipped occurrences at the database boundary',()=>{
 fixture.sqlite.exec("INSERT INTO taskInstances(id,templateId,dueDate,status) VALUES('skip','t1','2026-10-05','skipped')");
 expect(()=>fixture.sqlite.exec("INSERT INTO rewardEvents VALUES('event','u1','t1','2026-10-05','2026-10-05',10,2,123)")).toThrow('occurrence_locked');
});
it('does not delete another user’s instance',async()=>{
 seedUser(fixture.sqlite,'u2');seedTask(fixture.sqlite,'t2','u2');fixture.sqlite.exec("INSERT INTO taskInstances(id,templateId,dueDate,status) VALUES('other','t2','2026-10-05','pending')");
 const res=await remove(new NextRequest('http://localhost'),{params:Promise.resolve({id:'other'})});expect(res.status).toBe(404);expect(fixture.sqlite.prepare("SELECT id FROM taskInstances WHERE id='other'").get()).toBeTruthy();
});
const aiTask={task_name:'Wipe surfaces',frequency_days:1,importance_level:3,reasoning:'Maintain cleanliness',health_impact:'Remove dirt',friendly_explanation:'Wipe suitable surfaces',tools_required:['cloth'],difficulty:'easy',estimated_total_minutes:5,room_specific:'general',subtasks:[{title:'Wipe',description:'Follow care instructions',estimated_minutes:5,order_index:0,is_required:true,tools_needed:['cloth'],difficulty:'easy'}]};
const aiRequest=(task:unknown)=>new Request('http://localhost',{method:'POST',body:JSON.stringify({tasks:[task]})});
it('creates a real owned general room and ignores client-supplied rewards',async()=>{
 const response=await createAi(aiRequest({...aiTask,exp_reward:999999,source_url:'https://evil.example'}));
 const result=await response.json();expect(result.total_created).toBe(1);
 expect(fixture.sqlite.prepare("SELECT userId FROM rooms WHERE id='general:u1'").get()!.userId).toBe('u1');
 expect(fixture.sqlite.prepare('SELECT expReward FROM taskTemplates WHERE id=?').get(result.created_tasks[0].template_id)!.expReward).toBe(15);
});
it('rejects unknown rooms and rolls back a task when a subtask write fails',async()=>{
 expect((await (await createAi(aiRequest({...aiTask,room_specific:'bathroom'}))).json()).total_errors).toBe(1);
 fixture.sqlite.exec("CREATE TRIGGER fail_subtask BEFORE INSERT ON taskSubtemplates BEGIN SELECT RAISE(ABORT,'test'); END");
 expect((await (await createAi(aiRequest(aiTask))).json()).total_errors).toBe(1);
 expect(fixture.sqlite.prepare('SELECT count(*) AS n FROM taskTemplates').get()!.n).toBe(1);
 expect(fixture.sqlite.prepare("SELECT id FROM rooms WHERE id='general:u1'").get()).toBeUndefined();
});

it('keeps explicit calendar dates in the chosen timezone',()=>{
 for(const zone of ['America/Lima','Pacific/Kiritimati','Etc/GMT+12']) {
  const date=calendarDate('2026-10-05',zone);
  expect(scheduledOn({rrule:'FREQ=DAILY;COUNT=1',startDate:date},'2026-10-05',zone)).toBe(true);
 }
});
