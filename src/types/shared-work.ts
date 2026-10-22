export interface SharedRoom {id:string;name:string;kind:string}
export interface WorkMember {userId:string;name:string;dailyMinutes:number;days:number;resting:number}
export interface SharedOccurrence {
  taskId:string;title:string;description:string|null;roomId:string;room:string;minutes:number;dueDate:string;
  assigneeId:string|null;completedAt:number|null;completedBy:string|null;completedName:string|null;
}
export interface SharedRequest {id:string;taskId:string;dueDate:string;fromUserId:string;toUserId:string;expiresAt:number}
export interface WorkBoard {
  householdId:string;name:string;role:'owner'|'member';timezone:string;version:number;resources:number;hasTasks:number;today:string;start:string;end:string;
  rooms:SharedRoom[];members:WorkMember[];tasks:SharedOccurrence[];requests:SharedRequest[];
}
export interface WorkAssignment {taskId:string;dueDate:string;assigneeId:string}
export interface WorkProposal {version:number;start:string;signature:string;assignments:WorkAssignment[];unassigned:number}
