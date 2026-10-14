import { readJson, errorResponse } from '@/libs/server/http';
import { normalizeEmail, throttleAuth } from '@/libs/server/security';
import { sendResetEmail } from '@/libs/server/recovery';

export async function POST(request: Request) {
  try {
    const body = await readJson(request, 4096);
    const email = normalizeEmail(body.email);
    await throttleAuth(request, 'recovery', email);
    await sendResetEmail(email);
    return Response.json({ message: 'If an account with that email exists, a password reset link has been requested.' });
  } catch (error) { return errorResponse(error); }
}
