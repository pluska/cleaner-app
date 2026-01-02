import { create } from 'zustand';
import { Building } from '@/types';

interface GameStore {
  // State
  gold: number;
  gems: number;
  buildings: Building[];
  selectedBuildingId: string | null;
  
  // Actions
  setBuildings: (buildings: Building[]) => void;
  selectBuilding: (id: string | null) => void;
  updateCorruption: (id: string, amount: number) => void;
  addGold: (amount: number) => void;
  addGems: (amount: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gold: 0,
  gems: 0,
  buildings: [], 
  selectedBuildingId: null,

  setBuildings: (buildings) => set({ buildings }),
  selectBuilding: (id) => set({ selectedBuildingId: id }),
  updateCorruption: (id, amount) => set((state) => ({
    buildings: state.buildings.map(b => 
      b.id === id ? { ...b, corruption_level: amount } : b
    )
  })),
  addGold: (amount) => set((state) => ({ gold: state.gold + amount })),
  addGems: (amount) => set((state) => ({ gems: state.gems + amount })),
}));
