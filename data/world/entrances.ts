import type { Vector2, InteractionDefinition, InteractionAction } from '@shared/types';

export interface RegionEntrance {
  id: string;
  name: string;
  regionId: string;
  targetRegionId: string;
  fromRegion: string;
  toRegion: string;
  position: Vector2;
  targetPosition: Vector2;
  type: 'road' | 'path' | 'bridge' | 'hidden' | 'cave' | 'building' | 'fast_travel' | 'river';
  requiresKey?: string;
  description?: string;
  discovered: boolean;
  interactions?: EntranceInteraction[];
}

export interface EntranceInteraction {
  type: string;
  label: string;
  key: string;
  action?: InteractionAction;
  condition?: Record<string, unknown>;
}

export interface BuildingEntrance {
  id: string;
  buildingName: string;
  buildingId: string;
  exteriorPosition: Vector2;
  interiorSceneKey: string;
  interiorPosition: Vector2;
  interiorName: string;
  doorSprite?: string;
  discovered: boolean;
  interactions?: InteractionDefinition[];
}

export const regionEntrances: RegionEntrance[] = [
  // Village connections
  {
    id: 'entrance_north_road',
    name: 'North Forest Trail',
    regionId: 'village',
    targetRegionId: 'whispering_woods',
    fromRegion: 'village',
    toRegion: 'whispering_woods',
    position: { x: 3000, y: 1550 },
    targetPosition: { x: 3000, y: 1450 },
    type: 'road',
    discovered: true,
    interactions: [{ type: 'travel', label: 'Travel to Whispering Woods', key: 'E', action: { type: 'open', payload: { destination: 'whispering_woods' } } }],
  },
  {
    id: 'entrance_east_road',
    name: 'East River Road',
    regionId: 'village',
    targetRegionId: 'riverside',
    fromRegion: 'village',
    toRegion: 'riverside',
    position: { x: 3950, y: 2300 },
    targetPosition: { x: 4050, y: 2300 },
    type: 'road',
    discovered: true,
    interactions: [{ type: 'travel', label: 'Travel to Riverside', key: 'E', action: { type: 'open', payload: { destination: 'riverside' } } }],
  },
  {
    id: 'entrance_west_road',
    name: 'West Explorer Path',
    regionId: 'village',
    targetRegionId: 'abandoned_camp',
    fromRegion: 'village',
    toRegion: 'abandoned_camp',
    position: { x: 2050, y: 2300 },
    targetPosition: { x: 1950, y: 2300 },
    type: 'road',
    discovered: true,
    interactions: [{ type: 'travel', label: 'Travel to Abandoned Camp', key: 'E', action: { type: 'open', payload: { destination: 'abandoned_camp' } } }],
  },
  {
    id: 'entrance_south_road',
    name: 'South Grove Pass',
    regionId: 'village',
    targetRegionId: 'hidden_grove',
    fromRegion: 'village',
    toRegion: 'hidden_grove',
    position: { x: 3000, y: 3050 },
    targetPosition: { x: 3000, y: 3150 },
    type: 'road',
    discovered: true,
    interactions: [{ type: 'travel', label: 'Travel to Hidden Grove', key: 'E', action: { type: 'open', payload: { destination: 'hidden_grove' } } }],
  },

  // Farmland connection
  {
    id: 'entrance_farmland_village',
    name: 'Farmland Valley Trail',
    regionId: 'southern_farmland',
    targetRegionId: 'village',
    fromRegion: 'southern_farmland',
    toRegion: 'village',
    position: { x: 1950, y: 2900 },
    targetPosition: { x: 2050, y: 2900 },
    type: 'road',
    discovered: false,
    interactions: [{ type: 'travel', label: 'Return to Village', key: 'E', action: { type: 'open', payload: { destination: 'village' } } }],
  },
  {
    id: 'entrance_farmland_grove',
    name: 'Meadow Pathway',
    regionId: 'southern_farmland',
    targetRegionId: 'hidden_grove',
    fromRegion: 'southern_farmland',
    toRegion: 'hidden_grove',
    position: { x: 1950, y: 3500 },
    targetPosition: { x: 2050, y: 3500 },
    type: 'path',
    discovered: false,
    interactions: [{ type: 'travel', label: 'Travel to Hidden Grove', key: 'E', action: { type: 'open', payload: { destination: 'hidden_grove' } } }],
  },

  // Mountain & Shrine connections
  {
    id: 'entrance_forest_mountains',
    name: 'Northern Ridge Pass',
    regionId: 'whispering_woods',
    targetRegionId: 'northern_mountains',
    fromRegion: 'whispering_woods',
    toRegion: 'northern_mountains',
    position: { x: 3000, y: 50 },
    targetPosition: { x: 3000, y: -50 },
    type: 'path',
    discovered: false,
    interactions: [{ type: 'travel', label: 'Ascend to Northern Mountains', key: 'E', action: { type: 'open', payload: { destination: 'northern_mountains' } } }],
  },
  {
    id: 'entrance_highland_shrine',
    name: 'Sacred Mountain Stairs',
    regionId: 'highland_trail',
    targetRegionId: 'old_shrine',
    fromRegion: 'highland_trail',
    toRegion: 'old_shrine',
    position: { x: 900, y: -1450 },
    targetPosition: { x: 900, y: -1550 },
    type: 'path',
    discovered: false,
    interactions: [{ type: 'travel', label: 'Ascend to Old Shrine', key: 'E', action: { type: 'open', payload: { destination: 'old_shrine' } } }],
  },

  // Subterranean cavern
  {
    id: 'entrance_hidden_cave',
    name: 'Shadow Cavern Mouth',
    regionId: 'whispering_woods',
    targetRegionId: 'cave_underground',
    fromRegion: 'whispering_woods',
    toRegion: 'cave_underground',
    position: { x: 3850, y: 300 },
    targetPosition: { x: 4100, y: -1300 },
    type: 'cave',
    discovered: false,
    interactions: [{ type: 'enter', label: 'Enter Shadow Cavern', key: 'E', action: { type: 'open', payload: { destination: 'cave_underground' } } }],
  },
];

export const buildingEntrances: BuildingEntrance[] = [
  {
    id: 'building_town_hall',
    buildingName: 'Willowmere Town Hall',
    buildingId: 'building_town_hall',
    exteriorPosition: { x: 3000, y: 2000 },
    interiorSceneKey: 'BuildingInteriorScene',
    interiorPosition: { x: 400, y: 500 },
    interiorName: "Town Hall - Mayor's Office",
    discovered: true,
    interactions: [{ type: 'open', label: 'Enter Town Hall', key: 'E', action: { type: 'open', payload: { buildingId: 'building_town_hall' } } }],
  },
  {
    id: 'building_general_store',
    buildingName: 'General Goods Store',
    buildingId: 'building_general_store',
    exteriorPosition: { x: 2850, y: 2200 },
    interiorSceneKey: 'BuildingInteriorScene',
    interiorPosition: { x: 400, y: 500 },
    interiorName: 'General Store - Counter',
    discovered: true,
    interactions: [{ type: 'open', label: 'Enter General Store', key: 'E', action: { type: 'open', payload: { buildingId: 'building_general_store' } } }],
  },
  {
    id: 'building_blacksmith',
    buildingName: 'Forge & Anvil Blacksmith',
    buildingId: 'building_blacksmith',
    exteriorPosition: { x: 3150, y: 2200 },
    interiorSceneKey: 'BuildingInteriorScene',
    interiorPosition: { x: 400, y: 500 },
    interiorName: 'Blacksmith - Forge',
    discovered: true,
    interactions: [{ type: 'open', label: 'Enter Blacksmith', key: 'E', action: { type: 'open', payload: { buildingId: 'building_blacksmith' } } }],
  },
  {
    id: 'building_inn',
    buildingName: 'The Wayfarer Inn',
    buildingId: 'building_inn',
    exteriorPosition: { x: 3000, y: 2450 },
    interiorSceneKey: 'BuildingInteriorScene',
    interiorPosition: { x: 400, y: 500 },
    interiorName: 'Inn - Common Room',
    discovered: true,
    interactions: [{ type: 'open', label: 'Enter Inn', key: 'E', action: { type: 'open', payload: { buildingId: 'building_inn' } } }],
  },
];

export function getRegionEntrances(regionId: string): RegionEntrance[] {
  return regionEntrances.filter(e => e.regionId === regionId);
}

export function getBuildingAtPosition(position: Vector2, radius: number = 50): BuildingEntrance | undefined {
  return buildingEntrances.find(e => {
    const dx = e.exteriorPosition.x - position.x;
    const dy = e.exteriorPosition.y - position.y;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  });
}

export function getEntranceAtPosition(position: Vector2, radius: number = 50): RegionEntrance | undefined {
  return regionEntrances.find(e => {
    const dx = e.position.x - position.x;
    const dy = e.position.y - position.y;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  });
}

export function getEntrancePosition(entranceId: string): Vector2 | undefined {
  const entrance = regionEntrances.find(e => e.id === entranceId);
  return entrance ? entrance.position : undefined;
}

export function getBuildingEntranceById(id: string): BuildingEntrance | undefined {
  return buildingEntrances.find(b => b.id === id || b.buildingId === id);
}