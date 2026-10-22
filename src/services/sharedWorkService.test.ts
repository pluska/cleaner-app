// @vitest-environment node
import { beforeEach,afterEach,describe,it,expect,vi } from 'vitest';
import { seedUser,testDatabase } from '@/test/d1';
let fixture:ReturnType<typeof testDatabase>;
vi.mock('@/db',()=>({database:()=>fixture.binding}));
import { createHousehold,inviteMember,acceptInvitation,removeMember } from './householdService';
import { addSharedRoom,addSharedTask,assignSharedTask,archiveSharedTask,completeSharedTask,requestHandoff,respondHandoff,saveAvailability,sharedProposal,sharedTimezone,workBoard } from './sharedWorkService';
let household:string,room:string,today:string;
beforeEach(async()=>{
  fixture=testDatabase();for(const u of ['u1','u2','u3'])seedUser(fixture.sqlite,u);
  household=(await createHousehold('u1','Shared home')).id;
  await acceptInvitation('u2',(await inviteMember('u1',household,'u2@example.com')).token);
  room=String((await addSharedRoom('u1',household,{name:'Kitchen'})).id);
  today=new Date().toISOString().slice(0,10);
});
afterEach(()=>{vi.useRealTimers();fixture.close();});
async function task(extra:Record<string,unknown>={}){return (await addSharedTask('u1',household,{roomId:room,title:'Clean surfaces',minutes:10,startDate:today,...extra})).id;}
const occurrence=(taskId:string)=>({taskId,dueDate:today});

describe('shared household work',()=>{
 it('scopes rooms, tasks, availability and assignments to current members',async()=>{
   await expect(workBoard('u3',household)).rejects.toMatchObject({status:404});
   await expect(addSharedRoom('u2',household,{name:'Forbidden'})).rejects.toMatchObject({status:409});
   await expect(task({assigneeId:'u3'})).rejects.toMatchObject({status:400});
   const id=await task({assigneeId:'u2'});
   expect((await workBoard('u2',household,today)).tasks).toMatchObject([{taskId:id,assigneeId:'u2'}]);
   await expect(assignSharedTask('u2',household,{...occurrence(id),assigneeId:'u1'})).rejects.toMatchObject({status:409});
   await expect(completeSharedTask('u1',household,occurrence(id))).rejects.toMatchObject({status:409});
   await expect(saveAvailability('u3',household,{days:127,dailyMinutes:20,resting:false})).rejects.toMatchObject({status:409});
 });
 it('credits the actual contributor once and preserves balances under concurrent completion',async()=>{
   const id=await task({assigneeId:'u2'});
   await Promise.all([completeSharedTask('u2',household,occurrence(id)),completeSharedTask('u2',household,occurrence(id))]);
   expect(fixture.sqlite.prepare("SELECT xp,coins FROM userProfiles WHERE userId='u2'").get()).toEqual({xp:10,coins:2});
   expect(fixture.sqlite.prepare("SELECT xp,coins FROM userProfiles WHERE userId='u1'").get()).toEqual({xp:0,coins:0});
   expect((await workBoard('u1',household,today)).resources).toBe(1);
   expect(fixture.sqlite.prepare("SELECT count(*) n FROM rewardEvents WHERE id LIKE 'household:%'").get()!.n).toBe(1);
   await expect(assignSharedTask('u1',household,{...occurrence(id),assigneeId:'u1'})).rejects.toMatchObject({status:409});
   const future=new Date(Date.parse(today)+86400000).toISOString().slice(0,10),other=await task({startDate:future});
   await expect(completeSharedTask('u1',household,{taskId:other,dueDate:future})).rejects.toMatchObject({status:400});
 });
 it('keeps household due dates and contributor activity dates in their own timezones',async()=>{
   vi.useFakeTimers();vi.setSystemTime(new Date('2026-01-02T01:00:00Z'));
   await sharedTimezone('u1',household,'America/Lima');
   fixture.sqlite.prepare("UPDATE userProfiles SET timezone='Asia/Tokyo' WHERE userId='u2'").run();
   const id=await task({startDate:'2026-01-01',assigneeId:'u2'});
   await completeSharedTask('u2',household,{taskId:id,dueDate:'2026-01-01'});
   expect(fixture.sqlite.prepare('SELECT activityDate FROM householdCompletions WHERE taskId=?').get(id)!.activityDate).toBe('2026-01-02');
   expect(fixture.sqlite.prepare("SELECT lastActivityDate FROM userProfiles WHERE userId='u2'").get()!.lastActivityDate).toBe('2026-01-02');
 });
 it('rolls back shared completion, common resources and personal rewards together',async()=>{
   const id=await task();fixture.sqlite.exec("CREATE TRIGGER reject_shared_reward BEFORE INSERT ON activityLog WHEN NEW.id LIKE 'household:%' BEGIN SELECT RAISE(ABORT,'test'); END");
   await expect(completeSharedTask('u1',household,occurrence(id))).rejects.toThrow();
   expect(fixture.sqlite.prepare('SELECT count(*) n FROM householdCompletions').get()!.n).toBe(0);
   expect(fixture.sqlite.prepare("SELECT xp FROM userProfiles WHERE userId='u1'").get()!.xp).toBe(0);
   expect((await workBoard('u1',household,today)).resources).toBe(0);
 });
 it('expands daily recurrences without copying personal tasks and rejects non-occurrences',async()=>{
   const id=await task({frequency:'daily'});expect((await workBoard('u1',household,today)).tasks.filter(t=>t.taskId===id)).toHaveLength(7);
   const once=await task(),tomorrow=new Date(Date.parse(today)+86400000).toISOString().slice(0,10);
   await expect(completeSharedTask('u1',household,{taskId:once,dueDate:tomorrow})).rejects.toMatchObject({status:400});
   expect(fixture.sqlite.prepare('SELECT count(*) n FROM taskTemplates').get()!.n).toBe(0);
   await archiveSharedTask('u1',household,{taskId:id});expect((await workBoard('u1',household,today)).tasks.filter(t=>t.taskId===id)).toHaveLength(0);
 });
 it('previews a capacity-aware allocation and rejects stale publication',async()=>{
   for(const u of ['u1','u2'])await saveAvailability(u,household,{days:127,dailyMinutes:10,resting:false});
   await task();await task({title:'Second'});await task({title:'Too much'});
   const preview=await sharedProposal('u1',household,{start:today});expect(preview.assignments).toHaveLength(2);expect(preview.unassigned).toBe(1);
   expect((await workBoard('u1',household,today)).tasks.every(t=>t.assigneeId===null)).toBe(true);
   await saveAvailability('u2',household,{days:127,dailyMinutes:10,resting:true});
   await expect(sharedProposal('u1',household,{...preview},true)).rejects.toMatchObject({status:409});
   const fresh=await sharedProposal('u1',household,{start:today});expect(fresh.assignments).toHaveLength(1);
   await sharedProposal('u1',household,{...fresh},true);
   expect((await workBoard('u1',household,today)).tasks.filter(t=>t.assigneeId)).toHaveLength(1);
   await expect(sharedProposal('u2',household,{start:today})).rejects.toMatchObject({status:403});
 });
 it('requires the targeted member to accept a handoff and cancels stale requests',async()=>{
   const id=await task({assigneeId:'u1'}),r=await requestHandoff('u1',household,{...occurrence(id),toUserId:'u2'});
   await expect(respondHandoff('u1',household,{requestId:r.id,response:'accepted'})).rejects.toMatchObject({status:409});
   await respondHandoff('u2',household,{requestId:r.id,response:'accepted'});
   expect((await workBoard('u1',household,today)).tasks[0].assigneeId).toBe('u2');
   const next=await requestHandoff('u2',household,{...occurrence(id),toUserId:'u1'});
   await completeSharedTask('u2',household,occurrence(id));
   await expect(respondHandoff('u1',household,{requestId:next.id,response:'accepted'})).rejects.toMatchObject({status:409});
 });
 it('releases pending assignments on departure and retains completed history',async()=>{
   const id=await task({assigneeId:'u2',frequency:'daily'});await completeSharedTask('u2',household,occurrence(id));
   const tomorrow=new Date(Date.parse(today)+86400000).toISOString().slice(0,10);
   await assignSharedTask('u1',household,{taskId:id,dueDate:tomorrow,assigneeId:'u2'});
   await removeMember('u1',household,'u2');
   const board=await workBoard('u1',household,today);
   expect(board.tasks.find(t=>t.dueDate===tomorrow)?.assigneeId).toBeNull();
   expect(board.tasks.find(t=>t.dueDate===today)?.completedBy).toBe('u2');
   await expect(completeSharedTask('u2',household,occurrence(id))).rejects.toMatchObject({status:404});
 });
 it('applies unassigned claims atomically and allows timezone configuration only before tasks',async()=>{
   await sharedTimezone('u1',household,'America/Lima');await task();
   await expect(sharedTimezone('u1',household,'UTC')).rejects.toMatchObject({status:409});
   const board=await workBoard('u1',household,today),o=board.tasks[0];
   const claims=await Promise.allSettled(['u1','u2'].map(u=>assignSharedTask(u,household,{...occurrence(o.taskId),claim:true})));
   expect(claims.filter(r=>r.status==='fulfilled')).toHaveLength(1);
 });
});
