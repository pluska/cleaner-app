import { Task, Building } from "@/types";

export const INITIAL_BUILDINGS: Omit<Building, "user_id" | "created_at">[] = [
  {
    id: "init-tower",
    type: "TOWER",
    name: "Wizard's Keep",
    level: 1,
    slot_index: 0,
    corruption_level: 0,
  },
  {
    id: "init-tavern",
    type: "TAVERN",
    name: "The Merry Tankard",
    level: 1,
    slot_index: 1,
    corruption_level: 0,
  },
  {
    id: "init-well",
    type: "WELL",
    name: "Mystic Well",
    level: 1,
    slot_index: 2,
    corruption_level: 0,
  },
];

export const calculateCorruption = (tasks: Task[], buildings: Building[]): Building[] => {
  // Map categories to building types
  const categoryMap: Record<string, string> = {
    bedroom: "TOWER",
    office: "TOWER",
    living_room: "TOWER",
    
    kitchen: "TAVERN",
    dining_room: "TAVERN",
    
    bathroom: "WELL",
    laundry: "WELL",
    general: "WELL",
  };

  // Count pending tasks per building type
  const corruptionCounts: Record<string, number> = {
    TOWER: 0,
    TAVERN: 0,
    WELL: 0,
  };

  tasks.forEach((task) => {
    if (!task.completed) {
      const type = categoryMap[task.category] || "WELL";
      corruptionCounts[type] = (corruptionCounts[type] || 0) + 1;
    }
  });

  // Update buildings with new corruption levels
  return buildings.map((building) => {
    // 20% corruption per pending task, capped at 100%
    const rawCorruption = (corruptionCounts[building.type] || 0) * 20;
    const corruption = Math.min(rawCorruption, 100);
    
    return {
      ...building,
      corruption_level: corruption,
    };
  });
};
