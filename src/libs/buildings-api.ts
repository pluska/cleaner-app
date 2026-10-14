import "server-only";
import { auth } from "@/auth";
import { HttpError } from "@/libs/server/http";
import { db } from "@/db";
import { buildings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Building } from "@/types";

async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) throw new HttpError(401, 'Unauthorized');
  return session.user.id;
}

export const fetchUserBuildings = async (userId: string): Promise<Building[]> => {
  if (await currentUser() !== userId) throw new HttpError(404,'Buildings not found');
  const result = await db
    .select()
    .from(buildings)
    .where(eq(buildings.userId, userId));

  return result.map(b => ({
    id: b.id,
    user_id: b.userId,
    type: b.type as Building["type"],
    name: b.name,
    level: b.level,
    slot_index: b.slotIndex,
    corruption_level: b.corruptionLevel,
    created_at: b.createdAt.toISOString(),
    updated_at: b.updatedAt.toISOString(),
  }));
};

export const updateBuildingSlot = async (id: string, slotIndex: number) => {
  const userId = await currentUser();
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex > 11) throw new HttpError(400,'Invalid slot');
  await db
    .update(buildings)
    .set({ 
      slotIndex,
      updatedAt: new Date()
    })
    .where(and(eq(buildings.id, id),eq(buildings.userId,userId)));
};

export const createBuilding = async (building: Omit<Building, "id" | "created_at" | "updated_at">) => {
  if (await currentUser() !== building.user_id) throw new HttpError(404,'Buildings not found');
  const [newBuilding] = await db
    .insert(buildings)
    .values({
      userId: building.user_id,
      type: building.type,
      name: building.name,
      level: building.level,
      slotIndex: building.slot_index,
      corruptionLevel: building.corruption_level,
    })
    .returning();

  return {
    id: newBuilding.id,
    user_id: newBuilding.userId,
    type: newBuilding.type as Building["type"],
    name: newBuilding.name,
    level: newBuilding.level,
    slot_index: newBuilding.slotIndex,
    corruption_level: newBuilding.corruptionLevel,
    created_at: newBuilding.createdAt.toISOString(),
    updated_at: newBuilding.updatedAt.toISOString(),
  } as Building;
};
