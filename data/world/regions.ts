import type { Vector2 } from '@shared/types';
import type { TerrainType } from './terrain';

export interface WorldRegion {
  id: string;
  name: string;
  displayName: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  ambientColor: string;
  music?: string;
  ambientLighting: {
    day: string;
    evening: string;
    night: string;
  };
  weatherAffinity: WeatherAffinity;
  landmarks: string[];
  entrances: string[];
  npcs: string[];
  questLocations: string[];
  terrainPalette: TerrainType[];
  discoveryRadius: number;
  fogOfWar: boolean;
  transitionZones?: RegionTransitionZone[];
  boundaryType?: RegionBoundaryType;
}

export type WeatherAffinity = 'temperate' | 'forest' | 'highland' | 'riverside' | 'ruins' | 'cavern' | 'mountain' | 'coastal';

export type RegionBoundaryType = 
  | 'cliff'
  | 'dense_forest'
  | 'river'
  | 'mountain_pass'
  | 'cave_entrance'
  | 'open_plains'
  | 'coastal_shore'
  | 'ruined_wall'
  | 'stone_archway'
  | 'wooden_gate';

export interface RegionTransitionZone {
  id: string;
  connectedRegionId: string;
  entranceId: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  boundaryType: RegionBoundaryType;
  transitionWidth: number;
  terrainBlend: TerrainType[];
  landmarkIds?: string[];
  objectIds?: string[];
}

export interface RegionConnection {
  from: string;
  to: string;
  entranceId: string;
  type: 'road' | 'path' | 'bridge' | 'hidden' | 'cave' | 'mountain_pass' | 'river';
  name: string;
}

export const regions: WorldRegion[] = [
  {
    id: 'village',
    name: 'Willowmere Village',
    displayName: 'Willowmere Village',
    bounds: { x: 2000, y: 1500, width: 2000, height: 1600 },
    ambientColor: '#f5f0e6',
    music: 'village_theme',
    ambientLighting: {
      day: '#f5f0e6',
      evening: '#ffcc80',
      night: '#2b1b17',
    },
    weatherAffinity: 'temperate',
    landmarks: [
      'fountain_town_square',
      'notice_board_town',
      'building_town_hall',
      'building_general_store',
      'building_blacksmith',
      'building_inn',
      'building_library',
      'building_player_house',
      'clock_tower_village',
      'pond_main',
    ],
    entrances: [
      'entrance_north_road',
      'entrance_east_road',
      'entrance_west_road',
      'entrance_south_road',
    ],
    npcs: [
      'npc_arthur',
      'npc_elara',
      'npc_bram',
      'npc_lily',
      'npc_finn',
      'npc_mira',
      'npc_tom',
      'npc_nora',
      'npc_walter',
      'npc_sasha',
    ],
    questLocations: [
      'quest_welcome_willowmere',
      'quest_tool_repair',
      'quest_flower_hunt',
      'quest_bread_delivery',
      'quest_sketch_hunt',
    ],
    terrainPalette: ['grass', 'dirt', 'path', 'stone', 'shallow_water'],
    discoveryRadius: 0,
    fogOfWar: false,
    boundaryType: 'open_plains',
    transitionZones: [
      {
        id: 'village_to_woods_transition',
        connectedRegionId: 'whispering_woods',
        entranceId: 'entrance_north_road',
        bounds: { x: 2000, y: 1500, width: 2000, height: 100 },
        boundaryType: 'dense_forest',
        transitionWidth: 100,
        terrainBlend: ['grass', 'forest_floor', 'dirt', 'path'],
        landmarkIds: ['hidden_forest_path'],
      },
      {
        id: 'village_to_riverside_transition',
        connectedRegionId: 'riverside',
        entranceId: 'entrance_east_road',
        bounds: { x: 3900, y: 1500, width: 200, height: 1600 },
        boundaryType: 'river',
        transitionWidth: 200,
        terrainBlend: ['grass', 'dirt', 'sand', 'shallow_water', 'path', 'bridge'],
        landmarkIds: ['wooden_bridge'],
      },
      {
        id: 'village_to_camp_transition',
        connectedRegionId: 'abandoned_camp',
        entranceId: 'entrance_west_road',
        bounds: { x: 2000, y: 1500, width: 200, height: 1600 },
        boundaryType: 'dense_forest',
        transitionWidth: 100,
        terrainBlend: ['grass', 'dirt', 'forest_floor', 'path'],
      },
      {
        id: 'village_to_grove_transition',
        connectedRegionId: 'hidden_grove',
        entranceId: 'entrance_south_road',
        bounds: { x: 2000, y: 3000, width: 2000, height: 100 },
        boundaryType: 'dense_forest',
        transitionWidth: 100,
        terrainBlend: ['grass', 'forest_floor', 'dirt', 'path'],
      },
    ],
  },
  {
    id: 'riverside',
    name: 'Riverside',
    displayName: 'Riverside Basin',
    bounds: { x: 4000, y: 1500, width: 2000, height: 1600 },
    ambientColor: '#e3f2fd',
    music: 'riverside_theme',
    ambientLighting: {
      day: '#e3f2fd',
      evening: '#ffccbc',
      night: '#101a42',
    },
    weatherAffinity: 'riverside',
    landmarks: [
      'fishing_dock',
      'great_waterfall',
      'wooden_bridge',
      'gardener_garden',
      'riverside_campsite',
      'river_main',
    ],
    entrances: [
      'entrance_east_road',
      'entrance_riverside_north',
      'entrance_lakeside_south',
    ],
    npcs: ['npc_fisherman', 'npc_river_merchant'],
    questLocations: ['quest_fresh_catch', 'quest_lost_lantern'],
    terrainPalette: ['grass', 'dirt', 'sand', 'shallow_water', 'deep_water', 'river', 'path', 'bridge'],
    discoveryRadius: 250,
    fogOfWar: true,
    boundaryType: 'river',
    transitionZones: [
      {
        id: 'riverside_to_village_transition',
        connectedRegionId: 'village',
        entranceId: 'entrance_east_road',
        bounds: { x: 4000, y: 1500, width: 200, height: 1600 },
        boundaryType: 'river',
        transitionWidth: 200,
        terrainBlend: ['grass', 'dirt', 'sand', 'shallow_water', 'path', 'bridge'],
        landmarkIds: ['wooden_bridge'],
      },
      {
        id: 'riverside_to_woods_transition',
        connectedRegionId: 'whispering_woods',
        entranceId: 'entrance_riverside_north',
        bounds: { x: 4000, y: 1500, width: 2000, height: 100 },
        boundaryType: 'dense_forest',
        transitionWidth: 100,
        terrainBlend: ['sand', 'grass', 'forest_floor', 'path'],
      },
      {
        id: 'riverside_to_lakeside_transition',
        connectedRegionId: 'lakeside',
        entranceId: 'entrance_lakeside_south',
        bounds: { x: 4000, y: 3000, width: 2000, height: 100 },
        boundaryType: 'river',
        transitionWidth: 200,
        terrainBlend: ['sand', 'shallow_water', 'deep_water', 'river', 'grass', 'mud', 'bridge'],
        landmarkIds: ['mirror_lake'],
      },
    ],
  },
  {
    id: 'whispering_woods',
    name: 'Whispering Woods',
    displayName: 'Whispering Woods',
    bounds: { x: 2000, y: 0, width: 2000, height: 1500 },
    ambientColor: '#c8e6c9',
    music: 'forest_theme',
    ambientLighting: {
      day: '#c8e6c9',
      evening: '#8d6e63',
      night: '#133b16',
    },
    weatherAffinity: 'forest',
    landmarks: [
      'giant_ancient_tree',
      'woods_shrine',
      'mysterious_stone',
      'abandoned_cabin',
      'hidden_forest_path',
      'glowing_mushroom_hollow',
    ],
    entrances: [
      'entrance_north_road',
      'entrance_forest_mountains',
      'entrance_forest_ruins',
      'entrance_hidden_cave',
    ],
    npcs: ['npc_ranger', 'npc_traveler', 'npc_mysterious'],
    questLocations: ['quest_ancient_history', 'quest_lost_lantern', 'quest_forest_spirit'],
    terrainPalette: ['forest_floor', 'dirt', 'grass', 'stone', 'shallow_water', 'path', 'mud'],
    discoveryRadius: 300,
    fogOfWar: true,
    boundaryType: 'dense_forest',
    transitionZones: [
      {
        id: 'woods_to_village_transition',
        connectedRegionId: 'village',
        entranceId: 'entrance_north_road',
        bounds: { x: 2000, y: 1400, width: 2000, height: 100 },
        boundaryType: 'dense_forest',
        transitionWidth: 100,
        terrainBlend: ['forest_floor', 'grass', 'dirt', 'path'],
      },
      {
        id: 'woods_to_mountains_transition',
        connectedRegionId: 'northern_mountains',
        entranceId: 'entrance_forest_mountains',
        bounds: { x: 2000, y: 0, width: 2000, height: 100 },
        boundaryType: 'mountain_pass',
        transitionWidth: 100,
        terrainBlend: ['forest_floor', 'stone', 'mountain', 'path', 'cliff'],
      },
      {
        id: 'woods_to_ruins_transition',
        connectedRegionId: 'ancient_ruins',
        entranceId: 'entrance_forest_ruins',
        bounds: { x: 3900, y: 0, width: 100, height: 1500 },
        boundaryType: 'ruined_wall',
        transitionWidth: 100,
        terrainBlend: ['forest_floor', 'ruins', 'stone', 'grass'],
      },
      {
        id: 'woods_to_cave_transition',
        connectedRegionId: 'cave_underground',
        entranceId: 'entrance_hidden_cave',
        bounds: { x: 3800, y: 200, width: 200, height: 200 },
        boundaryType: 'cave_entrance',
        transitionWidth: 50,
        terrainBlend: ['forest_floor', 'stone', 'cave_floor'],
      },
    ],
  },
  {
    id: 'southern_farmland',
    name: 'Southern Farmland',
    displayName: 'Southern Farmland',
    bounds: { x: 0, y: 2800, width: 2000, height: 1700 },
    ambientColor: '#f1f8e9',
    music: 'farmland_theme',
    ambientLighting: {
      day: '#f1f8e9',
      evening: '#fff3e0',
      night: '#224013',
    },
    weatherAffinity: 'temperate',
    landmarks: [
      'farm_windmill',
      'crop_field_wheat',
      'crop_field_pumpkin',
      'orchard_apple',
      'animal_pen_cow',
      'farm_barn',
      'farmland_well',
    ],
    entrances: [
      'entrance_farmland_village',
      'entrance_farmland_grove',
    ],
    npcs: ['npc_farmer_walter', 'npc_farmhand_1', 'npc_farmhand_2'],
    questLocations: ['quest_crop_harvest', 'quest_farm_help'],
    terrainPalette: ['farmland', 'dirt', 'grass', 'path', 'mud', 'shallow_water'],
    discoveryRadius: 200,
    fogOfWar: true,
    boundaryType: 'open_plains',
    transitionZones: [
      {
        id: 'farmland_to_village_transition',
        connectedRegionId: 'village',
        entranceId: 'entrance_farmland_village',
        bounds: { x: 1900, y: 2800, width: 200, height: 1700 },
        boundaryType: 'open_plains',
        transitionWidth: 200,
        terrainBlend: ['farmland', 'grass', 'dirt', 'path'],
      },
      {
        id: 'farmland_to_grove_transition',
        connectedRegionId: 'hidden_grove',
        entranceId: 'entrance_farmland_grove',
        bounds: { x: 1900, y: 3400, width: 200, height: 1100 },
        boundaryType: 'dense_forest',
        transitionWidth: 100,
        terrainBlend: ['farmland', 'grass', 'forest_floor', 'dirt', 'path'],
      },
    ],
  },
  {
    id: 'ancient_ruins',
    name: 'Ancient Ruins',
    displayName: 'Ancient Ruins',
    bounds: { x: 4000, y: 0, width: 2000, height: 1500 },
    ambientColor: '#eceff1',
    music: 'ruins_theme',
    ambientLighting: {
      day: '#eceff1',
      evening: '#b0bec5',
      night: '#1c252a',
    },
    weatherAffinity: 'ruins',
    landmarks: [
      'ruined_tower_peak',
      'ruins_gate',
      'broken_pillar_hall',
      'ruins_chamber',
      'ancient_well',
      'statue_guardian',
    ],
    entrances: [
      'entrance_forest_ruins',
      'entrance_ruins_cave',
    ],
    npcs: ['npc_researcher', 'npc_explorer'],
    questLocations: ['quest_ruins_mystery', 'quest_ancient_artifact'],
    terrainPalette: ['ruins', 'stone', 'grass', 'forest_floor', 'cliff'],
    discoveryRadius: 300,
    fogOfWar: true,
    boundaryType: 'ruined_wall',
    transitionZones: [
      {
        id: 'ruins_to_woods_transition',
        connectedRegionId: 'whispering_woods',
        entranceId: 'entrance_forest_ruins',
        bounds: { x: 4000, y: 0, width: 100, height: 1500 },
        boundaryType: 'ruined_wall',
        transitionWidth: 100,
        terrainBlend: ['ruins', 'forest_floor', 'stone', 'grass'],
      },
      {
        id: 'ruins_to_cave_transition',
        connectedRegionId: 'cave_underground',
        entranceId: 'entrance_ruins_cave',
        bounds: { x: 4000, y: 1300, width: 2000, height: 200 },
        boundaryType: 'cave_entrance',
        transitionWidth: 100,
        terrainBlend: ['ruins', 'stone', 'cave_floor'],
      },
    ],
  },
  {
    id: 'northern_mountains',
    name: 'Northern Mountains',
    displayName: 'Northern Mountains',
    bounds: { x: 2000, y: -1500, width: 2000, height: 1500 },
    ambientColor: '#cfd8dc',
    music: 'mountain_theme',
    ambientLighting: {
      day: '#e0f7fa',
      evening: '#b2ebf2',
      night: '#1a2a3a',
    },
    weatherAffinity: 'mountain',
    landmarks: [
      'mountain_peak_overlook',
      'mountain_pass_bridge',
      'frost_cavern_mouth',
      'avalanche_ridge',
    ],
    entrances: [
      'entrance_forest_mountains',
      'entrance_highland_mountains',
    ],
    npcs: ['npc_mountain_climber', 'npc_hermit'],
    questLocations: ['quest_mountain_peak', 'quest_rare_minerals'],
    terrainPalette: ['mountain', 'snow', 'stone', 'cliff', 'path'],
    discoveryRadius: 400,
    fogOfWar: true,
    boundaryType: 'mountain_pass',
    transitionZones: [
      {
        id: 'mountains_to_woods_transition',
        connectedRegionId: 'whispering_woods',
        entranceId: 'entrance_forest_mountains',
        bounds: { x: 2000, y: 0, width: 2000, height: 100 },
        boundaryType: 'mountain_pass',
        transitionWidth: 100,
        terrainBlend: ['mountain', 'stone', 'forest_floor', 'path', 'cliff'],
      },
      {
        id: 'mountains_to_highland_transition',
        connectedRegionId: 'highland_trail',
        entranceId: 'entrance_highland_mountains',
        bounds: { x: 2000, y: -1500, width: 2000, height: 100 },
        boundaryType: 'mountain_pass',
        transitionWidth: 100,
        terrainBlend: ['mountain', 'stone', 'grass', 'path', 'bridge', 'cliff'],
        landmarkIds: ['mountain_pass_bridge'],
      },
    ],
  },
  {
    id: 'highland_trail',
    name: 'Highland Trail',
    displayName: 'Highland Trail',
    bounds: { x: 0, y: -1500, width: 2000, height: 1500 },
    ambientColor: '#d7ccc8',
    music: 'highland_theme',
    ambientLighting: {
      day: '#cfd8dc',
      evening: '#ffb74d',
      night: '#1c2833',
    },
    weatherAffinity: 'highland',
    landmarks: [
      'highland_cliff_edge',
      'shepherd_highland_hut',
      'stone_arch_bridge',
      'windy_ridge_lookout',
    ],
    entrances: [
      'entrance_highland_mountains',
      'entrance_highland_shrine',
      'entrance_camp_highland',
    ],
    npcs: ['npc_shepherd', 'npc_mountain_guide'],
    questLocations: ['quest_highland_flowers', 'quest_lost_sheep'],
    terrainPalette: ['mountain', 'stone', 'grass', 'path', 'bridge', 'cliff'],
    discoveryRadius: 350,
    fogOfWar: true,
    boundaryType: 'cliff',
    transitionZones: [
      {
        id: 'highland_to_mountains_transition',
        connectedRegionId: 'northern_mountains',
        entranceId: 'entrance_highland_mountains',
        bounds: { x: 0, y: -1400, width: 2000, height: 100 },
        boundaryType: 'mountain_pass',
        transitionWidth: 100,
        terrainBlend: ['mountain', 'stone', 'grass', 'path', 'bridge', 'cliff'],
      },
      {
        id: 'highland_to_shrine_transition',
        connectedRegionId: 'old_shrine',
        entranceId: 'entrance_highland_shrine',
        bounds: { x: 0, y: -3000, width: 2000, height: 100 },
        boundaryType: 'stone_archway',
        transitionWidth: 100,
        terrainBlend: ['mountain', 'stone', 'path', 'snow', 'ruins'],
      },
      {
        id: 'highland_to_camp_transition',
        connectedRegionId: 'abandoned_camp',
        entranceId: 'entrance_camp_highland',
        bounds: { x: 0, y: 1300, width: 2000, height: 100 },
        boundaryType: 'cliff',
        transitionWidth: 100,
        terrainBlend: ['stone', 'grass', 'dirt', 'forest_floor', 'path'],
      },
    ],
  },
  {
    id: 'old_shrine',
    name: 'Old Shrine',
    displayName: 'Old Mountain Shrine',
    bounds: { x: 0, y: -3000, width: 2000, height: 1500 },
    ambientColor: '#f3e5f5',
    music: 'shrine_theme',
    ambientLighting: {
      day: '#f3e5f5',
      evening: '#e1bee7',
      night: '#311b92',
    },
    weatherAffinity: 'highland',
    landmarks: [
      'ancient_sanctuary_shrine',
      'offering_altar',
      'eternal_flame_brazier',
      'sacred_stone_circle',
    ],
    entrances: [
      'entrance_highland_shrine',
    ],
    npcs: ['npc_shrine_keeper'],
    questLocations: ['quest_shrine_blessing', 'quest_eternal_flame'],
    terrainPalette: ['stone', 'grass', 'path', 'snow', 'ruins'],
    discoveryRadius: 200,
    fogOfWar: true,
    boundaryType: 'stone_archway',
    transitionZones: [
      {
        id: 'shrine_to_highland_transition',
        connectedRegionId: 'highland_trail',
        entranceId: 'entrance_highland_shrine',
        bounds: { x: 0, y: -1500, width: 2000, height: 100 },
        boundaryType: 'stone_archway',
        transitionWidth: 100,
        terrainBlend: ['stone', 'grass', 'path', 'snow', 'ruins'],
      },
    ],
  },
  {
    id: 'hidden_grove',
    name: 'Hidden Grove',
    displayName: 'Hidden Grove',
    bounds: { x: 2000, y: 3100, width: 2000, height: 1400 },
    ambientColor: '#e8f5e9',
    music: 'grove_theme',
    ambientLighting: {
      day: '#e8f5e9',
      evening: '#ffcc80',
      night: '#0d3813',
    },
    weatherAffinity: 'forest',
    landmarks: [
      'healing_spring_pool',
      'fairy_ring_mushrooms',
      'ancient_wooden_bench',
      'flower_clearing_sanctuary',
    ],
    entrances: [
      'entrance_south_road',
      'entrance_farmland_grove',
      'entrance_grove_lakeside',
    ],
    npcs: ['npc_druid', 'npc_gatherer'],
    questLocations: ['quest_healing_herbs', 'quest_fairy_ring'],
    terrainPalette: ['grass', 'forest_floor', 'dirt', 'shallow_water', 'path'],
    discoveryRadius: 200,
    fogOfWar: true,
    boundaryType: 'dense_forest',
    transitionZones: [
      {
        id: 'grove_to_village_transition',
        connectedRegionId: 'village',
        entranceId: 'entrance_south_road',
        bounds: { x: 2000, y: 3100, width: 2000, height: 100 },
        boundaryType: 'dense_forest',
        transitionWidth: 100,
        terrainBlend: ['grass', 'forest_floor', 'dirt', 'path'],
      },
      {
        id: 'grove_to_farmland_transition',
        connectedRegionId: 'southern_farmland',
        entranceId: 'entrance_farmland_grove',
        bounds: { x: 2000, y: 4400, width: 2000, height: 100 },
        boundaryType: 'dense_forest',
        transitionWidth: 100,
        terrainBlend: ['grass', 'forest_floor', 'farmland', 'dirt', 'path'],
      },
      {
        id: 'grove_to_lakeside_transition',
        connectedRegionId: 'lakeside',
        entranceId: 'entrance_grove_lakeside',
        bounds: { x: 3900, y: 3100, width: 100, height: 1400 },
        boundaryType: 'coastal_shore',
        transitionWidth: 100,
        terrainBlend: ['grass', 'forest_floor', 'sand', 'shallow_water', 'mud'],
      },
    ],
  },
  {
    id: 'lakeside',
    name: 'Lakeside',
    displayName: 'Lakeside Haven',
    bounds: { x: 4000, y: 3100, width: 2000, height: 1400 },
    ambientColor: '#e0f7fa',
    music: 'lakeside_theme',
    ambientLighting: {
      day: '#e0f7fa',
      evening: '#ffe0b2',
      night: '#002f4b',
    },
    weatherAffinity: 'coastal',
    landmarks: [
      'mirror_lake',
      'lakeside_boathouse',
      'lakeside_pier',
      'reed_marshland',
    ],
    entrances: [
      'entrance_lakeside_south',
      'entrance_grove_lakeside',
    ],
    npcs: ['npc_boat_captain', 'npc_lakeside_fisher'],
    questLocations: ['quest_lake_monster', 'quest_lost_oar'],
    terrainPalette: ['sand', 'shallow_water', 'deep_water', 'grass', 'mud', 'bridge'],
    discoveryRadius: 300,
    fogOfWar: true,
    boundaryType: 'coastal_shore',
    transitionZones: [
      {
        id: 'lakeside_to_riverside_transition',
        connectedRegionId: 'riverside',
        entranceId: 'entrance_lakeside_south',
        bounds: { x: 4000, y: 3100, width: 2000, height: 100 },
        boundaryType: 'river',
        transitionWidth: 200,
        terrainBlend: ['sand', 'shallow_water', 'deep_water', 'river', 'grass', 'mud', 'bridge'],
      },
      {
        id: 'lakeside_to_grove_transition',
        connectedRegionId: 'hidden_grove',
        entranceId: 'entrance_grove_lakeside',
        bounds: { x: 4000, y: 3100, width: 100, height: 1400 },
        boundaryType: 'coastal_shore',
        transitionWidth: 100,
        terrainBlend: ['sand', 'grass', 'forest_floor', 'shallow_water', 'mud'],
      },
    ],
  },
  {
    id: 'abandoned_camp',
    name: 'Abandoned Camp',
    displayName: 'Abandoned Explorer Camp',
    bounds: { x: 0, y: 1300, width: 2000, height: 1500 },
    ambientColor: '#efebe9',
    music: 'camp_theme',
    ambientLighting: {
      day: '#efebe9',
      evening: '#d7ccc8',
      night: '#271c19',
    },
    weatherAffinity: 'forest',
    landmarks: [
      'tattered_tents',
      'extinguished_campfire',
      'overturned_wagon',
      'old_supply_crates',
    ],
    entrances: [
      'entrance_west_road',
      'entrance_camp_highland',
    ],
    npcs: ['npc_scavenger'],
    questLocations: ['quest_camp_investigation', 'quest_lost_journal'],
    terrainPalette: ['dirt', 'grass', 'stone', 'forest_floor', 'mud'],
    discoveryRadius: 250,
    fogOfWar: true,
    boundaryType: 'dense_forest',
    transitionZones: [
      {
        id: 'camp_to_village_transition',
        connectedRegionId: 'village',
        entranceId: 'entrance_west_road',
        bounds: { x: 2000, y: 1300, width: 200, height: 1500 },
        boundaryType: 'dense_forest',
        transitionWidth: 100,
        terrainBlend: ['dirt', 'grass', 'forest_floor', 'path'],
      },
      {
        id: 'camp_to_highland_transition',
        connectedRegionId: 'highland_trail',
        entranceId: 'entrance_camp_highland',
        bounds: { x: 0, y: 1300, width: 2000, height: 100 },
        boundaryType: 'cliff',
        transitionWidth: 100,
        terrainBlend: ['dirt', 'grass', 'stone', 'forest_floor', 'path', 'cliff'],
      },
    ],
  },
  {
    id: 'cave_underground',
    name: 'Cave/Underground Area',
    displayName: 'Subterranean Caverns',
    bounds: { x: 4000, y: -1500, width: 2000, height: 1500 },
    ambientColor: '#1a1a24',
    music: 'cavern_theme',
    ambientLighting: {
      day: '#1a1a24',
      evening: '#1a1a24',
      night: '#0a0a10',
    },
    weatherAffinity: 'cavern',
    landmarks: [
      'crystal_chamber_cave',
      'underground_waterfall_pool',
      'glowing_ore_vein',
      'ancient_fossil_wall',
    ],
    entrances: [
      'entrance_hidden_cave',
      'entrance_ruins_cave',
    ],
    npcs: ['npc_cave_explorer', 'npc_miner'],
    questLocations: ['quest_cavern_crystals', 'quest_lost_miner'],
    terrainPalette: ['cave_floor', 'stone', 'shallow_water', 'cliff'],
    discoveryRadius: 150,
    fogOfWar: true,
    boundaryType: 'cave_entrance',
    transitionZones: [
      {
        id: 'cave_to_woods_transition',
        connectedRegionId: 'whispering_woods',
        entranceId: 'entrance_hidden_cave',
        bounds: { x: 3800, y: -1500, width: 200, height: 200 },
        boundaryType: 'cave_entrance',
        transitionWidth: 50,
        terrainBlend: ['cave_floor', 'stone', 'forest_floor'],
      },
      {
        id: 'cave_to_ruins_transition',
        connectedRegionId: 'ancient_ruins',
        entranceId: 'entrance_ruins_cave',
        bounds: { x: 4000, y: -1500, width: 2000, height: 200 },
        boundaryType: 'cave_entrance',
        transitionWidth: 100,
        terrainBlend: ['cave_floor', 'stone', 'ruins'],
      },
    ],
  },
];

export const regionConnections: RegionConnection[] = [
  { from: 'village', to: 'whispering_woods', entranceId: 'entrance_north_road', type: 'road', name: 'North Road' },
  { from: 'village', to: 'riverside', entranceId: 'entrance_east_road', type: 'road', name: 'East Road' },
  { from: 'village', to: 'abandoned_camp', entranceId: 'entrance_west_road', type: 'road', name: 'West Road' },
  { from: 'village', to: 'hidden_grove', entranceId: 'entrance_south_road', type: 'road', name: 'South Road' },
  { from: 'whispering_woods', to: 'northern_mountains', entranceId: 'entrance_forest_mountains', type: 'mountain_pass', name: 'Mountain Pass North' },
  { from: 'whispering_woods', to: 'ancient_ruins', entranceId: 'entrance_forest_ruins', type: 'hidden', name: 'Overgrown Ruins Path' },
  { from: 'whispering_woods', to: 'cave_underground', entranceId: 'entrance_hidden_cave', type: 'cave', name: 'Cavern Entrance' },
  { from: 'northern_mountains', to: 'highland_trail', entranceId: 'entrance_highland_mountains', type: 'path', name: 'Highland Ridge Path' },
  { from: 'highland_trail', to: 'old_shrine', entranceId: 'entrance_highland_shrine', type: 'path', name: 'Sacred Ascent' },
  { from: 'abandoned_camp', to: 'highland_trail', entranceId: 'entrance_camp_highland', type: 'path', name: 'West Trail Ascent' },
  { from: 'southern_farmland', to: 'village', entranceId: 'entrance_farmland_village', type: 'road', name: 'Farmland Access' },
  { from: 'southern_farmland', to: 'hidden_grove', entranceId: 'entrance_farmland_grove', type: 'path', name: 'Grove Meadow Trail' },
  { from: 'hidden_grove', to: 'lakeside', entranceId: 'entrance_grove_lakeside', type: 'path', name: 'Lakeside Way' },
  { from: 'riverside', to: 'lakeside', entranceId: 'entrance_lakeside_south', type: 'river', name: 'River Basin Outlet' },
  { from: 'ancient_ruins', to: 'cave_underground', entranceId: 'entrance_ruins_cave', type: 'cave', name: 'Ruins Crypt Entrance' },
];

export function getRegionById(id: string): WorldRegion | undefined {
  return regions.find(r => r.id === id);
}

export function getRegionAtPosition(position: Vector2): WorldRegion | undefined {
  return regions.find(region => {
    const { x, y, width, height } = region.bounds;
    return position.x >= x && position.x <= x + width &&
           position.y >= y && position.y <= y + height;
  });
}

export function getConnectedRegions(regionId: string): RegionConnection[] {
  return regionConnections.filter(c => c.from === regionId || c.to === regionId);
}