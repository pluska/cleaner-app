import { database } from '@/db';
export async function sessionIsCurrent(userId: unknown, version: unknown): Promise<boolean> {
  if (typeof userId !== 'string' || typeof version !== 'number') return false;
  const user = await database().prepare('SELECT sessionVersion FROM users WHERE id=?').bind(userId).first<{sessionVersion:number}>();
  return !!user && user.sessionVersion === version;
}
