import type { Vector2 } from '@shared/types';
import { regions, getRegionById } from './regions';
import { worldObjects, getObjectById } from './objects';

export interface BuildingEntrance {
  buildingId: string;
  exteriorPosition: Vector2;
  interiorSpawn: Vector2;
  exitSpawn: Vector2;
  interiorName: string;
  requiredKey?: string;
  locked?: boolean;
}

export interface RegionEntrance {
  id: string;
  name: string;
  fromRegion: string;
  toRegion: string;
  position: Vector2;
  size: Vector2;
  type: EntranceType;
  sprite: string;
  collision: boolean;
  interactions: EntranceInteraction[];
  properties?: Record<string, unknown>;
  discovered: boolean;
}

export type EntranceType =
  | 'road'
  | 'path'
  | 'bridge'
  | 'cave'
  | 'hidden'
  | 'building'
  | 'teleport';

export interface EntranceInteraction {
  type: string;
  label: string;
  key: string;
  action?: string;
}

export const buildingEntrances: BuildingEntrance[] = [
  // Village buildings
  {
    buildingId: 'town_hall',
    exteriorPosition: { x: 1800, y: 1640 },
    interiorSpawn: { x: 200, y: 300 },
    exitSpawn: { x: 1800, y: 1660 },
    interiorName: "Town Hall - Mayor's Office",
  },
  {
    buildingId: 'general_store',
    exteriorPosition: { x: 1400, y: 1940 },
    interiorSpawn: { x: 200, y: 300 },
    exitSpawn: { x: 1400, y: 1960 },
    interiorName: 'General Store - Counter',
  },
  {
    buildingId: 'blacksmith',
    exteriorPosition: { x: 2200, y: 1640 },
    interiorSpawn: { x: 200, y: 300 },
    exitSpawn: { x: 2200, y: 1660 },
    interiorName: 'Blacksmith - Forge',
  },
  {
    buildingId: 'library',
    exteriorPosition: { x: 1450, y: 2090 },
    interiorSpawn: { x: 200, y: 300 },
    exitSpawn: { x: 1450, y: 2110 },
    interiorName: 'Library - Archives',
  },
  {
    buildingId: 'inn',
    exteriorPosition: { x: 2250, y: 2040 },
    interiorSpawn: { x: 200, y: 300 },
    exitSpawn: { x: 2250, y: 2060 },
    interiorName: 'Willowmere Inn - Dining Hall',
  },
  {
    buildingId: 'stables',
    exteriorPosition: { x: 2400, y: 1640 },
    interiorSpawn: { x: 200, y: 300 },
    exitSpawn: { x: 2400, y: 1660 },
    interiorName: 'Stables - Tack Room',
  },
  {
    buildingId: 'player_house',
    exteriorPosition: { x: 2000, y: 2140 },
    interiorSpawn: { x: 200, y: 300 },
    exitSpawn: { x: 2000, y: 2160 },
    interiorName: 'Player House - Cozy Room',
  },

  // Whispering Woods buildings
  {
    buildingId: 'abandoned_cabin',
    exteriorPosition: { x: 1300, y: -240 },
    interiorSpawn: { x: 200, y: 300 },
    exitSpawn: { x: 1300, y: -220 },
    interiorName: 'Abandoned Cabin - Interior',
  },

  // Ancient Ruins buildings
  {
    buildingId: 'ruins_chamber',
    exteriorPosition: { x: 3800, y: -140 },
    interiorSpawn: { x: 200, y: 300 },
    exitSpawn: { x: 3800, y: -120 },
    interiorName: 'Ancient Chamber - Depths',
  },

  // Highland Trail buildings
  {
    buildingId: 'shepherd_hut',
    exteriorPosition: { x: 400, y: -2540 },
    interiorSpawn: { x: 200, y: 300 },
    exitSpawn: { x: 400, y: -2520 },
    interiorName: "Shepherd's Hut - Interior",
  },

  // Old Shrine buildings
  {
    buildingId: 'shrine_building',
    exteriorPosition: { x: 600, y: -3540 },
    interiorSpawn: { x: 200, y: 300 },
    exitSpawn: { x: 600, y: -3520 },
    interiorName: 'Shrine Building - Inner Sanctum',
  },

  // Farmland buildings
  {
    buildingId: 'farm_house',
    exteriorPosition: { x: 550, y: 1390 },
    interiorSpawn: { x: 200, y: 300 },
    exitSpawn: { x: 550, y: 1410 },
    interiorName: 'Farm House - Living Room',
  },
  {
    buildingId: 'barn',
    exteriorPosition: { x: 400, y: 1380 },
    interiorSpawn: { x: 200, y: 300 },
    exitSpawn: { x: 400, y: 1400 },
    interiorName: 'Barn - Storage Area',
  },
];

export const regionEntrances: RegionEntrance[] = [
  // Village entrances
  {
    id: 'entrance_north_road',
    name: 'North Road',
    fromRegion: 'village',
    toRegion: 'whispering_woods',
    position: { x: 2000, y: 1000 },
    size: { x: 80, y: 60 },
    type: 'road',
    sprite: 'road_entrance',
    collision: false,
    discovered: true,
    interactions: [
      { type: 'travel', label: 'Travel to Whispering Woods', key: 'E' },
    ],
    properties: { road: true, sign: 'sign_north_road' },
  },
  {
    id: 'entrance_east_road',
    name: 'East Road',
    fromRegion: 'village',
    toRegion: 'riverside',
    position: { x: 2800, y: 1700 },
    size: { x: 60, y: 80 },
    type: 'road',
    sprite: 'road_entrance',
    collision: false,
    discovered: true,
    interactions: [
      { type: 'travel', label: 'Travel to Riverside', key: 'E' },
    ],
    properties: { road: true, sign: 'sign_east_road' },
  },
  {
    id: 'entrance_west_road',
    name: 'West Road',
    fromRegion: 'village',
    toRegion: 'farmland',
    position: { x: 1200, y: 1700 },
    size: { x: 60, y: 80 },
    type: 'road',
    sprite: 'road_entrance',
    collision: false,
    discovered: true,
    interactions: [
      { type: 'travel', label: 'Travel to Farmland', key: 'E' },
    ],
    properties: { road: true, sign: 'sign_west_road' },
  },
  {
    id: 'entrance_south_road',
    name: 'South Road',
    fromRegion: 'village',
    toRegion: 'southern_grove',
    position: { x: 2000, y: 2400 },
    size: { x: 80, y: 60 },
    type: 'road',
    sprite: 'road_entrance',
    collision: false,
    discovered: true,
    interactions: [
      { type: 'travel', label: 'Travel to Southern Grove', key: 'E' },
    ],
    properties: { road: true, sign: 'sign_south_road' },
  },

  // Whispering Woods entrances
  {
    id: 'entrance_south_village',
    name: 'South Path to Village',
    fromRegion: 'whispering_woods',
    toRegion: 'village',
    position: { x: 2000, y: 1000 },
    size: { x: 80, y: 60 },
    type: 'path',
    sprite: 'path_entrance',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'travel', label: 'Return to Village', key: 'E' },
    ],
    properties: { sign: 'sign_woods_village' },
  },
  {
    id: 'entrance_north_wilds',
    name: 'North Path to Wilds',
    fromRegion: 'whispering_woods',
    toRegion: 'northern_wilds',
    position: { x: 2000, y: -600 },
    size: { x: 60, y: 80 },
    type: 'path',
    sprite: 'path_entrance',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'travel', label: 'Enter Northern Wilds', key: 'E' },
    ],
    properties: { sign: 'sign_woods_wilds' },
  },
  {
    id: 'entrance_east_ruins',
    name: 'Overgrown Trail to Ruins',
    fromRegion: 'whispering_woods',
    toRegion: 'ancient_ruins',
    position: { x: 3000, y: 200 },
    size: { x: 40, y: 60 },
    type: 'hidden',
    sprite: 'hidden_entrance',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'travel', label: 'Follow Trail to Ruins', key: 'E' },
    ],
    properties: { sign: 'sign_woods_ruins', hidden: true },
  },
  {
    id: 'entrance_hidden_cavern',
    name: 'Hidden Cavern Entrance',
    fromRegion: 'whispering_woods',
    toRegion: 'hidden_cavern',
    position: { x: 1300, y: 100 },
    size: { x: 80, y: 60 },
    type: 'cave',
    sprite: 'cave_entrance',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'enter', label: 'Enter Hidden Cavern', key: 'E' },
    ],
    properties: { cave: true },
  },

  // Northern Wilds entrances
  {
    id: 'entrance_south_woods',
    name: 'South Path to Woods',
    fromRegion: 'northern_wilds',
    toRegion: 'whispering_woods',
    position: { x: 1700, y: -600 },
    size: { x: 60, y: 80 },
    type: 'path',
    sprite: 'path_entrance',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'travel', label: 'Return to Whispering Woods', key: 'E' },
    ],
    properties: { sign: 'sign_wilds_woods' },
  },
  {
    id: 'entrance_highland_trail',
    name: 'Mountain Trail',
    fromRegion: 'northern_wilds',
    toRegion: 'highland_trail',
    position: { x: 400, y: -2200 },
    size: { x: 40, y: 80 },
    type: 'path',
    sprite: 'path_entrance',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'travel', label: 'Ascend Highland Trail', key: 'E' },
    ],
    properties: { sign: 'sign_wilds_highland' },
  },

  // Ancient Ruins entrances
  {
    id: 'entrance_west_woods',
    name: 'West Path to Woods',
    fromRegion: 'ancient_ruins',
    toRegion: 'whispering_woods',
    position: { x: 3000, y: 200 },
    size: { x: 40, y: 60 },
    type: 'hidden',
    sprite: 'hidden_entrance',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'travel', label: 'Return to Whispering Woods', key: 'E' },
    ],
    properties: { sign: 'sign_ruins_woods', hidden: true },
  },

  // Highland Trail entrances
  {
    id: 'entrance_south_wilds',
    name: 'South Path to Wilds',
    fromRegion: 'highland_trail',
    toRegion: 'northern_wilds',
    position: { x: 400, y: -2000 },
    size: { x: 40, y: 80 },
    type: 'path',
    sprite: 'path_entrance',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'travel', label: 'Descend to Northern Wilds', key: 'E' },
    ],
    properties: { sign: 'sign_highland_wilds' },
  },
  {
    id: 'entrance_north_shrine',
    name: 'Shrine Path',
    fromRegion: 'highland_trail',
    toRegion: 'old_shrine',
    position: { x: 600, y: -3800 },
    size: { x: 40, y: 60 },
    type: 'path',
    sprite: 'path_entrance',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'travel', label: 'Ascend to Old Shrine', key: 'E' },
    ],
    properties: { sign: 'sign_highland_shrine' },
  },

  // Southern Grove entrances
  {
    id: 'entrance_north_village',
    name: 'North Path to Village',
    fromRegion: 'southern_grove',
    toRegion: 'village',
    position: { x: 2000, y: 2400 },
    size: { x: 80, y: 60 },
    type: 'road',
    sprite: 'road_entrance',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'travel', label: 'Return to Village', key: 'E' },
    ],
    properties: { sign: 'sign_grove_village' },
  },
  {
    id: 'entrance_east_hidden',
    name: 'Hidden East Trail',
    fromRegion: 'southern_grove',
    toRegion: 'whispering_woods',
    position: { x: 2800, y: 3100 },
    size: { x: 40, y: 60 },
    type: 'hidden',
    sprite: 'hidden_entrance',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'travel', label: 'Follow Hidden Trail', key: 'E' },
    ],
    properties: { sign: 'sign_grove_hidden', hidden: true },
  },

  // Farmland entrances
  {
    id: 'entrance_east_village',
    name: 'East Road to Village',
    fromRegion: 'farmland',
    toRegion: 'village',
    position: { x: 1200, y: 1700 },
    size: { x: 60, y: 80 },
    type: 'road',
    sprite: 'road_entrance',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'travel', label: 'Travel to Village', key: 'E' },
    ],
    properties: { sign: 'sign_farm_village' },
  },
  {
    id: 'entrance_north_forest',
    name: 'North Path to Woods',
    fromRegion: 'farmland',
    toRegion: 'whispering_woods',
    position: { x: 600, y: 2400 },
    size: { x: 40, y: 60 },
    type: 'path',
    sprite: 'path_entrance',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'travel', label: 'Enter Whispering Woods', key: 'E' },
    ],
    properties: { sign: 'sign_farm_forest' },
  },
];

export function getBuildingEntrance(buildingId: string): BuildingEntrance | undefined {
  return buildingEntrances.find(e => e.buildingId === buildingId);
}

export function getRegionEntrance(entranceId: string): RegionEntrance | undefined {
  return regionEntrances.find(e => e.id === entranceId);
}

export function getRegionEntrances(fromRegion: string): RegionEntrance[] {
  return regionEntrances.filter(e => e.fromRegion === fromRegion);
}

export function getEntranceAtPosition(
  position: Vector2,
  radius: number = 50
): RegionEntrance | undefined {
  return regionEntrances.find(entrance => {
    const dx = entrance.position.x - position.x;
    const dy = entrance.position.y - position.y;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  });
}

export function getBuildingAtPosition(
  position: Vector2,
  radius: number = 50
): BuildingEntrance | undefined {
  for (const entrance of buildingEntrances) {
    const dx = entrance.exteriorPosition.x - position.x;
    const dy = entrance.exteriorPosition.y - position.y;
    if (Math.sqrt(dx * dx + dy * dy) <= radius) {
      return entrance;
    }
  }
  return undefined;
}

export function getRegionEntranceBetween(fromRegion: string, toRegion: string): RegionEntrance | undefined {
  return regionEntrances.find(e => e.fromRegion === fromRegion && e.toRegion === toRegion);
}

export function markEntranceDiscovered(entranceId: string): void {
  const entrance = regionEntrances.find(e => e.id === entranceId);
  if (entrance) {
    entrance.discovered = true;
  }
}

export function isEntranceDiscovered(entranceId: string): boolean {
  const entrance = regionEntrances.find(e => e.id === entranceId);
  return entrance?.discovered ?? false;
}

export function getAllBuildingEntrances(): BuildingEntrance[] {
  return buildingEntrances;
}

export function getAllRegionEntrances(): RegionEntrance[] {
  return regionEntrances;
}