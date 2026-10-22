import type { HouseholdList } from '@/types/household';

export async function householdApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response=await fetch(`/api/households${path}`,{...options,headers:{'Content-Type':'application/json',...options.headers},cache:'no-store'});
  const data=await response.json();
  if (!response.ok) throw new Error(data.error || 'household_request_failed');
  return data as T;
}
export const emptyHouseholds: HouseholdList = {households:[],activeHouseholdId:null};
export function householdError(error: unknown, es: boolean) {
  const code=error instanceof Error ? error.message : '';
  const workErrors:Record<string,[string,string]>={
    stale_plan:['El hogar cambió. Actualiza la agenda y genera una nueva propuesta antes de publicarla.','The household changed. Refresh the schedule and generate a new proposal before publishing.'],
    stale_handoff:['Esta solicitud venció o la tarea cambió. Actualiza la agenda.','This request expired or the task changed. Refresh the schedule.'],
    future_completion:['Podrás completar esta misión a partir de su fecha.','You can complete this task on or after its scheduled date.'],
    completion_not_allowed:['La tarea ya se completó o pertenece a otro camarada. Actualiza la agenda.','The task was completed or belongs to another member. Refresh the schedule.'],
    timezone_locked:['La zona horaria se conserva después de crear la primera tarea.','The timezone is kept after the first task is created.'],
    invalid_timezone:['Usa una zona horaria válida, por ejemplo America/Lima.','Use a valid timezone, for example America/Lima.'],
    plan_too_large:['La propuesta supera 80 asignaciones. Asigna algunas tareas manualmente antes de volver a repartir.','The proposal exceeds 80 assignments. Assign some tasks manually before allocating again.'],
    work_not_allowed:['La tarea o tus permisos cambiaron, o se alcanzó el límite del hogar. Actualiza la agenda.','The task or your permissions changed, or a household limit was reached. Refresh the schedule.'],
  };
  if(workErrors[code])return workErrors[code][es?0:1];
  if (code==='invitation_unavailable') return es ? 'El enlace venció, fue cancelado o pertenece a otro correo. Usa la cuenta invitada o pide una nueva invitación.' : 'This link expired, was cancelled, or belongs to another email. Use the invited account or request a new invitation.';
  if (code==='member_removal_not_allowed') return es ? 'No se pudo retirar al camarada. El administrador debe transferir el hogar antes de salir.' : 'Could not remove this member. The owner must transfer the household before leaving.';
  if (code==='household_not_found') return es ? 'Ya no tienes acceso a este hogar. Actualiza tus hogares.' : 'You no longer have access to this household. Refresh your households.';
  if (code==='household_limit') return es ? 'Puedes crear hogares mientras pertenezcas a menos de 10.' : 'You can create households while you belong to fewer than 10.';
  if (code==='invite_not_allowed') return es ? 'Solo el administrador puede invitar. El hogar admite hasta 20 invitaciones pendientes.' : 'Only the owner can invite. A household can have up to 20 pending invitations.';
  return es ? 'No se pudo guardar el cambio. Actualiza la página e intenta de nuevo.' : 'Could not save this change. Refresh the page and try again.';
}
