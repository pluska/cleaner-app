// @vitest-environment node
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { testDatabase, seedUser, seedTask } from '@/test/d1';
const state=vi.hoisted(()=>({fixture:undefined as unknown,userId:'u1' as string|null}));
vi.mock('@/db',()=>({database:()=>(state.fixture as ReturnType<typeof testDatabase>).binding,get db(){return (state.fixture as ReturnType<typeof testDatabase>).db;}}));
vi.mock('@/auth',()=>({auth:async()=>state.userId ? {user:{id:state.userId}} : null}));
import {POST as suggested} from '@/app/api/tasks/suggested/route';
import {POST as assessment} from '@/app/api/user/home-assessment/route';
import {GET as activity} from '@/app/api/user/weekly-activity/route';
import {GET as calendar} from '@/app/api/tasks/calendar/route';
import {POST as complete} from '@/app/api/tasks/[id]/complete/route';
import {PATCH as edit} from '@/app/api/tasks/[id]/route';
import {TaskService} from './taskService';
import english from '@/data/templates/task-templates-en.json';
import {NextRequest} from 'next/server';
let fixture:ReturnType<typeof testDatabase>;
beforeEach(()=>{fixture=testDatabase();state.fixture=fixture;state.userId='u1';seedUser(fixture.sqlite);vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-05T12:00:00Z'));});
afterEach(()=>{fixture.close();vi.useRealTimers();});
const request=(body:unknown)=>new Request('http://localhost',{method:'POST',body:JSON.stringify(body)});
const preferences={rooms:['kitchen'],lifestyle:'moderate',cleaning_preferences:'standard',language:'en'};
it('generates suggestions atomically and idempotently without modifying shared templates',async()=>{
 const original=JSON.stringify(english);
 const responses=await Promise.all([suggested(request(preferences)),suggested(request(preferences))]);
 expect(responses.every(r=>r.status===200)).toBe(true);
 const data=await responses[0].json();
 expect(fixture.sqlite.prepare('SELECT count(*) AS n FROM taskTemplates').get()!.n).toBe(data.tasks.length);
 expect(fixture.sqlite.prepare('SELECT count(*) AS n FROM taskSubtemplates').get()!.n).toBeGreaterThan(0);
 expect(JSON.stringify(english)).toBe(original);
 seedUser(fixture.sqlite,'u2');state.userId='u2';
 expect((await suggested(request({...preferences,lifestyle:'busy'}))).status).toBe(200);
 expect(fixture.sqlite.prepare('SELECT COUNT(DISTINCT userId) AS n FROM taskTemplates').get()!.n).toBe(2);
});
it('rolls back a suggested blueprint if a subtask write fails',async()=>{
 fixture.sqlite.exec("CREATE TRIGGER fail BEFORE INSERT ON taskSubtemplates BEGIN SELECT RAISE(ABORT,'test'); END");
 expect((await suggested(request(preferences))).status).toBe(500);
 expect(fixture.sqlite.prepare('SELECT count(*) AS n FROM taskTemplates').get()!.n).toBe(0);
});
it('validates assessment and converts preferences/booleans to their database representation',async()=>{
 const input={home_type:'house',lifestyle:'moderate',cleaning_preferences:'standard',pets:false,rooms:[{name:'Kitchen',type:'kitchen'}]};
 expect((await assessment(request(input))).status).toBe(201);
 const row=fixture.sqlite.prepare('SELECT cleaningPreferences,pets FROM homeAssessments').get()!;
 expect(row).toEqual({cleaningPreferences:2,pets:'false'});
 expect((await assessment(request({...input,rooms:[]}))).status).toBe(400);
 expect((await suggested(request({...preferences,pets:'false'}))).status).toBe(400);
});
it('calendar merges recurrence and completed occurrences without leaking another user',async()=>{
 seedTask(fixture.sqlite);seedUser(fixture.sqlite,'u2');seedTask(fixture.sqlite,'t2','u2');
 await complete(request({dueDate:'2026-10-05'}),{params:Promise.resolve({id:'t1'})});
 const response=await calendar(new Request('http://localhost?month=2026-10'));
 const {days}=await response.json();
 expect(days.find((d:{date:string})=>d.date==='2026-10-05')).toEqual({date:'2026-10-05',total:1,completed:1});
 expect(days.find((d:{date:string})=>d.date==='2026-10-12').total).toBe(1);
 expect((await calendar(new Request('http://localhost?month=2026-13'))).status).toBe(400);
});
it('weekly statistics are derived from actual rewards, respect week selection, and scope totals',async()=>{
 seedTask(fixture.sqlite);await complete(request({dueDate:'2026-10-05'}),{params:Promise.resolve({id:'t1'})});
 const data=await (await activity(new Request('http://localhost?week=0'))).json();
 expect(data.activities[0]).toMatchObject({day:'Mon',score:10,isToday:true});
 expect(data.summary).toEqual({completedTasks:1,totalXp:10,estimatedMinutes:15});
 const prior=await (await activity(new Request('http://localhost?week=1'))).json();
 expect(prior.activities.every((a:{score:number})=>a.score===0)).toBe(true);
 seedUser(fixture.sqlite,'u2');state.userId='u2';
 expect((await (await activity(new Request('http://localhost'))).json()).summary.completedTasks).toBe(0);
});
it('handles over 100 tasks without exceeding D1 bind limits and returns ordered step durations',async()=>{
 for(let i=0;i<110;i++) seedTask(fixture.sqlite,`t${i}`);
 fixture.sqlite.exec("INSERT INTO taskSubtemplates(id,templateId,title,estimatedMinutes,orderIndex) VALUES('s2','t0','second',7,2),('s1','t0','first',3,1)");
 const data=await TaskService.getTasksForDate('u1',new Date('2026-10-05'));
 expect(data).toHaveLength(110);
 expect(data[0].subtasks.map(s=>[s.title,s.duration,s.completed])).toEqual([['first',3,false],['second',7,false]]);
});
it('allows clearing task descriptions through the supported PATCH API',async()=>{
 seedTask(fixture.sqlite);
 const response=await edit(new NextRequest('http://localhost',{method:'PATCH',body:JSON.stringify({description:''})}),{params:Promise.resolve({id:'t1'})});
 expect(response.status).toBe(200);
 expect((await response.json()).task.description).toBeNull();
});
it('requires authentication on the new calendar and statistics endpoints',async()=>{
 state.userId=null;
 expect((await calendar(new Request('http://localhost?month=2026-10'))).status).toBe(401);
 expect((await activity(new Request('http://localhost'))).status).toBe(401);
});

it('a reward unlocks once under concurrent purchases with different request IDs',async()=>{
 const {POST:purchase}=await import('@/app/api/store/purchase/route');
 fixture.sqlite.exec("INSERT INTO rewardsStore(id,title,cost) VALUES('r1','Reward',50),('r2','Other',50); UPDATE userProfiles SET coins=200");
 const responses=await Promise.all([purchase(request({rewardId:'r1',requestId:'request-one'})),purchase(request({rewardId:'r1',requestId:'request-two'}))]);
 expect(responses.map(r=>r.status).sort()).toEqual([200,400]);
 expect(fixture.sqlite.prepare('SELECT coins FROM userProfiles').get()!.coins).toBe(150);
 expect(fixture.sqlite.prepare('SELECT count(*) AS n FROM userRewards').get()!.n).toBe(1);
 const record=fixture.sqlite.prepare('SELECT id FROM userRewards').get()!;
 const requestId=String(record.id).slice(3);
 expect((await purchase(request({rewardId:'r1',requestId}))).status).toBe(200);
 expect((await purchase(request({rewardId:'r2',requestId}))).status).toBe(409);
});
it('concurrent room creation is idempotent and keeps a consistent initial balance',async()=>{
 const {POST:area}=await import('@/app/api/user/areas/route');
 const responses=await Promise.all([area(new NextRequest('http://localhost',{method:'POST',body:JSON.stringify({area_name:'Bedroom',area_type:'bedroom'})})),area(new NextRequest('http://localhost',{method:'POST',body:JSON.stringify({area_name:'Bedroom',area_type:'bedroom'})}))]);
 expect(responses.every(r=>r.ok)).toBe(true);
 expect(fixture.sqlite.prepare("SELECT count(*) AS n FROM rooms WHERE name='Bedroom'").get()!.n).toBe(1);
});

it('scopes legacy building helpers to the authenticated owner',async()=>{
 const {fetchUserBuildings,updateBuildingSlot}=await import('@/libs/buildings-api');
 seedUser(fixture.sqlite,'u2');
 fixture.sqlite.prepare("INSERT INTO buildings(id,userId,type,name,slotIndex,createdAt,updatedAt) VALUES('other-building','u2','TOWER','Other',0,?,?)").run(Date.now(),Date.now());
 await expect(fetchUserBuildings('u2')).rejects.toMatchObject({status:404});
 await updateBuildingSlot('other-building',4);
 expect(fixture.sqlite.prepare("SELECT slotIndex FROM buildings WHERE id='other-building'").get()!.slotIndex).toBe(0);
 await expect(updateBuildingSlot('other-building',-1)).rejects.toMatchObject({status:400});
});
it('completes an existing legacy occurrence even when its recurrence text is invalid',async()=>{
 seedTask(fixture.sqlite);
 fixture.sqlite.exec("UPDATE taskTemplates SET rrule='invalid'; INSERT INTO taskInstances(id,templateId,dueDate,status) VALUES('legacy','t1','2026-10-05','pending')");
 expect((await complete(request({dueDate:'2026-10-05'}),{params:Promise.resolve({id:'t1'})})).status).toBe(200);
});
