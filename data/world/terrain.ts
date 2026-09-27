export type TerrainType =
  | 'grass'
  | 'dirt'
  | 'forest_floor'
  | 'stone'
  | 'sand'
  | 'shallow_water'
  | 'deep_water'
  | 'mountain'
  | 'farmland'
  | 'ruins'
  | 'cave_floor'
  | 'path'
  | 'bridge';

export interface TerrainDefinition {
  id: TerrainType;
  name: string;
  color: number;
  walkable: boolean;
  speedModifier: number;
  ambientSound?: string;
  particleEffect?: string;
}

export const terrainDefinitions: Record<TerrainType, TerrainDefinition> = {
  grass: {
    id: 'grass',
    name: 'Grass',
    color: 0x7cb342,
    walkable: true,
    speedModifier: 1.0,
  },
  dirt: {
    id: 'dirt',
    name: 'Dirt Path',
    color: 0x8d6e63,
    walkable: true,
    speedModifier: 1.0,
  },
  forest_floor: {
    id: 'forest_floor',
    name: 'Forest Floor',
    color: 0x5d4037,
    walkable: true,
    speedModifier: 0.9,
    ambientSound: 'forest_ambience',
  },
  stone: {
    id: 'stone',
    name: 'Stone',
    color: 0x757575,
    walkable: true,
    speedModifier: 1.0,
  },
  sand: {
    id: 'sand',
    name: 'Sand',
    color: 0xf5e6c8,
    walkable: true,
    speedModifier: 0.8,
  },
  shallow_water: {
    id: 'shallow_water',
    name: 'Shallow Water',
    color: 0x4fc3f7,
    walkable: true,
    speedModifier: 0.5,
    particleEffect: 'water_ripple',
  },
  deep_water: {
    id: 'deep_water',
    name: 'Deep Water',
    color: 0x1565c0,
    walkable: false,
    speedModifier: 0,
  },
  mountain: {
    id: 'mountain',
    name: 'Mountain',
    color: 0x546e7a,
    walkable: true,
    speedModifier: 0.6,
  },
  farmland: {
    id: 'farmland',
    name: 'Farmland',
    color: 0x8d6e63,
    walkable: true,
    speedModifier: 0.9,
  },
  ruins: {
    id: 'ruins',
    name: 'Ancient Ruins',
    color: 0x78909c,
    walkable: true,
    speedModifier: 0.9,
  },
  cave_floor: {
    id: 'cave_floor',
    name: 'Cave Floor',
    color: 0x37474f,
    walkable: true,
    speedModifier: 1.0,
    ambientSound: 'cave_ambience',
  },
  path: {
    id: 'path',
    name: 'Worn Path',
    color: 0xa1887f,
    walkable: true,
    speedModifier: 1.1,
  },
  bridge: {
    id: 'bridge',
    name: 'Bridge',
    color: 0x6d4c41,
    walkable: true,
    speedModifier: 1.0,
  },
};

export const terrainTransitionRules: Record<TerrainType, TerrainType[]> = {
  grass: ['dirt', 'forest_floor', 'path', 'farmland', 'sand'],
  dirt: ['grass', 'stone', 'path', 'farmland'],
  forest_floor: ['grass', 'dirt', 'stone', 'ruins'],
  stone: ['dirt', 'forest_floor', 'mountain', 'ruins', 'bridge'],
  sand: ['grass', 'shallow_water'],
  shallow_water: ['sand', 'deep_water', 'bridge'],
  deep_water: ['shallow_water'],
  mountain: ['stone', 'path'],
  farmland: ['grass', 'dirt', 'path'],
  ruins: ['forest_floor', 'stone', 'cave_floor'],
  cave_floor: ['ruins', 'stone'],
  path: ['grass', 'dirt', 'forest_floor', 'farmland', 'stone', 'bridge'],
  bridge: ['shallow_water', 'stone', 'path'],
};

export function getTerrainDefinition(type: TerrainType): TerrainDefinition {
  return terrainDefinitions[type];
}

export function canTransition(from: TerrainType, to: TerrainType): boolean {
  return terrainTransitionRules[from]?.includes(to) ?? false;
}

export const TILE_SIZE = 32;