import type { Vector2 } from '@shared/types';
import { generateCollisionObjects, worldObjects } from './objects';
import { landmarks } from './landmarks';
import { regions } from './regions';
import type { TerrainType } from './terrain';

export interface Size {
  width: number;
  height: number;
}

export interface CollisionObject {
  id: string;
  position: Vector2;
  size: Size;
  type: CollisionType;
  passable?: boolean;
  oneWay?: boolean;
}

export type CollisionType =
  | 'building'
  | 'tree'
  | 'rock'
  | 'water'
  | 'fence'
  | 'wall'
  | 'cliff'
  | 'structure'
  | 'landmark'
  | 'terrain'
  | 'door';

export interface CollisionLayer {
  objects: CollisionObject[];
  terrainCollisions: TerrainCollision[];
}

export interface TerrainCollision {
  terrainType: TerrainType;
  walkable: boolean;
  speedModifier: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Generate collision objects from world data
export const collisionObjects: CollisionObject[] = generateCollisionObjects().map(obj => ({
  ...obj,
  type: inferCollisionType(obj.id),
}));

function inferCollisionType(id: string): CollisionType {
  if (id.startsWith('building_') || id.startsWith('sign_')) return 'building';
  if (id.includes('tree') || id.includes('oak') || id.includes('willow')) return 'tree';
  if (id.includes('rock') || id.includes('stone') || id.includes('boulder') || id.includes('pillar') || id.includes('spire')) return 'rock';
  if (id.includes('water') || id.includes('pond') || id.includes('river') || id.includes('pool') || id.includes('spring')) return 'water';
  if (id.includes('fence')) return 'fence';
  if (id.includes('wall') || id.includes('gate')) return 'wall';
  if (id.includes('cliff') || id.includes('edge')) return 'cliff';
  if (id.includes('shrine') || id.includes('statue') || id.includes('monument') || id.includes('flame') || id.includes('altar')) return 'structure';
  if (id.includes('dock') || id.includes('bridge') || id.includes('well') || id.includes('windmill') || id.includes('fountain')) return 'structure';
  if (id.includes('cave') || id.includes('cavern') || id.includes('entrance')) return 'door';
  return 'structure';
}

// Terrain-based collision (for tilemap)
export const terrainCollisions: TerrainCollision[] = [
  { terrainType: 'grass', walkable: true, speedModifier: 1.0 },
  { terrainType: 'dirt', walkable: true, speedModifier: 1.0 },
  { terrainType: 'forest_floor', walkable: true, speedModifier: 0.9 },
  { terrainType: 'stone', walkable: true, speedModifier: 1.0 },
  { terrainType: 'sand', walkable: true, speedModifier: 0.8 },
  { terrainType: 'shallow_water', walkable: true, speedModifier: 0.5 },
  { terrainType: 'deep_water', walkable: false, speedModifier: 0 },
  { terrainType: 'mountain', walkable: true, speedModifier: 0.6 },
  { terrainType: 'farmland', walkable: true, speedModifier: 0.9 },
  { terrainType: 'ruins', walkable: true, speedModifier: 0.9 },
  { terrainType: 'cave_floor', walkable: true, speedModifier: 1.0 },
  { terrainType: 'path', walkable: true, speedModifier: 1.1 },
  { terrainType: 'bridge', walkable: true, speedModifier: 1.0 },
];

export const PLAYER_COLLISION_SIZE = { width: 24, height: 24 };
export const NPC_COLLISION_SIZE = { width: 24, height: 32 };

export function getCollisionObjectsInRegion(regionId: string): CollisionObject[] {
  const region = regions.find(r => r.id === regionId);
  if (!region) return [];

  const { x, y, width, height } = region.bounds;
  const expandedBounds = {
    x: x - 100,
    y: y - 100,
    width: width + 200,
    height: height + 200,
  };

  return collisionObjects.filter(obj => {
    const objRight = obj.position.x + obj.size.width;
    const objBottom = obj.position.y + obj.size.height;
    return objRight >= expandedBounds.x &&
           obj.position.x <= expandedBounds.x + expandedBounds.width &&
           objBottom >= expandedBounds.y &&
           obj.position.y <= expandedBounds.y + expandedBounds.height;
  });
}

export function checkCollision(
  position: Vector2,
  size: Size = PLAYER_COLLISION_SIZE,
  checkObjects: CollisionObject[] = collisionObjects
): { collides: boolean; blockingObject?: CollisionObject } {
  const playerRect: BoundingBox = {
    x: position.x - size.width / 2,
    y: position.y - size.height / 2,
    width: size.width,
    height: size.height,
  };

  for (const obj of checkObjects) {
    const objRect: BoundingBox = {
      x: obj.position.x,
      y: obj.position.y,
      width: obj.size.width,
      height: obj.size.height,
    };

    if (rectsIntersect(playerRect, objRect)) {
      if (obj.passable !== true) {
        return { collides: true, blockingObject: obj };
      }
    }
  }

  return { collides: false };
}

export function checkCollisionAt(
  x: number,
  y: number,
  size: Size = PLAYER_COLLISION_SIZE,
  checkObjects: CollisionObject[] = collisionObjects
): { collides: boolean; blockingObject?: CollisionObject } {
  return checkCollision({ x, y }, size, checkObjects);
}

function rectsIntersect(r1: BoundingBox, r2: BoundingBox): boolean {
  return !(
    r2.x >= r1.x + r1.width ||
    r2.x + r2.width <= r1.x ||
    r2.y >= r1.y + r1.height ||
    r2.y + r2.height <= r1.y
  );
}

export function getTerrainCollision(terrainType: TerrainType): TerrainCollision | undefined {
  return terrainCollisions.find(t => t.terrainType === terrainType);
}

export function isPositionWalkable(
  position: Vector2,
  terrainType: TerrainType,
  checkObjects: CollisionObject[] = collisionObjects
): boolean {
  const terrainCollision = getTerrainCollision(terrainType);
  if (terrainCollision && !terrainCollision.walkable) {
    return false;
  }

  const collision = checkCollision(position, PLAYER_COLLISION_SIZE, checkObjects);
  return !collision.collides;
}

export function findValidPositionNear(
  targetPosition: Vector2,
  radius: number,
  terrainType: TerrainType,
  checkObjects: CollisionObject[] = collisionObjects
): Vector2 | null {
  const steps = 16;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const distance = radius * (0.5 + Math.random() * 0.5);
    const testPos = {
      x: targetPosition.x + Math.cos(angle) * distance,
      y: targetPosition.y + Math.sin(angle) * distance,
    };

    if (isPositionWalkable(testPos, terrainType, checkObjects)) {
      return testPos;
    }
  }
  return null;
}

export function getNearbyCollisionObjects(
  position: Vector2,
  radius: number
): CollisionObject[] {
  return collisionObjects.filter(obj => {
    const dx = obj.position.x + obj.size.width / 2 - position.x;
    const dy = obj.position.y + obj.size.height / 2 - position.y;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  });
}