export type TerrainType =
  | 'grass'
  | 'dirt'
  | 'forest_floor'
  | 'stone'
  | 'sand'
  | 'mud'
  | 'shallow_water'
  | 'deep_water'
  | 'river'
  | 'cliff'
  | 'mountain'
  | 'farmland'
  | 'ruins'
  | 'cave_floor'
  | 'path'
  | 'bridge'
  | 'snow';

export interface TerrainDefinition {
  id: TerrainType;
  name: string;
  color: number;
  walkable: boolean;
  speedModifier: number;
  ambientSound?: string;
  particleEffect?: string;
  elevationLevel?: number;
}

export const terrainDefinitions: Record<TerrainType, TerrainDefinition> = {
  grass: {
    id: 'grass',
    name: 'Grass',
    color: 0x5a9e32,
    walkable: true,
    speedModifier: 1.0,
    elevationLevel: 1,
  },
  dirt: {
    id: 'dirt',
    name: 'Dirt Path',
    color: 0x8d6e63,
    walkable: true,
    speedModifier: 1.05,
    elevationLevel: 1,
  },
  forest_floor: {
    id: 'forest_floor',
    name: 'Forest Floor',
    color: 0x3d5229,
    walkable: true,
    speedModifier: 0.9,
    ambientSound: 'forest_ambience',
    elevationLevel: 1,
  },
  stone: {
    id: 'stone',
    name: 'Stone Path',
    color: 0x757575,
    walkable: true,
    speedModifier: 1.1,
    elevationLevel: 1,
  },
  sand: {
    id: 'sand',
    name: 'Sand Shore',
    color: 0xd6c285,
    walkable: true,
    speedModifier: 0.85,
    elevationLevel: 0,
  },
  mud: {
    id: 'mud',
    name: 'Mud',
    color: 0x4e342e,
    walkable: true,
    speedModifier: 0.65,
    particleEffect: 'mud_splash',
    elevationLevel: 0,
  },
  shallow_water: {
    id: 'shallow_water',
    name: 'Shallow Water',
    color: 0x4fc3f7,
    walkable: true,
    speedModifier: 0.5,
    particleEffect: 'water_ripple',
    elevationLevel: 0,
  },
  deep_water: {
    id: 'deep_water',
    name: 'Deep Water',
    color: 0x1565c0,
    walkable: false,
    speedModifier: 0,
    ambientSound: 'water_flow',
    elevationLevel: -1,
  },
  river: {
    id: 'river',
    name: 'River',
    color: 0x0288d1,
    walkable: false,
    speedModifier: 0,
    ambientSound: 'river_flow',
    particleEffect: 'river_current',
    elevationLevel: -1,
  },
  cliff: {
    id: 'cliff',
    name: 'Cliff Edge',
    color: 0x424242,
    walkable: false,
    speedModifier: 0,
    elevationLevel: 2,
  },
  mountain: {
    id: 'mountain',
    name: 'High Mountain',
    color: 0x546e7a,
    walkable: true,
    speedModifier: 0.7,
    ambientSound: 'mountain_wind',
    elevationLevel: 3,
  },
  farmland: {
    id: 'farmland',
    name: 'Farmland',
    color: 0x795548,
    walkable: true,
    speedModifier: 0.95,
    elevationLevel: 1,
  },
  ruins: {
    id: 'ruins',
    name: 'Ancient Stone Ruins',
    color: 0x607d8b,
    walkable: true,
    speedModifier: 0.9,
    ambientSound: 'ruins_echo',
    elevationLevel: 1,
  },
  cave_floor: {
    id: 'cave_floor',
    name: 'Cave Cavern Floor',
    color: 0x263238,
    walkable: true,
    speedModifier: 0.95,
    ambientSound: 'cave_ambience',
    elevationLevel: -2,
  },
  path: {
    id: 'path',
    name: 'Cobblestone Road',
    color: 0x9e9e9e,
    walkable: true,
    speedModifier: 1.15,
    elevationLevel: 1,
  },
  bridge: {
    id: 'bridge',
    name: 'Wooden Bridge',
    color: 0x5d4037,
    walkable: true,
    speedModifier: 1.1,
    elevationLevel: 1,
  },
  snow: {
    id: 'snow',
    name: 'Mountain Snow',
    color: 0xe0f7fa,
    walkable: true,
    speedModifier: 0.8,
    particleEffect: 'snow_drift',
    elevationLevel: 3,
  },
};

export const terrainTransitionRules: Record<TerrainType, TerrainType[]> = {
  grass: ['dirt', 'forest_floor', 'path', 'farmland', 'sand', 'mud', 'snow'],
  dirt: ['grass', 'stone', 'path', 'farmland', 'mud'],
  forest_floor: ['grass', 'dirt', 'stone', 'ruins', 'mud'],
  stone: ['dirt', 'forest_floor', 'mountain', 'ruins', 'bridge', 'path', 'cliff'],
  sand: ['grass', 'shallow_water', 'mud'],
  mud: ['sand', 'grass', 'shallow_water', 'dirt'],
  shallow_water: ['sand', 'deep_water', 'river', 'bridge', 'mud'],
  deep_water: ['shallow_water', 'river'],
  river: ['shallow_water', 'deep_water', 'bridge'],
  cliff: ['stone', 'mountain', 'grass'],
  mountain: ['stone', 'path', 'snow', 'cliff'],
  farmland: ['grass', 'dirt', 'path', 'mud'],
  ruins: ['forest_floor', 'stone', 'cave_floor'],
  cave_floor: ['ruins', 'stone', 'cliff'],
  path: ['grass', 'dirt', 'forest_floor', 'farmland', 'stone', 'bridge'],
  bridge: ['shallow_water', 'river', 'stone', 'path'],
  snow: ['mountain', 'stone', 'grass'],
};

export function getTerrainDefinition(type: TerrainType): TerrainDefinition {
  return terrainDefinitions[type] || terrainDefinitions.grass;
}

export function canTransition(from: TerrainType, to: TerrainType): boolean {
  return terrainTransitionRules[from]?.includes(to) ?? false;
}

export const TILE_SIZE = 32;