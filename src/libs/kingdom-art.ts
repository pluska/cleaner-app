import { BUILDINGS } from './kingdom-rules';

export const TERRAIN_ART = '/kingdom/terrain.webp';
export const TOWER_ART = ['/kingdom/tower1.webp', '/kingdom/tower2.webp', '/kingdom/tower3.webp'] as const;
export const WEEKLY_BANNER_ART = '/kingdom/household-banner.svg';
export const KINGDOM_TEXTURES = [...new Set([TERRAIN_ART, WEEKLY_BANNER_ART, ...TOWER_ART, ...BUILDINGS.map(b => b.asset)])];

export function buildingArt(kind: string, level: number) {
  if (kind === 'TOWER') return TOWER_ART[Math.max(0, Math.min(TOWER_ART.length - 1, level - 1))];
  return BUILDINGS.find(b => b.kind === kind)?.asset ?? TOWER_ART[0];
}
