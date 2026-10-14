import bcrypt from 'bcryptjs';
import { readJson, textField, errorResponse } from '@/libs/server/http';
import { validatePassword, throttleAuth, digest } from '@/libs/server/security';
import { redeemResetToken } from '@/libs/server/recovery';

export async function POST(request: Request) {
  try {
    const { token: rawToken, newPassword } = await readJson(request, 4096);
    const token = textField(rawToken, 'token', 128);
    validatePassword(newPassword);
    await throttleAuth(request, 'reset', await digest(token));
    await redeemResetToken(token, await bcrypt.hash(newPassword, 10));
    return Response.json({ message: 'Password successfully reset' });
  } catch (error) { return errorResponse(error); }
}
