import type { WorldMap, WorldObject, Vector2, MapLayer } from '@shared/types';
import { regions, WorldRegion, getRegionAtPosition } from './regions';
import { worldObjects, getObjectsByRegion } from './objects';
import { landmarks, getLandmarksByRegion } from './landmarks';
import { regionEntrances, getRegionEntrances } from './entrances';
import { collisionObjects, getCollisionObjectsInRegion, CollisionObject } from './collision';
import { terrainDefinitions, TerrainType } from './terrain';

export const OVERWORLD_WIDTH = 6000;
export const OVERWORLD_HEIGHT = 4500;
export const TILE_SIZE = 32;

export interface OverworldData {
  width: number;
  height: number;
  tileSize: number;
  regions: WorldRegion[];
  objects: WorldObject[];
  collisionObjects: CollisionObject[];
  defaultSpawnPoint: Vector2;
}

export const overworldData: OverworldData = {
  width: OVERWORLD_WIDTH,
  height: OVERWORLD_HEIGHT,
  tileSize: TILE_SIZE,
  regions,
  objects: worldObjects,
  collisionObjects,
  defaultSpawnPoint: { x: 3000, y: 2300 },
};

// Deterministic Pseudo-Random Seed Generator for terrain blending
function seededRandom(x: number, y: number, seed: number = 42): number {
  const val = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return val - Math.floor(val);
}

export function getTerrainAtPosition(x: number, y: number): TerrainType {
  const region = getRegionAtPosition({ x, y });
  if (!region) return 'grass';

  const regionTerrain = region.terrainPalette;
  if (!regionTerrain || regionTerrain.length === 0) return 'grass';

  // Seeded noise for terrain transition blending
  const n = seededRandom(Math.floor(x / 128), Math.floor(y / 128));
  const blendIndex = Math.floor(n * regionTerrain.length);

  // Check if position is near river or lake
  if (region.id === 'riverside' && Math.abs(x - 4900) < 180) {
    return 'river';
  }
  if (region.id === 'lakeside' && y > 3600) {
    return 'shallow_water';
  }
  if (region.id === 'northern_mountains' && y < -1000) {
    return 'snow';
  }
  if (region.id === 'cave_underground') {
    return 'cave_floor';
  }

  return regionTerrain[blendIndex % regionTerrain.length] || 'grass';
}

export function isPathAtPosition(x: number, y: number): boolean {
  const region = getRegionAtPosition({ x, y });
  if (!region) return false;

  const entrances = getRegionEntrances(region.id);
  for (const entrance of entrances) {
    const dist = Math.sqrt(
      Math.pow(entrance.position.x - x, 2) +
      Math.pow(entrance.position.y - y, 2)
    );
    if (dist < 80) return true;
  }

  // Main village crossroad paths
  if (region.id === 'village') {
    if (Math.abs(y - 2300) < 40 && x > 2000 && x < 4000) return true;
    if (Math.abs(x - 3000) < 40 && y > 1500 && y < 3100) return true;
  }

  // Farmland road
  if (region.id === 'southern_farmland') {
    if (Math.abs(y - 3400) < 32 && x > 200 && x < 2000) return true;
  }

  return false;
}

export function generateTerrainMap(): MapLayer {
  const widthInTiles = Math.ceil(OVERWORLD_WIDTH / TILE_SIZE);
  const heightInTiles = Math.ceil(OVERWORLD_HEIGHT / TILE_SIZE);
  const data: number[][] = [];

  for (let y = 0; y < heightInTiles; y++) {
    const row: number[] = [];
    for (let x = 0; x < widthInTiles; x++) {
      const worldX = x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = y * TILE_SIZE + TILE_SIZE / 2;
      const terrainType = getTerrainAtPosition(worldX, worldY);
      row.push(terrainTypeToIndex(terrainType));
    }
    data.push(row);
  }

  return {
    id: 'layer_terrain',
    name: 'Terrain',
    type: 'tile',
    data,
    opacity: 1,
    visible: true,
  };
}

export function generatePathMap(): MapLayer {
  const widthInTiles = Math.ceil(OVERWORLD_WIDTH / TILE_SIZE);
  const heightInTiles = Math.ceil(OVERWORLD_HEIGHT / TILE_SIZE);
  const data: number[][] = [];

  for (let y = 0; y < heightInTiles; y++) {
    const row: number[] = [];
    for (let x = 0; x < widthInTiles; x++) {
      const worldX = x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = y * TILE_SIZE + TILE_SIZE / 2;
      const isPath = isPathAtPosition(worldX, worldY);
      row.push(isPath ? terrainTypeToIndex('path') : -1);
    }
    data.push(row);
  }

  return {
    id: 'layer_paths',
    name: 'Paths',
    type: 'tile',
    data,
    opacity: 1,
    visible: true,
  };
}

function terrainTypeToIndex(type: TerrainType): number {
  const terrainTypes: TerrainType[] = [
    'grass', 'dirt', 'forest_floor', 'stone', 'sand', 'mud',
    'shallow_water', 'deep_water', 'river', 'cliff', 'mountain',
    'farmland', 'ruins', 'cave_floor', 'path', 'bridge', 'snow',
  ];
  return terrainTypes.indexOf(type);
}

export function getWorldMap(): WorldMap {
  return {
    id: 'map_overworld',
    name: 'Willowmere Open World',
    width: OVERWORLD_WIDTH,
    height: OVERWORLD_HEIGHT,
    tileSize: TILE_SIZE,
    layers: [
      generateTerrainMap(),
      generatePathMap(),
      { id: 'layer_details', name: 'Details', type: 'tile', data: [], opacity: 1, visible: true },
    ],
    objects: worldObjects,
    spawnPoint: overworldData.defaultSpawnPoint,
    ambientColor: '#f5f0e6',
  };
}

export function getRegionDataAtPosition(position: Vector2): {
  region: WorldRegion | undefined;
  objects: WorldObject[];
  landmarks: ReturnType<typeof getLandmarksByRegion>;
  entrances: ReturnType<typeof getRegionEntrances>;
  collisions: ReturnType<typeof getCollisionObjectsInRegion>;
} {
  const region = getRegionAtPosition(position);
  if (!region) {
    return {
      region: undefined,
      objects: [],
      landmarks: [],
      entrances: [],
      collisions: [],
    };
  }

  return {
    region,
    objects: getObjectsByRegion(region.id),
    landmarks: getLandmarksByRegion(region.id),
    entrances: getRegionEntrances(region.id),
    collisions: getCollisionObjectsInRegion(region.id),
  };
}

export function getAllRegions(): WorldRegion[] {
  return regions;
}

export function getRegionById(id: string): WorldRegion | undefined {
  return regions.find(r => r.id === id);
}

export function worldToTile(position: Vector2): { x: number; y: number } {
  return {
    x: Math.floor(position.x / TILE_SIZE),
    y: Math.floor(position.y / TILE_SIZE),
  };
}

export function tileToWorld(tileX: number, tileY: number): Vector2 {
  return {
    x: tileX * TILE_SIZE + TILE_SIZE / 2,
    y: tileY * TILE_SIZE + TILE_SIZE / 2,
  };
}

export function isPositionInBounds(position: Vector2): boolean {
  return (
    position.x >= -400 &&
    position.x < OVERWORLD_WIDTH &&
    position.y >= -3500 &&
    position.y < OVERWORLD_HEIGHT
  );
}

export const WORLD_BOUNDS = {
  x: -400,
  y: -3500,
  width: OVERWORLD_WIDTH + 800,
  height: OVERWORLD_HEIGHT + 4000,
};

export function clampToWorldBounds(position: Vector2, margin: number = 32): Vector2 {
  return {
    x: Math.max(WORLD_BOUNDS.x + margin, Math.min(WORLD_BOUNDS.x + WORLD_BOUNDS.width - margin, position.x)),
    y: Math.max(WORLD_BOUNDS.y + margin, Math.min(WORLD_BOUNDS.y + WORLD_BOUNDS.height - margin, position.y)),
  };
}