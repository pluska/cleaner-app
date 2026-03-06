import { createClient } from "./supabase";
import { Building } from "@/types";

export const fetchUserBuildings = async (userId: string): Promise<Building[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("buildings")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching buildings:", error);
    return [];
  }

  return data as Building[];
};

export const updateBuildingSlot = async (id: string, slotIndex: number) => {
  const supabase = createClient();
  const { error } = await supabase
    .from("buildings")
    .update({ slot_index: slotIndex })
    .eq("id", id);

  if (error) {
    console.error("Error updating building slot:", error);
    throw error;
  }
};

export const createBuilding = async (building: Omit<Building, "id" | "created_at" | "updated_at">) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("buildings")
    .insert(building)
    .select()
    .single();

  if (error) {
    console.error("Error creating building:", error);
    throw error;
  }

  return data as Building;
};
