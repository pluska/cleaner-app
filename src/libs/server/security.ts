import { database } from '@/db';
import { HttpError } from './http';
import { serverEnv } from './env';

export async function digest(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
export function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string') throw new HttpError(400, 'Invalid email');
  const email = value.normalize('NFKC').trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Invalid email');
  return email;
}
export function validatePassword(value: unknown): asserts value is string {
  if (typeof value !== 'string' || value.length < 8 || new TextEncoder().encode(value).length > 72 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
    throw new HttpError(400, 'Password must contain 8–72 bytes, uppercase, lowercase, and a number');
  }
}
function limit(name: string, fallback: number) {
  const value = Number(serverEnv(name));
  return Number.isInteger(value) && value > 0 ? value : fallback;
}
export async function consumeLimits(buckets: { key: string; ceiling: number; expires: number }[]) {
  const d = database();
  try {
    // CHECK failure rolls back every increment in the D1 batch, including races.
    await d.batch(buckets.map(b => d.prepare(`INSERT INTO usageCounters (key,count,ceiling,expires) VALUES (?,1,?,?)
      ON CONFLICT(key) DO UPDATE SET count=count+1,ceiling=excluded.ceiling`).bind(b.key,b.ceiling,b.expires)));
  } catch (error) {
    if (error instanceof Error && /CHECK constraint failed.*usage_limit/i.test(error.message)) throw new HttpError(429, 'Too many requests. Please try again later.');
    throw new HttpError(503, 'Request limits temporarily unavailable');
  }
  // Expired buckets cannot affect authorization. Cleanup failure must not undo a reservation.
  await d.prepare('DELETE FROM usageCounters WHERE expires < ?').bind(Date.now()).run().catch(() => {});
}
export async function reserveAiUsage(userId: string) {
  const now = Date.now();
  const minute = Math.floor(now / 60_000), day = Math.floor(now / 86_400_000);
  await consumeLimits([
    { key: `ai:${userId}:m:${minute}`, ceiling: limit('AI_USER_MINUTE_LIMIT',10), expires: (minute+1)*60_000 },
    { key: `ai:${userId}:d:${day}`, ceiling: limit('AI_USER_DAY_LIMIT',50), expires: (day+1)*86_400_000 },
    { key: `ai:global:d:${day}`, ceiling: limit('AI_GLOBAL_DAY_LIMIT',200), expires: (day+1)*86_400_000 },
  ]);
}
export async function throttleAuth(request: Request, action: string, identity: string) {
  const now = Date.now(), window = Math.floor(now / 900_000);
  // Only Cloudflare's overwritten connecting-IP header is trusted; never X-Forwarded-For.
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  await consumeLimits([
    { key: `auth:${action}:ip:${await digest(ip)}:${window}`, ceiling: 30, expires: (window+1)*900_000 },
    { key: `auth:${action}:account:${await digest(identity)}:${window}`, ceiling: 5, expires: (window+1)*900_000 },
  ]);
}
