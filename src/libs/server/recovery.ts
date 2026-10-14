import { database } from '@/db';
import { serverEnv } from './env';
import { digest } from './security';
import { HttpError } from './http';

export function recoveryConfig() {
  const key = serverEnv('RESEND_API_KEY'), from = serverEnv('RESEND_FROM'), site = serverEnv('SITE_URL');
  let url: URL;
  try { url = new URL(site || ''); } catch { throw new HttpError(503, 'Password recovery is temporarily unavailable'); }
  if (!key || !from || serverEnv('RESEND_SENDER_VERIFIED') !== 'true' || url.protocol !== 'https:' || url.username || url.password) {
    throw new HttpError(503, 'Password recovery is temporarily unavailable');
  }
  return { key, from, origin: url.origin };
}
export async function sendResetEmail(email: string) {
  const config = recoveryConfig();
  const d = database();
  const user = await d.prepare('SELECT id FROM users WHERE lower(email)=?').bind(email).first<{id:string}>();
  if (!user) return;
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2,'0')).join('');
  const tokenHash = await digest(token);
  await d.prepare('INSERT INTO passwordResetTokens(tokenHash,userId,expires) VALUES(?,?,?)').bind(tokenHash,user.id,Date.now()+3_600_000).run();
  const url = `${config.origin}/auth/reset-password?token=${token}`;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(10_000),
      headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json', 'Idempotency-Key': tokenHash },
      body: JSON.stringify({ from: config.from, to: [email], subject: 'Reset your Cleaner Planner password', text: `Reset your password using this link (valid for one hour):\n${url}\n\nIf you did not request this, ignore this email.` }),
    });
    if (!response.ok) throw new Error('Delivery failed');
  } catch {
    await d.prepare('DELETE FROM passwordResetTokens WHERE tokenHash=?').bind(tokenHash).run();
    // Keep the public response identical for existing and nonexistent accounts.
    console.error(JSON.stringify({ event: 'reset_delivery_failed' }));
  }
}
export async function redeemResetToken(token: string, hash: string) {
  const result = await database().prepare(`UPDATE users SET hashedPassword=? WHERE id=(
    SELECT userId FROM passwordResetTokens WHERE tokenHash=? AND expires>?
  ) RETURNING id`).bind(hash,await digest(token),Date.now()).first();
  // The migration trigger consumes ALL reset tokens and increments sessionVersion in this statement.
  if (!result) throw new HttpError(400, 'Invalid or expired token');
}
