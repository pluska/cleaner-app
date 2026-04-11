"use client";

import React, { useState } from 'react';
import { saveKingdomPlacements } from '@/app/actions/kingdom';

// --- Types ---
export interface Item {
  id: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  imageUrl?: string;
  color?: string; // Fallback for mock ui
}

export interface Placement {
  id: string;
  itemId: string;
  positionX: number;
  positionY: number;
}

export interface GridCell {
  x: number;
  y: number;
}

// --- Mock Data Generators ---
const generateMockItems = (): Item[] => [
  { id: 'i1', name: 'Golden Trophy', rarity: 'legendary', color: 'bg-yellow-400' },
  { id: 'i2', name: 'Magic Broom', rarity: 'epic', color: 'bg-purple-500' },
  { id: 'i3', name: 'Crystal Vase', rarity: 'rare', color: 'bg-blue-300' },
  { id: 'i4', name: 'Cozy Rug', rarity: 'common', color: 'bg-orange-300' },
  { id: 'i5', name: 'Oak Bookshelf', rarity: 'rare', color: 'bg-amber-700' },
];

const generateMockPlacements = (): Placement[] => [
  { id: 'p1', itemId: 'i1', positionX: 4, positionY: 4 },
  { id: 'p2', itemId: 'i4', positionX: 2, positionY: 2 },
];

export default function KingdomCanvas() {
  const [items] = useState<Item[]>(generateMockItems());
  const [placements, setPlacements] = useState<Placement[]>(generateMockPlacements());
  
  // 10x10 Grid
  const gridWidth = 10;
  const gridHeight = 10;
  
  const [draggedPlacementId, setDraggedPlacementId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // When dragging from inventory
  const handleDragStartItem = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('text/plain', itemId);
    setDraggedPlacementId(null);
  };

  // When dragging an already placed item
  const handleDragStartPlacement = (e: React.DragEvent, placementId: string, itemId: string) => {
    e.dataTransfer.setData('text/plain', itemId);
    setDraggedPlacementId(placementId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow native dropping
  };

  const handleDrop = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    
    if (!itemId) return;

    if (draggedPlacementId) {
      // Move existing placement
      setPlacements(prev => 
        prev.map(p => p.id === draggedPlacementId ? { ...p, positionX: x, positionY: y } : p)
      );
    } else {
      // Create new placement
      const newPlacement: Placement = {
        id: `p-${Date.now()}`,
        itemId,
        positionX: x,
        positionY: y
      };
      setPlacements(prev => [...prev, newPlacement]);
    }
    
    setHasUnsavedChanges(true);
    setDraggedPlacementId(null);
  };

  const handleSave = async () => {
    const saveBtn = document.getElementById('save-kingdom-btn');
    const originalText = saveBtn?.innerText || "Save Layout";
    if (saveBtn) saveBtn.innerText = "Saving...";

    try {
      const placementsToSave = placements.map(p => ({
        itemId: p.itemId,
        positionX: p.positionX,
        positionY: p.positionY,
      }));
      
      const result = await saveKingdomPlacements(placementsToSave);
      
      if (result.success) {
        setHasUnsavedChanges(false);
        if (saveBtn) saveBtn.innerText = "Saved!";
      } else {
        if (saveBtn) saveBtn.innerText = "Error Saving";
      }
    } catch (error) {
      console.error(error);
      if (saveBtn) saveBtn.innerText = "Error Saving";
    } finally {
      setTimeout(() => {
        if (saveBtn) saveBtn.innerText = originalText;
      }, 2000);
    }
  };

  const getPlacementAt = (x: number, y: number) => {
    return placements.find(p => p.positionX === x && p.positionY === y);
  };

  const getItemDetails = (itemId: string) => {
    return items.find(i => i.id === itemId);
  };

  const rarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400';
      case 'epic': return 'text-purple-400';
      case 'rare': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[80vh] bg-neutral-900 rounded-2xl border border-neutral-800 text-white p-6 gap-6 shadow-2xl">
      
      {/* Sidebar: Inventory */}
      <div className="w-full md:w-80 bg-neutral-800 rounded-xl p-4 shadow-lg flex flex-col border border-neutral-700/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
            My Kingdom
          </h2>
          <button 
            id="save-kingdom-btn"
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              hasUnsavedChanges 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                : 'bg-neutral-700 text-neutral-400 cursor-not-allowed hidden md:block'
            }`}
          >
            Save Layout
          </button>
        </div>

        <div className="pt-2 border-t border-neutral-700/50 mb-4">
          <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-3">Inventory</h3>
          <p className="text-xs text-neutral-500 mb-4">Drag items into the grid to place them.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 custom-scrollbar pb-4 max-h-[500px]">
          {items.map(item => (
            <div 
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStartItem(e, item.id)}
              className="bg-neutral-800 shadow-md p-3 rounded-xl border border-neutral-700 cursor-grab active:cursor-grabbing hover:bg-neutral-700/80 hover:border-neutral-500 transition-all group flex flex-col items-center gap-2"
            >
              <div className={`w-12 h-12 rounded-lg shadow-inner flex items-center justify-center ${item.color || 'bg-gray-500'} transition-transform group-hover:scale-110`}>
                <span className="text-white/80 font-bold text-xs">ICON</span>
              </div>
              <div className="text-center w-full">
                <p className="text-sm font-medium truncate text-neutral-200">{item.name}</p>
                <p className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${rarityColor(item.rarity)}`}>
                  {item.rarity}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area: Grid Canvas */}
      <div className="flex-1 bg-neutral-800 rounded-xl flex flex-col items-center justify-center p-6 border border-neutral-700/50 shadow-inner overflow-hidden relative">
        <h3 className="absolute top-4 left-6 text-sm font-bold text-neutral-500 uppercase tracking-widest">Map Canvas</h3>
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
        
        {/* The Interactive Grid */}
        <div className="relative mt-8 group perspective-1000">
          <div 
            className="grid bg-neutral-900/80 border-2 border-neutral-700/80 rounded-xl shadow-2xl p-2 md:p-4 backdrop-blur-sm transition-transform duration-700"
            style={{
              gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridHeight}, minmax(0, 1fr))`,
              gap: '4px',
              width: 'min(100%, 600px)',
              aspectRatio: '1 / 1',
              transform: 'rotateX(60deg) rotateZ(45deg)',
              transformStyle: 'preserve-3d',
              boxShadow: '-20px 30px 40px rgba(0,0,0,0.6)'
            }}
          >
            {Array.from({ length: gridHeight * gridWidth }).map((_, index) => {
              const x = index % gridWidth;
              const y = Math.floor(index / gridWidth);
              const placement = getPlacementAt(x, y);
              const itemDef = placement ? getItemDetails(placement.itemId) : null;
              
              return (
                <div 
                  key={`${x}-${y}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, x, y)}
                  className={`w-full h-full rounded-md border border-dashed border-neutral-700/40 transition-colors duration-200 
                    flex items-center justify-center relative
                    ${placement ? 'bg-transparent border-transparent' : 'hover:bg-neutral-700/40 hover:border-neutral-500/50'}
                  `}
                >
                  {placement && itemDef && (
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStartPlacement(e, placement.id, placement.itemId)}
                      className={`absolute inset-0 m-0.5 md:m-1 rounded-md shadow-2xl cursor-grab active:cursor-grabbing hover:z-20 transition-all ${itemDef.color || 'bg-gray-500'} border border-white/10 pointer-events-auto`}
                      title={itemDef.name}
                      style={{ 
                        transform: 'rotateZ(-45deg) rotateX(-60deg) scale(1.4) translateY(-10px)', 
                        transformOrigin: 'bottom center',
                      }}
                    >
                      <div className="w-full h-full flex flex-col items-center justify-center pointer-events-none select-none">
                        <span className="text-white/80 text-[10px] md:text-sm font-black drop-shadow-lg">
                          {itemDef.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Save Button */}
        {hasUnsavedChanges && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center md:hidden animate-in fade-in slide-in-from-bottom-4">
             <button 
              onClick={handleSave}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-[0_4px_20px_rgba(37,99,235,0.6)]"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
