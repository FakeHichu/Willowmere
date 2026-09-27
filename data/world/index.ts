export { 
  terrainDefinitions, 
  terrainTransitionRules, 
  getTerrainDefinition, 
  canTransition,
} from './terrain';
export type { TerrainDefinition, TerrainType } from './terrain';
export type { WorldRegion, RegionConnection, WeatherAffinity } from './regions';
export { 
  regions, 
  getRegionById, 
  getRegionAtPosition, 
  getConnectedRegions, 
  getEntrancePosition
} from './regions';
export * from './landmarks';
export * from './objects';
export type { CollisionObject, CollisionType, CollisionLayer, TerrainCollision, BoundingBox, Size } from './collision';
export { 
  collisionObjects,
  checkCollision,
  checkCollisionAt,
  isPositionWalkable,
  findValidPositionNear,
  getNearbyCollisionObjects,
  getCollisionObjectsInRegion,
  PLAYER_COLLISION_SIZE,
  NPC_COLLISION_SIZE,
  terrainCollisions,
  getTerrainCollision
} from './collision';
export * from './entrances';
export * from './worldMap';