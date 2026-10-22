import 'server-only';
import { database } from '@/db';
import { HttpError, textField } from '@/libs/server/http';
import { integerField } from '@/libs/server/task-validation';
import { validDay, localDay } from '@/libs/kingdom-rules';
import { scheduledDays, scheduledOn, calendarDate } from '@/libs/task-schedule';
import { digest } from '@/libs/server/security';
import { userTimezone } from '@/services/rescheduleService';
import { allocateSharedWork } from '@/libs/shared-allocation';
import type { SharedOccurrence, SharedRequest, SharedRoom, WorkBoard, WorkMember, WorkProposal } from '@/types/shared-work';

const memberGuard='EXISTS(SELECT 1 FROM householdMembers m WHERE m.householdId=? AND m.userId=?)';
const ownerGuard='EXISTS(SELECT 1 FROM households h WHERE h.id=? AND h.ownerId=?)';
interface Template {id:string;householdId:string;roomId:string;room:string;title:string;description:string|null;minutes:number;rrule:string;startDate:number;endDate:number|null;assigneeId:string|null;archived:number}
interface Meta {householdId:string;name:string;ownerId:string;timezone:string;version:number;resources:number;hasTasks:number}
function day(value:unknown){if(!validDay(value))throw new HttpError(400,'invalid_day');return value;}
function member(value:unknown){return value===null||value===''?null:textField(value,'assignee',128);}
function changed(result:{results:unknown[]},code='work_not_allowed'){if(!result.results.length)throw new HttpError(409,code);}

export async function workBoard(userId:string,householdId:string,first?:string):Promise<WorkBoard>{
  const d=database();
  const initial=await d.prepare(`SELECT s.timezone FROM householdWorkState s WHERE s.householdId=? AND ${memberGuard}`).bind(householdId,householdId,userId).first<{timezone:string}>();
  if(!initial)throw new HttpError(404,'household_not_found');
  const start=first===undefined?localDay(new Date(),initial.timezone):day(first),end=new Date(Date.parse(start)+6*86400000).toISOString().slice(0,10);
  const scope=[householdId,householdId,userId];
  const result=await d.batch([
    d.prepare(`SELECT h.id householdId,h.name,h.ownerId,s.timezone,s.version,s.resources,EXISTS(SELECT 1 FROM householdTasks t WHERE t.householdId=h.id) hasTasks FROM households h JOIN householdWorkState s ON s.householdId=h.id WHERE h.id=? AND ${memberGuard}`).bind(...scope),
    d.prepare(`SELECT id,name,kind FROM householdRooms WHERE householdId=? AND ${memberGuard} ORDER BY name`).bind(...scope),
    d.prepare(`SELECT t.*,r.name room FROM householdTasks t JOIN householdRooms r ON r.id=t.roomId WHERE t.householdId=? AND ${memberGuard} AND (t.archived=0 OR EXISTS(SELECT 1 FROM householdCompletions c WHERE c.taskId=t.id AND c.dueDate BETWEEN ? AND ?)) ORDER BY t.createdAt,t.id`).bind(...scope,start,end),
    d.prepare(`SELECT o.*,c.userId completedBy,c.name completedName FROM householdOccurrences o LEFT JOIN householdCompletions c ON c.taskId=o.taskId AND c.dueDate=o.dueDate WHERE o.householdId=? AND ${memberGuard} AND o.dueDate BETWEEN ? AND ?`).bind(...scope,start,end),
    d.prepare(`SELECT m.userId,coalesce(u.name,u.email,'Camarada') name,coalesce(a.dailyMinutes,0) dailyMinutes,coalesce(a.days,127) days,coalesce(a.resting,0) resting FROM householdMembers m JOIN users u ON u.id=m.userId LEFT JOIN householdAvailability a ON a.householdId=m.householdId AND a.userId=m.userId WHERE m.householdId=? AND ${memberGuard} ORDER BY m.userId`).bind(...scope),
    d.prepare(`SELECT id,taskId,dueDate,fromUserId,toUserId,expiresAt FROM householdTaskRequests WHERE householdId=? AND ${memberGuard} AND status='pending' AND expiresAt>? AND dueDate BETWEEN ? AND ?`).bind(...scope,Date.now(),start,end),
  ]);
  const meta=result[0].results[0] as unknown as Meta|undefined;if(!meta)throw new HttpError(404,'household_not_found');
  const instances=result[3].results as unknown as (SharedOccurrence&{taskId:string})[],map=new Map(instances.map(o=>[`${o.taskId}:${o.dueDate}`,o]));
  const tasks:SharedOccurrence[]=[];
  for(const t of result[2].results as unknown as Template[]){
    const scheduled=t.archived?new Set<string>():scheduledDays(t,start,end,meta.timezone);
    for(let value=Date.parse(start);value<=Date.parse(end);value+=86400000){
      const dueDate=new Date(value).toISOString().slice(0,10),o=map.get(`${t.id}:${dueDate}`);
      if(!scheduled.has(dueDate)&&!o?.completedAt)continue;
      tasks.push({taskId:t.id,title:t.title,description:t.description,roomId:t.roomId,room:t.room,minutes:t.minutes,dueDate,assigneeId:o?o.assigneeId:t.assigneeId,completedAt:o?.completedAt??null,completedBy:o?.completedBy??null,completedName:o?.completedName??null});
    }
  }
  tasks.sort((a,b)=>a.dueDate.localeCompare(b.dueDate)||a.title.localeCompare(b.title));
  return {...meta,role:meta.ownerId===userId?'owner':'member',today:localDay(new Date(),meta.timezone),start,end,rooms:result[1].results as unknown as SharedRoom[],members:result[4].results as unknown as WorkMember[],tasks,requests:result[5].results as unknown as SharedRequest[]};
}
async function taskForDay(userId:string,householdId:string,taskId:unknown,date:unknown){
  const id=textField(taskId,'taskId',128),dueDate=day(date),d=database();
  const task=await d.prepare(`SELECT t.*,r.name room,s.timezone FROM householdTasks t JOIN householdRooms r ON r.id=t.roomId JOIN householdWorkState s ON s.householdId=t.householdId WHERE t.id=? AND t.householdId=? AND t.archived=0 AND ${memberGuard}`).bind(id,householdId,householdId,userId).first<Template&{timezone:string}>();
  if(!task)throw new HttpError(404,'work_not_found');
  if(!scheduledOn(task,dueDate,task.timezone))throw new HttpError(400,'not_scheduled');
  return {task,dueDate};
}
export async function addSharedRoom(userId:string,householdId:string,body:Record<string,unknown>){
  const id=crypto.randomUUID(),name=textField(body.name,'room_name',80),kind=body.kind??'general';
  if(!['kitchen','bathroom','bedroom','living_room','laundry','general'].includes(String(kind)))throw new HttpError(400,'invalid_room');
  const result=await database().prepare(`INSERT INTO householdRooms(id,householdId,name,kind) SELECT ?,?,?,? WHERE ${ownerGuard} AND (SELECT count(*) FROM householdRooms WHERE householdId=?)<30 ON CONFLICT(householdId,name) DO UPDATE SET name=excluded.name RETURNING id`).bind(id,householdId,name,kind,householdId,userId,householdId).all();changed(result);return result.results[0];
}
export async function addSharedTask(userId:string,householdId:string,body:Record<string,unknown>){
  const board=await workBoard(userId,householdId),id=crypto.randomUUID(),title=textField(body.title,'title',200),roomId=textField(body.roomId,'roomId',128);
  const minutes=integerField(body.minutes,'minutes',1,120),start=day(body.startDate),frequency=body.frequency??'once',assigneeId=member(body.assigneeId??null);
  const rule={once:'FREQ=DAILY;COUNT=1',daily:'FREQ=DAILY',weekly:'FREQ=WEEKLY',monthly:'FREQ=MONTHLY',yearly:'FREQ=YEARLY'}[String(frequency)];
  if(!rule||!board.rooms.some(r=>r.id===roomId)||assigneeId&&!board.members.some(m=>m.userId===assigneeId))throw new HttpError(400,'invalid_task');
  const result=await database().prepare(`INSERT INTO householdTasks(id,householdId,roomId,title,description,minutes,rrule,startDate,assigneeId,createdAt)
    SELECT ?,?,?,?,?,?,?,?,?,? WHERE ${ownerGuard} AND (SELECT count(*) FROM householdTasks WHERE householdId=? AND archived=0)<100 RETURNING id`).bind(id,householdId,roomId,title,body.description?textField(body.description,'description',2000):null,minutes,rule,calendarDate(start,board.timezone).getTime(),assigneeId,Date.now(),householdId,userId,householdId).all();changed(result);return {id};
}
export async function saveAvailability(userId:string,householdId:string,body:Record<string,unknown>){
  const days=integerField(body.days,'days',0,127),minutes=integerField(body.dailyMinutes,'dailyMinutes',0,240);
  if(typeof body.resting!=='boolean')throw new HttpError(400,'invalid_rest');
  const result=await database().prepare(`INSERT INTO householdAvailability(householdId,userId,days,dailyMinutes,resting) SELECT ?,?,?,?,? WHERE ${memberGuard}
    ON CONFLICT(householdId,userId) DO UPDATE SET days=excluded.days,dailyMinutes=excluded.dailyMinutes,resting=excluded.resting RETURNING userId`).bind(householdId,userId,days,minutes,Number(body.resting),householdId,userId).all();changed(result);
}
export async function assignSharedTask(userId:string,householdId:string,body:Record<string,unknown>){
  const {task,dueDate}=await taskForDay(userId,householdId,body.taskId,body.dueDate),d=database();
  const assigneeId=body.claim===true?userId:member(body.assigneeId);
  const guard=body.claim===true?`NOT EXISTS(SELECT 1 FROM householdOccurrences o WHERE o.taskId=t.id AND o.dueDate=? AND o.assigneeId IS NOT NULL) AND (EXISTS(SELECT 1 FROM householdOccurrences o WHERE o.taskId=t.id AND o.dueDate=?) OR t.assigneeId IS NULL)` :ownerGuard;
  const guardValues=body.claim===true?[dueDate,dueDate]:[householdId,userId];
  const result=await d.prepare(`INSERT INTO householdOccurrences(taskId,householdId,dueDate,assigneeId) SELECT t.id,t.householdId,?,? FROM householdTasks t WHERE t.id=? AND t.householdId=? AND t.archived=0 AND ${memberGuard}
    AND (? IS NULL OR EXISTS(SELECT 1 FROM householdMembers WHERE householdId=? AND userId=?)) AND ${guard}
    AND NOT EXISTS(SELECT 1 FROM householdOccurrences WHERE taskId=t.id AND dueDate=? AND completedAt IS NOT NULL)
    ON CONFLICT(taskId,dueDate) DO UPDATE SET assigneeId=excluded.assigneeId WHERE completedAt IS NULL RETURNING taskId`).bind(dueDate,assigneeId,task.id,householdId,householdId,userId,assigneeId,householdId,assigneeId,...guardValues,dueDate).all();changed(result);
}
export async function completeSharedTask(userId:string,householdId:string,body:Record<string,unknown>){
  const {task,dueDate}=await taskForDay(userId,householdId,body.taskId,body.dueDate),d=database(),today=localDay(new Date(),task.timezone);
  if(dueDate>today)throw new HttpError(400,'future_completion');
  const xp=Math.min(30,Math.max(5,Math.ceil(task.minutes/5)*5)),coins=Math.max(1,Math.floor(xp/5));
  const activityDate=localDay(new Date(),await userTimezone(userId));
  await d.prepare(`INSERT INTO householdCompletions(taskId,householdId,dueDate,userId,name,title,minutes,xp,coins,activityDate,createdAt)
    SELECT t.id,t.householdId,?,?,coalesce(u.name,u.email,'Camarada'),t.title,t.minutes,?,?,?,? FROM householdTasks t JOIN users u ON u.id=?
    LEFT JOIN householdOccurrences o ON o.taskId=t.id AND o.dueDate=? WHERE t.id=? AND t.householdId=? AND t.archived=0 AND ${memberGuard}
    AND o.completedAt IS NULL AND (CASE WHEN o.taskId IS NOT NULL THEN o.assigneeId ELSE t.assigneeId END IS NULL OR CASE WHEN o.taskId IS NOT NULL THEN o.assigneeId ELSE t.assigneeId END=?)
    AND NOT EXISTS(SELECT 1 FROM householdCompletions WHERE taskId=t.id AND dueDate=?)`).bind(dueDate,userId,xp,coins,activityDate,Date.now(),userId,dueDate,task.id,householdId,householdId,userId,userId,dueDate).run();
  const result=await d.prepare('SELECT userId,xp,coins FROM householdCompletions WHERE taskId=? AND dueDate=?').bind(task.id,dueDate).first<{userId:string;xp:number;coins:number}>();
  if(result?.userId!==userId)throw new HttpError(409,'completion_not_allowed');
  return {completed:true,xp:result.xp,coins:result.coins};
}
export async function sharedProposal(userId:string,householdId:string,body:Record<string,unknown>,apply=false):Promise<WorkProposal>{
  const board=await workBoard(userId,householdId,day(body.start));if(board.role!=='owner')throw new HttpError(403,'owner_required');
  const plan=allocateSharedWork(board.tasks,board.members,board.today),signature=await digest(JSON.stringify(plan));
  if(plan.assignments.length>80)throw new HttpError(422,'plan_too_large');
  if(apply){
    if(body.version!==board.version||body.signature!==signature)throw new HttpError(409,'stale_plan');
    const d=database(),claim=crypto.randomUUID();
    const results=await d.batch([
      d.prepare(`UPDATE householdWorkState SET planToken=?,version=version+1 WHERE householdId=? AND version=? AND ${ownerGuard} RETURNING version`).bind(claim,householdId,board.version,householdId,userId),
      ...plan.assignments.map(a=>d.prepare(`INSERT INTO householdOccurrences(taskId,householdId,dueDate,assigneeId) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM householdWorkState WHERE householdId=? AND planToken=?) ON CONFLICT(taskId,dueDate) DO UPDATE SET assigneeId=excluded.assigneeId WHERE completedAt IS NULL`).bind(a.taskId,householdId,a.dueDate,a.assigneeId,householdId,claim)),
      d.prepare('UPDATE householdWorkState SET planToken=NULL WHERE householdId=? AND planToken=?').bind(householdId,claim),
    ]);changed(results[0],'stale_plan');
  }
  return {version:board.version,start:board.start,signature,...plan};
}
export async function requestHandoff(userId:string,householdId:string,body:Record<string,unknown>){
  const {task,dueDate}=await taskForDay(userId,householdId,body.taskId,body.dueDate),target=textField(body.toUserId,'toUserId',128),d=database(),now=Date.now(),id=crypto.randomUUID();
  if(target===userId)throw new HttpError(400,'invalid_handoff');
  const result=await d.batch([
    d.prepare("UPDATE householdTaskRequests SET status='cancelled' WHERE taskId=? AND dueDate=? AND status='pending' AND expiresAt<=?").bind(task.id,dueDate,now),
    d.prepare(`INSERT INTO householdTaskRequests(id,taskId,householdId,dueDate,fromUserId,toUserId,createdAt,expiresAt)
      SELECT ?,t.id,t.householdId,?,?,?,?,? FROM householdTasks t LEFT JOIN householdOccurrences o ON o.taskId=t.id AND o.dueDate=?
      WHERE t.id=? AND t.householdId=? AND t.archived=0 AND ${memberGuard} AND o.completedAt IS NULL AND CASE WHEN o.taskId IS NOT NULL THEN o.assigneeId ELSE t.assigneeId END=?
      AND EXISTS(SELECT 1 FROM householdMembers WHERE householdId=? AND userId=?) AND NOT EXISTS(SELECT 1 FROM householdTaskRequests WHERE taskId=t.id AND dueDate=? AND status='pending') RETURNING id`).bind(id,dueDate,userId,target,now,now+3*86400000,dueDate,task.id,householdId,householdId,userId,userId,householdId,target,dueDate),
  ]);changed(result[1]);return {id};
}
export async function respondHandoff(userId:string,householdId:string,body:Record<string,unknown>){
  const id=textField(body.requestId,'requestId',128),status=body.response;
  if(!['accepted','declined','cancelled'].includes(String(status)))throw new HttpError(400,'invalid_response');
  const d=database();
  try{const result=await d.prepare(`UPDATE householdTaskRequests SET status=? WHERE id=? AND householdId=? AND status='pending' AND expiresAt>? AND ${memberGuard} AND ${status==='cancelled'?'fromUserId':'toUserId'}=? RETURNING id`).bind(status,id,householdId,Date.now(),householdId,userId,userId).all();changed(result,'stale_handoff');}
  catch(e){if(e instanceof Error&&e.message.includes('stale_handoff'))throw new HttpError(409,'stale_handoff');throw e;}
}
export async function archiveSharedTask(userId:string,householdId:string,body:Record<string,unknown>){
  const result=await database().prepare(`UPDATE householdTasks SET archived=1 WHERE id=? AND householdId=? AND ${ownerGuard} RETURNING id`).bind(textField(body.taskId,'taskId',128),householdId,householdId,userId).all();changed(result);
}
export async function sharedTimezone(userId:string,householdId:string,value:unknown){
  const timezone=textField(value,'timezone',100);try{new Intl.DateTimeFormat('en',{timeZone:timezone}).format();}catch{throw new HttpError(400,'invalid_timezone');}
  const d=database();const result=await d.prepare(`UPDATE householdWorkState SET timezone=?,version=version+1 WHERE householdId=? AND ${ownerGuard} AND NOT EXISTS(SELECT 1 FROM householdTasks WHERE householdId=?) RETURNING version`).bind(timezone,householdId,householdId,userId,householdId).all();changed(result,'timezone_locked');
}
