"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { userPlacements } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function saveKingdomPlacements(
  placements: { itemId: string; positionX: number; positionY: number }[]
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Delete existing placements for the user's default room (null roomId)
    await db.delete(userPlacements).where(
      and(
        eq(userPlacements.userId, userId), 
        isNull(userPlacements.roomId)
      )
    );

    // Insert new placements
    if (placements.length > 0) {
      const inserts = placements.map(p => ({
        userId,
        itemId: p.itemId,
        positionX: p.positionX,
        positionY: p.positionY,
      }));
      
      await db.insert(userPlacements).values(inserts);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Failed to save placements:", error);
    return { success: false, error: "Failed to save placements" };
  }
}
