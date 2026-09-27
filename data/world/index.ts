export type { TerrainType, TerrainDefinition } from './terrain';
export { terrainDefinitions, terrainTransitionRules, getTerrainDefinition, canTransition } from './terrain';

export type { WorldRegion, WeatherAffinity, RegionConnection } from './regions';
export { regions, regionConnections, getRegionById, getRegionAtPosition, getConnectedRegions } from './regions';

export type { Landmark, LandmarkType, LandmarkInteraction } from './landmarks';
export { landmarks, getLandmarksByRegion, getLandmarkById } from './landmarks';

export { worldObjects, getObjectsByRegion } from './objects';

export type { RegionEntrance, EntranceInteraction, BuildingEntrance } from './entrances';
export { regionEntrances, buildingEntrances, getRegionEntrances, getBuildingAtPosition, getEntranceAtPosition, getEntrancePosition, getBuildingEntranceById } from './entrances';

export * from './collision';
export * from './chunks';
export * from './environment';
export * from './events';
export * from './worldMap';