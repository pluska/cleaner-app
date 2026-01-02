import { Application, extend } from "@pixi/react";
import { Container, Sprite, Graphics, Text, Assets } from "pixi.js";
import { useState, useEffect } from "react";
import { BuildingNode } from "./BuildingNode"; // New Smart Component
import { useGameStore } from "@/store/gameStore";

// Register Pixi components for intrinsic usage
// Using custom lowercase aliases to avoid ANY conflict
extend({ 
  pixiContainer: Container, 
  pixiSprite: Sprite, 
  pixiGraphics: Graphics, 
  pixiText: Text 
});

const TEXTURE_PATHS = {
  TOWER: "/assets/tower_clean.png",
  TAVERN: "/assets/tavern_clean.png",
  WELL: "/assets/well_clean.png",
};

// Fixed vertical resolution for mobile-first design
const MAP_WIDTH = 390;
const MAP_HEIGHT = 844;

export const MapEngine = () => {
  const { buildings, selectBuilding } = useGameStore();
  // Use fixed dimensions
  const [dimensions] = useState({ width: MAP_WIDTH, height: MAP_HEIGHT });
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  console.log("MapEngine Render:", { buildingsCount: buildings.length, dimensions, assetsLoaded });

  // 1. Preload Assets
  useEffect(() => {
    const loadGameAssets = async () => {
      try {
        console.log("Starting Asset Load...");
        await Assets.load([
          TEXTURE_PATHS.TOWER,
          TEXTURE_PATHS.TAVERN,
          TEXTURE_PATHS.WELL
        ]);
        console.log("Assets Loaded Successfully");
        setAssetsLoaded(true);
      } catch (e) {
        console.error("Failed to load assets:", e);
        // CRITICAL FIX: Proceed anyway so the app doesn't hang.
        setAssetsLoaded(true);
      }
    };
    loadGameAssets();
  }, []);

  const getPosition = (slotIndex: number) => {
    const centerX = dimensions.width / 2;
    const startY = 150; 
    const gapY = 200;
    
    return {
      x: centerX,
      y: startY + (slotIndex * gapY),
    };
  };

  if (!assetsLoaded) {
    return (
       <div className="fixed inset-0 z-0 bg-gradient-to-b from-sky-300 to-emerald-200 flex items-center justify-center">
         <div className="text-white text-xl font-bold animate-pulse">Loading Assets...</div>
       </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 bg-gradient-to-b from-sky-300 to-emerald-200 pointer-events-none flex justify-center items-center">
       {/* Debug Overlay */}
       <div className="absolute top-20 left-4 z-50 bg-black/50 text-white p-2 text-xs font-mono pointer-events-auto">
         <p>Buildings: {buildings.length}</p>
         <p>Dims: {dimensions.width}x{dimensions.height}</p>
         <p>Assets: Loaded</p>
       </div>

       {/* Pixi Application must be pointer-events-auto to receive clicks */}
       <div className="pointer-events-auto relative shadow-2xl rounded-xl overflow-hidden border-4 border-white/20"
            style={{ width: dimensions.width, height: dimensions.height }}
       >
        <Application 
          width={dimensions.width} 
          height={dimensions.height} 
          backgroundAlpha={0} // Fully transparent to show gradient
          antialias={true}
        >
          <pixiContainer sortableChildren={true}>
             {/* Confirm Renderer is Working */}
             <pixiGraphics 
              draw={(g: any) => {
                g.clear();
                g.beginFill(0x00FF00); // GREEN Circle
                g.drawCircle(30, 30, 10); // Top left marker
                g.endFill();
              }}
            />
            {buildings.map((building) => {
              const pos = getPosition(building.slot_index);
              
              // Map types to preloaded paths
              let textureUrl = TEXTURE_PATHS.TOWER;
              switch(building.type) {
                  case 'TAVERN': textureUrl = TEXTURE_PATHS.TAVERN; break;
                  case 'WELL': textureUrl = TEXTURE_PATHS.WELL; break;
              }

              return (
                <BuildingNode
                  key={building.id || `temp-${building.slot_index}`}
                  id={building.id}
                  name={building.name}
                  textureUrl={textureUrl}
                  x={pos.x}
                  y={pos.y}
                  corruption={building.corruption_level}
                  onClick={() => selectBuilding(building.id)}
                />
              );
            })}
          </pixiContainer>
        </Application>
      </div>
    </div>
  );
};
