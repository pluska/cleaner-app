import { db } from "@/db";
import { buildings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Building } from "@/types";

export const fetchUserBuildings = async (userId: string): Promise<Building[]> => {
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
  await db
    .update(buildings)
    .set({ 
      slotIndex,
      updatedAt: new Date()
    })
    .where(eq(buildings.id, id));
};

export const createBuilding = async (building: Omit<Building, "id" | "created_at" | "updated_at">) => {
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
