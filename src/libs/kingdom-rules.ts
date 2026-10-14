export const BUILDINGS = [
  { kind: "TOWER", name: "Torre de Sparklin", en: "Sparklin's tower", asset: "/assets/tower_clean.png", x: 5, y: 3 },
  { kind: "TAVERN", name: "Taberna", en: "Tavern", asset: "/assets/tavern_clean.png", x: 3, y: 6 },
  { kind: "WELL", name: "Pozo", en: "Well", asset: "/assets/well_clean.png", x: 8, y: 6 },
  { kind: "ENTRANCE", name: "Entrada", en: "Entrance", asset: "/assets/tower_clean.png", x: 6, y: 9 },
] as const;
export function localDay(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
export function validDay(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function roomKind(name: string) {
  const key = name.toLowerCase();
  if (/kitchen|cocina|comedor|dining/.test(key)) return "TAVERN";
  if (/bath|baño|lavander|laundry/.test(key)) return "WELL";
  if (/living|sala|entrada|hall/.test(key)) return "ENTRANCE";
  return "TOWER";
}
export function corruption(restoredAt: number, now: number) {
  return Math.min(100, Math.max(0, Math.floor((now - restoredAt) / 86400000) - 2) * 10);
}
export function validPositions(positions: { id: string; x: number; y: number }[]) {
  return Array.isArray(positions) && positions.every(p => p && typeof p === "object" && typeof p.id === "string") && positions.length === 4 && new Set(positions.map(p => p.id)).size === 4 && positions.every(p => Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 1 && p.x <= 10 && p.y >= 1 && p.y <= 10) && positions.every((p, i) => positions.every((q, j) => i === j || Math.abs(p.x - q.x) >= 2 || Math.abs(p.y - q.y) >= 2));
}
