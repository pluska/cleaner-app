import { HttpError, textField } from './http';
import { validDay } from '@/libs/kingdom-rules';
export function integerField(value: unknown, name: string, min: number, max: number, fallback?: number): number {
  if (value === undefined && fallback !== undefined) return fallback;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) throw new HttpError(400,`Invalid ${name}`);
  return value;
}
export function validateTask(body: Record<string,unknown>) {
  const title = textField(body.title,'title',200), roomId = textField(body.roomId,'roomId',200);
  const frequency = body.frequency ?? 'once';
  if (!['daily','weekly','monthly','yearly','once'].includes(frequency as string)) throw new HttpError(400,'Invalid frequency');
  for (const key of ['startDate','endDate']) if (body[key] !== undefined && !validDay(body[key])) throw new HttpError(400,`Invalid ${key}`);
  if (body.startDate && body.endDate && String(body.endDate)<String(body.startDate)) throw new HttpError(400,'End date precedes start date');
  if (body.dayOfWeek !== undefined) integerField(body.dayOfWeek,'dayOfWeek',0,6);
  return {startDate:body.startDate as string|undefined,endDate:body.endDate as string|undefined,dayOfWeek:body.dayOfWeek as number|undefined,title,roomId,frequency:frequency as string,importanceLevel:integerField(body.importanceLevel,'importanceLevel',1,5,3),description:body.description ? textField(body.description,'description',2000) : null};
}
