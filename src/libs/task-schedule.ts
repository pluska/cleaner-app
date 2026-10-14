import { rrulestr } from 'rrule';
import { localDay } from './kingdom-rules';

type Schedule = {rrule:string; startDate:Date|number; endDate?:Date|number|null};
export function scheduledDays(template: Schedule, first: string, last: string, timezone = 'UTC') {
  const startDay = localDay(new Date(template.startDate),timezone);
  const endDay = template.endDate == null ? last : localDay(new Date(template.endDate),timezone);
  const lower = first > startDay ? first : startDay;
  const upper = last < endDay ? last : endDay;
  if (lower > upper) return new Set<string>();
  const ruleText = template.rrule.split(/\r?\n/).filter(line => !line.startsWith('DTSTART')).join('\n');
  const dates = rrulestr(ruleText,{dtstart:new Date(`${startDay}T00:00:00Z`)})
    .between(new Date(`${lower}T00:00:00Z`),new Date(Date.parse(upper)+86_400_000-1),true);
  return new Set(dates.map(date=>date.toISOString().slice(0,10)));
}
export function scheduledOn(template: Schedule, day: string, timezone = 'UTC') {
  return scheduledDays(template,day,day,timezone).has(day);
}

// Store a calendar selection on that local day even in UTC+14 / UTC-12.
export function calendarDate(day: string, timezone: string): Date {
  let date = new Date(`${day}T12:00:00Z`);
  const observed = localDay(date,timezone);
  date = new Date(date.getTime() + Date.parse(day) - Date.parse(observed));
  return date;
}
