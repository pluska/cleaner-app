import bcrypt from 'bcryptjs';
import { database } from '@/db';
import { readJson, textField, errorResponse } from '@/libs/server/http';
import { normalizeEmail, validatePassword, throttleAuth } from '@/libs/server/security';

export async function POST(request: Request) {
  try {
    const body = await readJson(request, 4096);
    const email = normalizeEmail(body.email);
    validatePassword(body.password);
    const name = body.name ? textField(body.name, 'name', 100) : email.split('@')[0];
    await throttleAuth(request, 'signup', email);
    const hash = await bcrypt.hash(body.password,10);
    const d = database(), id = crypto.randomUUID();
    await d.batch([
      d.prepare('INSERT INTO users(id,email,name,hashedPassword) SELECT ?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM users WHERE lower(email)=?)').bind(id,email,name,hash,email),
      d.prepare('INSERT INTO userProfiles(userId) SELECT id FROM users WHERE id=?').bind(id),
    ]);
    return Response.json({ message: 'You can now try signing in. If you already have an account, use your existing password or password recovery.' }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
