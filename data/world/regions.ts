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
}

export type WeatherAffinity = 'temperate' | 'forest' | 'highland' | 'riverside' | 'ruins' | 'cavern';

export interface RegionConnection {
  from: string;
  to: string;
  entranceId: string;
  type: 'road' | 'path' | 'bridge' | 'hidden' | 'cave';
  name: string;
}

export const regions: WorldRegion[] = [
  {
    id: 'village',
    name: 'Willowmere Village',
    displayName: 'Willowmere Village',
    bounds: { x: 1200, y: 1000, width: 1600, height: 1400 },
    ambientColor: '#f5f0e6',
    music: 'village_theme',
    ambientLighting: {
      day: '#f5f0e6',
      evening: '#ffcc80',
      night: '#3e2723',
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
    terrainPalette: ['grass', 'dirt', 'path', 'shallow_water'],
    discoveryRadius: 0,
    fogOfWar: false,
  },
  {
    id: 'riverside',
    name: 'Riverside',
    displayName: 'Riverside',
    bounds: { x: 2800, y: 1200, width: 1400, height: 1600 },
    ambientColor: '#e3f2fd',
    music: 'riverside_theme',
    ambientLighting: {
      day: '#e3f2fd',
      evening: '#ffccbc',
      night: '#1a237e',
    },
    weatherAffinity: 'riverside',
    landmarks: [
      'fishing_dock',
      'waterfall',
      'wooden_bridge',
      'gardener_garden',
      'campsite',
      'cave_entrance_riverside',
      'river_main',
    ],
    entrances: [
      'entrance_west_road',
      'entrance_north_mountain',
    ],
    npcs: ['npc_fisherman'],
    questLocations: ['quest_fresh_catch', 'quest_lost_lantern'],
    terrainPalette: ['grass', 'dirt', 'sand', 'shallow_water', 'deep_water', 'path', 'bridge'],
    discoveryRadius: 200,
    fogOfWar: true,
  },
  {
    id: 'whispering_woods',
    name: 'Whispering Woods',
    displayName: 'Whispering Woods',
    bounds: { x: 1000, y: -600, width: 2000, height: 1800 },
    ambientColor: '#c8e6c9',
    music: 'forest_theme',
    ambientLighting: {
      day: '#c8e6c9',
      evening: '#8d6e63',
      night: '#1b5e20',
    },
    weatherAffinity: 'forest',
    landmarks: [
      'ancient_tree',
      'woods_shrine',
      'mysterious_stone',
      'abandoned_cabin',
      'hidden_path',
      'secret_grove',
      'glowing_mushroom',
      'deer_1',
      'fox_1',
    ],
    entrances: [
      'entrance_south_village',
      'entrance_north_wilds',
      'entrance_east_ruins',
      'entrance_hidden_cavern',
    ],
    npcs: ['npc_ranger', 'npc_traveler', 'npc_mysterious'],
    questLocations: ['quest_ancient_history', 'quest_lost_lantern', 'quest_forest_spirit'],
    terrainPalette: ['forest_floor', 'dirt', 'grass', 'stone', 'shallow_water', 'path'],
    discoveryRadius: 300,
    fogOfWar: true,
  },
  {
    id: 'northern_wilds',
    name: 'Northern Wilds',
    displayName: 'Northern Wilds',
    bounds: { x: 800, y: -2200, width: 1800, height: 1600 },
    ambientColor: '#d7ccc8',
    music: 'wilds_theme',
    ambientLighting: {
      day: '#d7ccc8',
      evening: '#a1887f',
      night: '#37474f',
    },
    weatherAffinity: 'highland',
    landmarks: [
      'wilds_lookout',
      'rock_formation_1',
      'rock_formation_2',
      'wild_berry_bushes',
      'abandoned_camp',
      'wolf_den',
    ],
    entrances: [
      'entrance_south_woods',
      'entrance_highland_trail',
    ],
    npcs: ['npc_hunter', 'npc_hermit'],
    questLocations: ['quest_hunters_trophy', 'quest_wild_herbs'],
    terrainPalette: ['grass', 'dirt', 'stone', 'mountain', 'path'],
    discoveryRadius: 400,
    fogOfWar: true,
  },
  {
    id: 'ancient_ruins',
    name: 'Ancient Ruins',
    displayName: 'Ancient Ruins',
    bounds: { x: 3000, y: -600, width: 1600, height: 1400 },
    ambientColor: '#eceff1',
    music: 'ruins_theme',
    ambientLighting: {
      day: '#eceff1',
      evening: '#b0bec5',
      night: '#263238',
    },
    weatherAffinity: 'ruins',
    landmarks: [
      'ruins_gate',
      'broken_pillar_1',
      'broken_pillar_2',
      'ruins_chamber',
      'puzzle_pedestal',
      'statue_guardian',
      'ancient_well',
    ],
    entrances: [
      'entrance_west_woods',
      'entrance_south_hidden',
    ],
    npcs: ['npc_researcher', 'npc_explorer'],
    questLocations: ['quest_ruins_mystery', 'quest_ancient_artifact'],
    terrainPalette: ['ruins', 'stone', 'grass', 'forest_floor'],
    discoveryRadius: 300,
    fogOfWar: true,
  },
  {
    id: 'highland_trail',
    name: 'Highland Trail',
    displayName: 'Highland Trail',
    bounds: { x: -200, y: -2000, width: 1200, height: 2000 },
    ambientColor: '#cfd8dc',
    music: 'highland_theme',
    ambientLighting: {
      day: '#cfd8dc',
      evening: '#ffb74d',
      night: '#263238',
    },
    weatherAffinity: 'highland',
    landmarks: [
      'cliff_edge',
      'mountain_path',
      'waterfall_highland',
      'lookout_point',
      'old_bridge_highland',
      'shepherd_hut',
    ],
    entrances: [
      'entrance_south_wilds',
      'entrance_north_shrine',
    ],
    npcs: ['npc_shepherd', 'npc_mountain_guide'],
    questLocations: ['quest_highland_flowers', 'quest_lost_sheep'],
    terrainPalette: ['mountain', 'stone', 'grass', 'path', 'bridge'],
    discoveryRadius: 500,
    fogOfWar: true,
  },
  {
    id: 'old_shrine',
    name: 'Old Shrine',
    displayName: 'Old Shrine',
    bounds: { x: 200, y: -3800, width: 800, height: 800 },
    ambientColor: '#f3e5f5',
    music: 'shrine_theme',
    ambientLighting: {
      day: '#f3e5f5',
      evening: '#e1bee7',
      night: '#4a148c',
    },
    weatherAffinity: 'highland',
    landmarks: [
      'shrine_central',
      'surrounding_stones_1',
      'surrounding_stones_2',
      'surrounding_stones_3',
      'surrounding_stones_4',
      'offering_altar',
      'shrine_building',
      'eternal_flame',
    ],
    entrances: [
      'entrance_south_trail',
    ],
    npcs: ['npc_shrine_keeper'],
    questLocations: ['quest_shrine_blessing', 'quest_eternal_flame'],
    terrainPalette: ['stone', 'grass', 'path'],
    discoveryRadius: 100,
    fogOfWar: true,
  },
  {
    id: 'southern_grove',
    name: 'Southern Grove',
    displayName: 'Southern Grove',
    bounds: { x: 1200, y: 2400, width: 1600, height: 1400 },
    ambientColor: '#e8f5e9',
    music: 'grove_theme',
    ambientLighting: {
      day: '#e8f5e9',
      evening: '#ffcc80',
      night: '#1b5e20',
    },
    weatherAffinity: 'forest',
    landmarks: [
      'giant_tree',
      'flower_clearing',
      'hidden_clearing_south',
      'fairy_ring',
      'healing_spring',
      'ancient_bench',
    ],
    entrances: [
      'entrance_north_village',
      'entrance_east_hidden',
    ],
    npcs: ['npc_druid', 'npc_gatherer'],
    questLocations: ['quest_healing_herbs', 'quest_fairy_ring'],
    terrainPalette: ['grass', 'forest_floor', 'dirt', 'shallow_water', 'path'],
    discoveryRadius: 200,
    fogOfWar: true,
  },
  {
    id: 'farmland',
    name: 'Farmland',
    displayName: 'Farmland',
    bounds: { x: -400, y: 1000, width: 1800, height: 1400 },
    ambientColor: '#f1f8e9',
    music: 'farmland_theme',
    ambientLighting: {
      day: '#f1f8e9',
      evening: '#fff3e0',
      night: '#33691e',
    },
    weatherAffinity: 'temperate',
    landmarks: [
      'farm_windmill',
      'crop_field_wheat',
      'crop_field_pumpkin',
      'orchard_apple',
      'orchard_pear',
      'farm_pond',
      'animal_pen_chicken',
      'animal_pen_cow',
      'haystack_1',
      'haystack_2',
      'water_well_farm',
      'building_farm_house',
      'building_barn',
    ],
    entrances: [
      'entrance_east_village',
      'entrance_north_forest',
    ],
    npcs: ['npc_farmer_walter', 'npc_farmhand_1', 'npc_farmhand_2'],
    questLocations: ['quest_crop_harvest', 'quest_farm_help'],
    terrainPalette: ['farmland', 'dirt', 'grass', 'path', 'shallow_water'],
    discoveryRadius: 150,
    fogOfWar: true,
  },
  {
    id: 'hidden_cavern',
    name: 'Hidden Cavern',
    displayName: 'Hidden Cavern',
    bounds: { x: 800, y: -400, width: 1000, height: 1000 },
    ambientColor: '#263238',
    music: 'cavern_theme',
    ambientLighting: {
      day: '#37474f',
      evening: '#37474f',
      night: '#1a1a1a',
    },
    weatherAffinity: 'cavern',
    landmarks: [
      'cavern_entrance',
      'underground_path_1',
      'underground_path_2',
      'crystal_chamber',
      'collectible_area',
      'ancient_fossil',
      'underground_pool',
    ],
    entrances: [
      'entrance_west_woods',
    ],
    npcs: ['npc_cave_explorer'],
    questLocations: ['quest_cavern_crystals', 'quest_lost_miner'],
    terrainPalette: ['cave_floor', 'stone', 'shallow_water'],
    discoveryRadius: 50,
    fogOfWar: true,
  },
];

export const regionConnections: RegionConnection[] = [
  { from: 'village', to: 'whispering_woods', entranceId: 'entrance_north_road', type: 'road', name: 'North Road' },
  { from: 'village', to: 'riverside', entranceId: 'entrance_east_road', type: 'road', name: 'East Road' },
  { from: 'village', to: 'farmland', entranceId: 'entrance_west_road', type: 'road', name: 'West Road' },
  { from: 'village', to: 'southern_grove', entranceId: 'entrance_south_road', type: 'road', name: 'South Road' },
  { from: 'whispering_woods', to: 'northern_wilds', entranceId: 'entrance_north_wilds', type: 'path', name: 'Forest Path North' },
  { from: 'whispering_woods', to: 'ancient_ruins', entranceId: 'entrance_east_ruins', type: 'hidden', name: 'Overgrown Trail' },
  { from: 'whispering_woods', to: 'hidden_cavern', entranceId: 'entrance_hidden_cavern', type: 'cave', name: 'Cave Entrance' },
  { from: 'northern_wilds', to: 'highland_trail', entranceId: 'entrance_highland_trail', type: 'path', name: 'Mountain Trail' },
  { from: 'highland_trail', to: 'old_shrine', entranceId: 'entrance_north_shrine', type: 'path', name: 'Shrine Path' },
  { from: 'farmland', to: 'whispering_woods', entranceId: 'entrance_north_forest', type: 'path', name: 'Farm Path' },
  { from: 'southern_grove', to: 'whispering_woods', entranceId: 'entrance_east_hidden', type: 'hidden', name: 'Hidden Trail' },
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

export function getEntrancePosition(entranceId: string): Vector2 | undefined {
  const entrances: Record<string, Vector2> = {
    entrance_north_road: { x: 2000, y: 1000 },
    entrance_east_road: { x: 2800, y: 1700 },
    entrance_west_road: { x: 1200, y: 1700 },
    entrance_south_road: { x: 2000, y: 2400 },
    entrance_south_village: { x: 2000, y: 1000 },
    entrance_north_wilds: { x: 2000, y: -600 },
    entrance_east_ruins: { x: 3000, y: 200 },
    entrance_hidden_cavern: { x: 1300, y: -100 },
    entrance_west_woods: { x: 1000, y: 200 },
    entrance_north_mountain: { x: 200, y: -2000 },
    entrance_south_wilds: { x: 200, y: -600 },
    entrance_highland_trail: { x: 400, y: -2200 },
    entrance_north_shrine: { x: 400, y: -3800 },
    entrance_south_trail: { x: 600, y: -3000 },
    entrance_north_village: { x: 2000, y: 2400 },
    entrance_east_hidden: { x: 2800, y: 3100 },
    entrance_east_village: { x: 1200, y: 1700 },
    entrance_north_forest: { x: 600, y: -600 },
    entrance_west_woods_v2: { x: 1300, y: 100 },
  };
  return entrances[entranceId];
}