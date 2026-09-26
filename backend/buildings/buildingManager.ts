import type { Vector2 } from '@shared/types';

export interface BuildingInterior {
  id: string;
  name: string;
  entrySpawn: Vector2;
  exitSpawn: Vector2;
}

export const buildingInteriors: Record<string, BuildingInterior> = {
  town_hall: {
    id: 'town_hall',
    name: "Town Hall - Mayor's Office",
    entrySpawn: { x: 200, y: 300 },
    exitSpawn: { x: 300, y: 260 },
  },
  general_store: {
    id: 'general_store',
    name: 'General Store - Counter',
    entrySpawn: { x: 200, y: 300 },
    exitSpawn: { x: 100, y: 360 },
  },
  blacksmith: {
    id: 'blacksmith',
    name: 'Blacksmith - Forge',
    entrySpawn: { x: 200, y: 300 },
    exitSpawn: { x: 600, y: 260 },
  },
  inn: {
    id: 'inn',
    name: 'Willowmere Inn - Dining Hall',
    entrySpawn: { x: 200, y: 300 },
    exitSpawn: { x: 650, y: 460 },
  },
  library: {
    id: 'library',
    name: 'Library - Archives',
    entrySpawn: { x: 200, y: 300 },
    exitSpawn: { x: 150, y: 510 },
  },
  stables: {
    id: 'stables',
    name: 'Stables - Tack Room',
    entrySpawn: { x: 200, y: 300 },
    exitSpawn: { x: 800, y: 260 },
  },
  farm_house: {
    id: 'farm_house',
    name: 'Farm House - Living Room',
    entrySpawn: { x: 200, y: 300 },
    exitSpawn: { x: 350, y: 160 },
  },
  barn: {
    id: 'barn',
    name: 'Barn - Storage Area',
    entrySpawn: { x: 200, y: 300 },
    exitSpawn: { x: 200, y: 140 },
  },
  player_house: {
    id: 'player_house',
    name: 'Player House - Cozy Room',
    entrySpawn: { x: 200, y: 300 },
    exitSpawn: { x: 400, y: 560 },
  },
};

export function getBuildingInterior(buildingId: string): BuildingInterior | undefined {
  return buildingInteriors[buildingId];
}
