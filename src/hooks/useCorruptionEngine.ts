import { useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Task, Building } from '@/types';
import { INITIAL_BUILDINGS } from '@/libs/kingdom-utils'; // We can reuse the initial data or fetch from Supabase

// Logic to map standard categories to our 3 buildings
const mapCategoryToBuildingType = (category: string): string => {
  const map: Record<string, string> = {
    bedroom: "TOWER",
    office: "TOWER",
    living_room: "TOWER",
    
    kitchen: "TAVERN",
    dining_room: "TAVERN",
    
    bathroom: "WELL",
    laundry: "WELL",
    general: "WELL",
    exterior: "WELL"
  };
  return map[category] || "WELL";
};

export const useCorruptionEngine = (tasks: Task[]) => {
  const buildings = useGameStore(state => state.buildings);
  const setBuildings = useGameStore(state => state.setBuildings);
  // updateCorruption is not used in the effect directly anymore (we use setBuildings), but if we needed it:
  // const updateCorruption = useGameStore(state => state.updateCorruption);

  // We initialize the store if empty
  useEffect(() => {
    console.log("CorruptionEngine Check:", { buildingsCount: buildings.length });
    if (buildings.length === 0) {
      console.log("CorruptionEngine: Seeding Initial Buildings");
      // In a real app, this would fetch from Supabase 'buildings' table
      // For now, we seed with our CONSTANTS
      setBuildings(INITIAL_BUILDINGS as Building[]);
    }
  }, [buildings.length, setBuildings]);

  // Calculate corruption whenever tasks change
  useEffect(() => {
    if (buildings.length === 0) return;

    // 1. Calculate corruption counts per type
    const corruptionCounts: Record<string, number> = {
      TOWER: 0,
      TAVERN: 0,
      WELL: 0,
    };

    tasks.forEach((task) => {
      if (!task.completed) {
        const type = mapCategoryToBuildingType(task.category);
        corruptionCounts[type] = (corruptionCounts[type] || 0) + 1;
      }
    });

    // 2. Update store
    // We batch updates or just check diffs to avoid infinite loops if we were triggering renders too often
    // But since `updateCorruption` sets state, we should be careful.
    // Instead of calling updateCorruption N times, let's calculate new state and set it once if improved.
    
    const newBuildings = buildings.map(b => {
       const count = corruptionCounts[b.type] || 0;
       const newCorruption = Math.min(count * 20, 100); // 20% per task
       
       if (b.corruption_level !== newCorruption) {
         return { ...b, corruption_level: newCorruption };
       }
       return b;
    });

    // Only update if changed
    const hasChanged = newBuildings.some((nb, i) => nb.corruption_level !== buildings[i].corruption_level);
    
    if (hasChanged) {
      setBuildings(newBuildings);
    }

  }, [tasks, buildings, setBuildings]);

  return { buildings };
};
