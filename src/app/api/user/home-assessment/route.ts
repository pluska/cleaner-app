import { auth } from '@/auth';
import { db } from '@/db';
import { homeAssessments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { assessmentSchema } from '@/libs/ai/schemas';
import { errorResponse, readJson, HttpError } from '@/libs/server/http';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new HttpError(401, 'Unauthorized');
    const [assessment] = await db.select().from(homeAssessments).where(eq(homeAssessments.userId, session.user.id));
    return Response.json({assessment: assessment ?? null});
  } catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new HttpError(401, 'Unauthorized');
    const parsed = assessmentSchema.safeParse(await readJson(request));
    if (!parsed.success) throw new HttpError(400, 'Invalid home assessment');
    const input = parsed.data;
    const values = {
      homeType: input.home_type, lifestyle: input.lifestyle,
      cleaningPreferences: {minimal:1, standard:2, thorough:3}[input.cleaning_preferences],
      pets: JSON.stringify(input.pets), children: JSON.stringify(input.children), allergies: JSON.stringify(input.allergies),
      rooms: input.rooms, updatedAt: new Date().toISOString(),
    };
    const [assessment] = await db.insert(homeAssessments).values({userId: session.user.id, ...values})
      .onConflictDoUpdate({target: homeAssessments.userId, set: values}).returning();
    return Response.json({assessment}, {status:201});
  } catch (error) { return errorResponse(error); }
}
