import 'react';
import { Container, Sprite, Text, Graphics } from 'pixi.js';

// Augment the global JSX namespace
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Standard names (might conflict or be ignored)
      container: any; 
      sprite: any;
      text: any;
      graphics: any;
      
      // Custom names to avoid conflicts (e.g. SVG <text>)
      pixiContainer: any;
      pixiSprite: any;
      pixiText: any;
      pixiGraphics: any;
    }
  }
}
