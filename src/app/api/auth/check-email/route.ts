import { readJson, errorResponse } from '@/libs/server/http';
import { normalizeEmail, throttleAuth } from '@/libs/server/security';

export async function POST(request: Request) {
  try {
    const body = await readJson(request, 4096);
    const email = normalizeEmail(body.email);
    await throttleAuth(request, 'email-check', email);
    return Response.json({ message: 'Continue with signup or sign in. Use password recovery if needed.' });
  } catch (error) { return errorResponse(error); }
}
