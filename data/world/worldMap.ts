import type { WorldMap, WorldObject, Vector2, MapLayer } from '@shared/types';
import { regions, WorldRegion, getRegionAtPosition } from './regions';
import { worldObjects, getObjectsByRegion } from './objects';
import { landmarks, getLandmarksByRegion } from './landmarks';
import { regionEntrances, getRegionEntrances } from './entrances';
import { collisionObjects, getCollisionObjectsInRegion, CollisionObject } from './collision';
import { terrainDefinitions, TerrainType } from './terrain';

export const OVERWORLD_WIDTH = 5000;
export const OVERWORLD_HEIGHT = 4000;
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
  defaultSpawnPoint: { x: 2000, y: 1750 },
};

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
    'grass', 'dirt', 'forest_floor', 'stone', 'sand',
    'shallow_water', 'deep_water', 'mountain', 'farmland',
    'ruins', 'cave_floor', 'path', 'bridge',
  ];
  return terrainTypes.indexOf(type);
}

function indexToTerrainType(index: number): TerrainType {
  const terrainTypes: TerrainType[] = [
    'grass', 'dirt', 'forest_floor', 'stone', 'sand',
    'shallow_water', 'deep_water', 'mountain', 'farmland',
    'ruins', 'cave_floor', 'path', 'bridge',
  ];
  return terrainTypes[index] || 'grass';
}

export function getTerrainAtPosition(x: number, y: number): TerrainType {
  const region = getRegionAtPosition({ x, y });
  if (!region) return 'grass';

  const regionTerrain = region.terrainPalette;
  if (regionTerrain.length === 0) return 'grass';

  const normalizedX = (x - region.bounds.x) / region.bounds.width;
  const normalizedY = (y - region.bounds.y) / region.bounds.height;

  const terrainIndex = Math.floor(
    (normalizedX + normalizedY) * regionTerrain.length
  ) % regionTerrain.length;

  return regionTerrain[Math.max(0, terrainIndex)];
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
    if (dist < 60) return true;
  }

  if (region.id === 'village') {
    if (y > 1650 && y < 1750 && x > 1200 && x < 2800) return true;
    if (x > 1950 && x < 2050 && y > 1000 && y < 2400) return true;
  }

  if (region.id === 'farmland') {
    if (y > 1650 && y < 1750 && x > 400 && x < 1200) return true;
  }

  if (region.id === 'riverside') {
    if (x > 2900 && x < 3000 && y > 1200 && y < 2800) return true;
  }

  return false;
}

export function getWorldMap(): WorldMap {
  return {
    id: 'map_overworld',
    name: 'Willowmere Overworld',
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
    position.x >= 0 &&
    position.x < OVERWORLD_WIDTH &&
    position.y >= 0 &&
    position.y < OVERWORLD_HEIGHT
  );
}

export const WORLD_BOUNDS = {
  x: 0,
  y: 0,
  width: OVERWORLD_WIDTH,
  height: OVERWORLD_HEIGHT,
};

export function clampToWorldBounds(position: Vector2, margin: number = 32): Vector2 {
  return {
    x: Math.max(margin, Math.min(OVERWORLD_WIDTH - margin, position.x)),
    y: Math.max(margin, Math.min(OVERWORLD_HEIGHT - margin, position.y)),
  };
}