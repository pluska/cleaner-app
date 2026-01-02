import { extend } from "@pixi/react";
import { Container, Sprite, Graphics, Text, TextStyle, Texture } from "pixi.js";
import { useState, useEffect, useMemo } from "react";

// Register Pixi components for intrinsic usage
extend({ 
  pixiContainer: Container, 
  pixiSprite: Sprite, 
  pixiGraphics: Graphics, 
  pixiText: Text 
});

interface BuildingProps {
  id: string;
  textureUrl: string;
  x: number;
  y: number;
  corruption: number; // 0-100
  onClick: () => void;
  name?: string;
}

export const BuildingNode = ({ id, textureUrl, x, y, corruption, onClick, name }: BuildingProps) => {
  // Visual state derived from props
  const dirtyAlpha = Math.min(corruption / 100, 0.8);
  const isCritical = corruption > 80;
  
  // Green tint for high corruption
  const tint = isCritical ? 0xAAFFAA : 0xFFFFFF;

  const [hovered, setHovered] = useState(false);

  // Create texture explicitly
  const texture = useMemo(() => Texture.from(textureUrl), [textureUrl]);

  return (
    <>
    <pixiContainer 
      x={x} 
      y={y} 
      eventMode="static"
      onPointerTap={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      cursor="pointer"
    >
      {/* 0. Debug Layer (Yellow Circle) to verify position and scale */}
      <pixiGraphics 
        draw={(g: any) => {
          g.clear();
          g.lineStyle(2, 0xFFFF00, 1); // Yellow Outline
          g.drawCircle(0, 0, 50); 
        }}
      />

      {/* 1. Base Layer: Clean Building */}
      <pixiSprite 
        texture={texture} 
        anchor={0.5} 
        tint={tint}
        scale={hovered ? 0.52 : 0.5} // Slight hop on hover
      />

      {/* 2. Dirt Layer: Smoke/Grime Overlay */}
       {dirtyAlpha > 0 && (
        < pixiSprite 
          texture={texture}
          anchor={0.5}
          scale={0.5}
          tint={0x556655} // Dark greenish grime
          alpha={dirtyAlpha * 0.6} // Multiplier
          blendMode="multiply"
        />
       )}

       {/* 3. Critical Indicator (Exclamation Mark) */}
       {corruption > 50 && (
          <pixiText 
            text="!"
            x={0}
            y={-120} // Floating above
            anchor={0.5}
            style={
              new TextStyle({
                fill: ['#ff0000', '#ffaa00'], // Gradient
                fontSize: 48,
                fontWeight: 'bold',
                stroke: { color: '#ffffff', width: 4 },
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowDistance: 2,
              }) as any
            }
          />
       )}
       
       {/* 4. Name Label (Visible on Hover) */}
       {(hovered || isCritical) && name && (
          <pixiText 
            text={name}
            x={0}
            y={80} 
            anchor={0.5}
            style={
              new TextStyle({
                fill: 'white',
                fontSize: 16,
                stroke: { color: 'black', width: 3 },
              }) as any
            }
          />
       )}

    </pixiContainer>
    </>
  );
};
