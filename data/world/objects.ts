import type { Vector2, WorldObject, InteractionDefinition, WorldMap } from '@shared/types';
import { landmarks } from './landmarks';
import { regions } from './regions';

const benchInteractions: InteractionDefinition[] = [
  { type: 'sit', label: 'Sit', key: 'E' },
];

const flowerInteractions: InteractionDefinition[] = [
  { type: 'pickup', label: 'Pick', key: 'E' },
  { type: 'inspect', label: 'Examine', key: 'F' },
];

const doorInteractions: InteractionDefinition[] = [
  { type: 'open', label: 'Enter', key: 'E' },
];

const signpostInteractions: InteractionDefinition[] = [
  { type: 'read', label: 'Read Sign', key: 'E' },
];

export const worldObjects: WorldObject[] = [
  // VILLAGE BUILDINGS
  {
    id: 'building_town_hall',
    type: 'building',
    position: { x: 1800, y: 1550 },
    size: { x: 128, y: 96 },
    sprite: 'building_town_hall',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'town_hall', label: 'Town Hall', interior: 'town_hall' },
  },
  {
    id: 'building_general_store',
    type: 'building',
    position: { x: 1400, y: 1850 },
    size: { x: 128, y: 96 },
    sprite: 'building_general_store',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'general_store', label: 'General Store', interior: 'general_store' },
  },
  {
    id: 'building_blacksmith',
    type: 'building',
    position: { x: 2200, y: 1550 },
    size: { x: 128, y: 96 },
    sprite: 'building_blacksmith',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'blacksmith', label: 'Blacksmith', interior: 'blacksmith' },
  },
  {
    id: 'building_library',
    type: 'building',
    position: { x: 1450, y: 2000 },
    size: { x: 128, y: 96 },
    sprite: 'building_library',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'library', label: 'Library', interior: 'library' },
  },
  {
    id: 'building_inn',
    type: 'building',
    position: { x: 2250, y: 1950 },
    size: { x: 128, y: 96 },
    sprite: 'building_inn',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'inn', label: 'Inn', interior: 'inn' },
  },
  {
    id: 'building_stables',
    type: 'building',
    position: { x: 2400, y: 1550 },
    size: { x: 128, y: 96 },
    sprite: 'building_stables',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'stables', label: 'Stables', interior: 'stables' },
  },
  {
    id: 'building_player_house',
    type: 'building',
    position: { x: 2000, y: 2050 },
    size: { x: 128, y: 96 },
    sprite: 'building_player_house',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'player_house', label: 'Player House', interior: 'player_house' },
  },

  // VILLAGE STRUCTURES & PROPS
  {
    id: 'fountain_town_square',
    type: 'fountain',
    position: { x: 2000, y: 1700 },
    size: { x: 64, y: 64 },
    sprite: 'fountain',
    collision: true,
    interactions: [{ type: 'inspect', label: 'Drink Water', key: 'E' }],
  },
  {
    id: 'bench_town_square_1',
    type: 'bench',
    position: { x: 1930, y: 1680 },
    size: { x: 64, y: 32 },
    sprite: 'bench_wooden',
    collision: true,
    interactions: benchInteractions,
    properties: { facing: 'up' },
  },
  {
    id: 'bench_town_square_2',
    type: 'bench',
    position: { x: 2080, y: 1680 },
    size: { x: 64, y: 32 },
    sprite: 'bench_wooden',
    collision: true,
    interactions: benchInteractions,
    properties: { facing: 'up' },
  },
  {
    id: 'bench_town_square_3',
    type: 'bench',
    position: { x: 1980, y: 1750 },
    size: { x: 64, y: 32 },
    sprite: 'bench_wooden',
    collision: true,
    interactions: benchInteractions,
    properties: { facing: 'down' },
  },
  {
    id: 'notice_board_town',
    type: 'notice_board',
    position: { x: 2050, y: 1620 },
    size: { x: 48, y: 64 },
    sprite: 'notice_board',
    collision: true,
    interactions: [{ type: 'read', label: 'Read Notices', key: 'E' }],
  },
  {
    id: 'pond_main',
    type: 'pond',
    position: { x: 2150, y: 1880 },
    size: { x: 160, y: 96 },
    sprite: 'pond',
    collision: true,
    interactions: [
      { type: 'fish', label: 'Fish', key: 'E' },
      { type: 'inspect', label: 'Watch Reflections', key: 'F' },
    ],
  },

  // VILLAGE FLOWERS & DECORATIONS
  {
    id: 'flower_wildflower_1',
    type: 'flower',
    position: { x: 2120, y: 1950 },
    size: { x: 24, y: 24 },
    sprite: 'flower_wildflower',
    collision: false,
    interactions: flowerInteractions,
    properties: { itemType: 'item_wildflower' },
  },
  {
    id: 'flower_lavender_1',
    type: 'flower',
    position: { x: 2320, y: 2080 },
    size: { x: 24, y: 24 },
    sprite: 'flower_lavender',
    collision: false,
    interactions: flowerInteractions,
    properties: { itemType: 'item_lavender' },
  },
  {
    id: 'flower_sunflower_1',
    type: 'flower',
    position: { x: 2380, y: 1980 },
    size: { x: 32, y: 48 },
    sprite: 'flower_sunflower',
    collision: false,
    interactions: flowerInteractions,
    properties: { itemType: 'item_sunflower' },
  },

  // VILLAGE ENTRANCE SIGNS
  {
    id: 'sign_north_road',
    type: 'signpost',
    position: { x: 2000, y: 1030 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: 'North Road → Whispering Woods' },
  },
  {
    id: 'sign_east_road',
    type: 'signpost',
    position: { x: 2780, y: 1700 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: 'East Road → Riverside' },
  },
  {
    id: 'sign_west_road',
    type: 'signpost',
    position: { x: 1220, y: 1700 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: 'West Road → Farmland' },
  },
  {
    id: 'sign_south_road',
    type: 'signpost',
    position: { x: 2000, y: 2380 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: 'South Road → Southern Grove' },
  },

  // RIVERSIDE OBJECTS
  {
    id: 'fishing_dock',
    type: 'dock',
    position: { x: 2900, y: 2050 },
    size: { x: 120, y: 40 },
    sprite: 'wooden_dock',
    collision: false,
    interactions: [
      { type: 'fish', label: 'Fish', key: 'E' },
      { type: 'inspect', label: 'Watch River', key: 'F' },
    ],
  },
  {
    id: 'river_main',
    type: 'river',
    position: { x: 3050, y: 1200 },
    size: { x: 80, y: 1600 },
    sprite: 'river_water',
    collision: true,
    interactions: [],
  },
  {
    id: 'waterfall',
    type: 'waterfall',
    position: { x: 2970, y: 1350 },
    size: { x: 100, y: 100 },
    sprite: 'waterfall',
    collision: true,
    interactions: [{ type: 'inspect', label: 'Watch Waterfall', key: 'E' }],
  },
  {
    id: 'gardener_garden',
    type: 'garden',
    position: { x: 3200, y: 1800 },
    size: { x: 150, y: 120 },
    sprite: 'flower_garden',
    collision: false,
    interactions: [
      { type: 'harvest', label: 'Gather Herbs', key: 'E' },
      { type: 'inspect', label: 'Admire Flowers', key: 'F' },
    ],
    properties: { itemType: 'item_lavender' },
  },
  {
    id: 'wooden_bridge',
    type: 'bridge',
    position: { x: 2950, y: 2000 },
    size: { x: 80, y: 60 },
    sprite: 'wooden_bridge',
    collision: false,
    interactions: [{ type: 'cross', label: 'Cross Bridge', key: 'E' }],
  },
  {
    id: 'cave_entrance_riverside',
    type: 'cave_entrance',
    position: { x: 3500, y: 1400 },
    size: { x: 80, y: 60 },
    sprite: 'cave_entrance',
    collision: false,
    interactions: [{ type: 'enter', label: 'Enter Cave', key: 'E' }],
    properties: { destination: 'hidden_cavern', locked: false },
  },
  {
    id: 'campsite_riverside',
    type: 'campsite',
    position: { x: 3300, y: 2400 },
    size: { x: 80, y: 60 },
    sprite: 'campfire',
    collision: false,
    interactions: [
      { type: 'rest', label: 'Rest', key: 'E' },
      { type: 'inspect', label: 'Check Camp', key: 'F' },
    ],
  },
  {
    id: 'sign_riverside_village',
    type: 'signpost',
    position: { x: 2820, y: 2050 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: '← Willowmere Village' },
  },
  {
    id: 'sign_riverside_mountain',
    type: 'signpost',
    position: { x: 2970, y: 1250 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: 'Mountain Trail ↑' },
  },

  // WHISPERING WOODS OBJECTS
  {
    id: 'abandoned_cabin',
    type: 'building',
    position: { x: 1300, y: -300 },
    size: { x: 80, y: 64 },
    sprite: 'abandoned_cabin',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'abandoned_cabin', label: 'Abandoned Cabin', interior: 'abandoned_cabin' },
  },
  {
    id: 'woods_shrine',
    type: 'shrine',
    position: { x: 2900, y: -400 },
    size: { x: 48, y: 48 },
    sprite: 'stone_shrine',
    collision: true,
    interactions: [
      { type: 'inspect', label: 'Pray', key: 'E' },
      { type: 'offer', label: 'Leave Offering', key: 'F' },
    ],
    properties: { sacred: true },
  },
  {
    id: 'sign_woods_village',
    type: 'signpost',
    position: { x: 1100, y: 400 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: '← Willowmere Village' },
  },
  {
    id: 'sign_woods_wilds',
    type: 'signpost',
    position: { x: 2000, y: -580 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: 'Northern Wilds ↑' },
  },
  {
    id: 'sign_woods_ruins',
    type: 'signpost',
    position: { x: 2980, y: 200 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: 'Ancient Ruins →' },
  },

  // NORTHERN WILDS OBJECTS
  {
    id: 'sign_wilds_woods',
    type: 'signpost',
    position: { x: 1700, y: -600 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: '← Whispering Woods' },
  },
  {
    id: 'sign_wilds_highland',
    type: 'signpost',
    position: { x: 400, y: -2200 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: 'Highland Trail ↑' },
  },

  // ANCIENT RUINS OBJECTS
  {
    id: 'ruins_gate',
    type: 'ruins_gate',
    position: { x: 3200, y: 200 },
    size: { x: 120, y: 80 },
    sprite: 'ruins_gate',
    collision: true,
    interactions: [{ type: 'inspect', label: 'Read Carvings', key: 'E' }],
  },
  {
    id: 'ruins_chamber',
    type: 'building',
    position: { x: 3800, y: -200 },
    size: { x: 80, y: 64 },
    sprite: 'ruins_chamber',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'ruins_chamber', label: 'Ancient Chamber', interior: 'ruins_chamber' },
  },
  {
    id: 'sign_ruins_woods',
    type: 'signpost',
    position: { x: 3020, y: 200 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: '← Whispering Woods' },
  },

  // HIGHLAND TRAIL OBJECTS
  {
    id: 'shepherd_hut',
    type: 'building',
    position: { x: 400, y: -2600 },
    size: { x: 80, y: 64 },
    sprite: 'shepherd_hut',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'shepherd_hut', label: 'Shepherd Hut', interior: 'shepherd_hut' },
  },
  {
    id: 'sign_highland_wilds',
    type: 'signpost',
    position: { x: 400, y: -2000 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: '← Northern Wilds' },
  },
  {
    id: 'sign_highland_shrine',
    type: 'signpost',
    position: { x: 600, y: -3780 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: 'Old Shrine ↑' },
  },

  // OLD SHRINE OBJECTS
  {
    id: 'shrine_building',
    type: 'building',
    position: { x: 600, y: -3600 },
    size: { x: 80, y: 64 },
    sprite: 'shrine_building',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'shrine_building', label: 'Shrine Building', interior: 'shrine_building' },
  },

  // SOUTHERN GROVE OBJECTS
  {
    id: 'sign_grove_village',
    type: 'signpost',
    position: { x: 2000, y: 2420 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: 'Willowmere Village ↑' },
  },
  {
    id: 'sign_grove_hidden',
    type: 'signpost',
    position: { x: 2780, y: 3100 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: 'Hidden Trail →' },
  },

  // FARMLAND OBJECTS
  {
    id: 'building_farm_house',
    type: 'building',
    position: { x: 550, y: 1300 },
    size: { x: 128, y: 96 },
    sprite: 'building_farm_house',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'farm_house', label: 'Farm House', interior: 'farm_house' },
  },
  {
    id: 'building_barn',
    type: 'building',
    position: { x: 400, y: 1300 },
    size: { x: 96, y: 80 },
    sprite: 'building_barn',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'barn', label: 'Barn', interior: 'barn' },
  },
  {
    id: 'farm_windmill',
    type: 'windmill',
    position: { x: 300, y: 1400 },
    size: { x: 64, y: 96 },
    sprite: 'windmill',
    collision: true,
    interactions: [{ type: 'inspect', label: 'Inspect Windmill', key: 'E' }],
  },
  {
    id: 'crop_field_wheat',
    type: 'crop_field',
    position: { x: 500, y: 1800 },
    size: { x: 200, y: 150 },
    sprite: 'crop_wheat',
    collision: false,
    interactions: [{ type: 'harvest', label: 'Harvest Wheat', key: 'E' }],
    properties: { itemType: 'item_wheat', growthStage: 'ready' },
  },
  {
    id: 'crop_field_pumpkin',
    type: 'crop_field',
    position: { x: 750, y: 1800 },
    size: { x: 200, y: 150 },
    sprite: 'crop_pumpkin',
    collision: false,
    interactions: [{ type: 'harvest', label: 'Harvest Pumpkin', key: 'E' }],
    properties: { itemType: 'item_pumpkin', growthStage: 'ready' },
  },
  {
    id: 'orchard_apple',
    type: 'orchard',
    position: { x: 200, y: 1900 },
    size: { x: 150, y: 150 },
    sprite: 'orchard_apple',
    collision: false,
    interactions: [{ type: 'harvest', label: 'Pick Apples', key: 'E' }],
    properties: { itemType: 'item_apple' },
  },
  {
    id: 'farm_pond',
    type: 'pond',
    position: { x: 900, y: 2200 },
    size: { x: 120, y: 80 },
    sprite: 'pond',
    collision: true,
    interactions: [
      { type: 'fish', label: 'Fish', key: 'E' },
      { type: 'inspect', label: 'Watch Ducks', key: 'F' },
    ],
  },
  {
    id: 'animal_pen_chicken',
    type: 'animal_pen',
    position: { x: 600, y: 2300 },
    size: { x: 80, y: 60 },
    sprite: 'chicken_coop',
    collision: true,
    interactions: [{ type: 'inspect', label: 'Check Chickens', key: 'E' }],
    properties: { animal: 'chicken' },
  },
  {
    id: 'animal_pen_cow',
    type: 'animal_pen',
    position: { x: 720, y: 2300 },
    size: { x: 80, y: 60 },
    sprite: 'cow_pen',
    collision: true,
    interactions: [{ type: 'inspect', label: 'Check Cows', key: 'E' }],
    properties: { animal: 'cow' },
  },
  {
    id: 'haystack_1',
    type: 'haystack',
    position: { x: 300, y: 1600 },
    size: { x: 32, y: 32 },
    sprite: 'haystack',
    collision: true,
    interactions: [{ type: 'inspect', label: 'Search Hay', key: 'E' }],
  },
  {
    id: 'haystack_2',
    type: 'haystack',
    position: { x: 1000, y: 1600 },
    size: { x: 32, y: 32 },
    sprite: 'haystack',
    collision: true,
    interactions: [{ type: 'inspect', label: 'Search Hay', key: 'E' }],
  },
  {
    id: 'water_well_farm',
    type: 'well',
    position: { x: 620, y: 1480 },
    size: { x: 32, y: 32 },
    sprite: 'well',
    collision: true,
    interactions: [{ type: 'inspect', label: 'Draw Water', key: 'E' }],
  },
  {
    id: 'sign_farm_village',
    type: 'signpost',
    position: { x: 1180, y: 1700 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: 'Willowmere Village →' },
  },
  {
    id: 'sign_farm_forest',
    type: 'signpost',
    position: { x: 600, y: 2400 },
    size: { x: 32, y: 48 },
    sprite: 'signpost',
    collision: false,
    interactions: signpostInteractions,
    properties: { text: 'Whispering Woods →' },
  },

  // HIDDEN CAVERN OBJECTS
  {
    id: 'cavern_entrance',
    type: 'cave_entrance',
    position: { x: 1300, y: 100 },
    size: { x: 80, y: 60 },
    sprite: 'cave_entrance',
    collision: false,
    interactions: [{ type: 'enter', label: 'Enter Cavern', key: 'E' }],
    properties: { destination: 'cavern_interior', locked: false },
  },
];

// Generate collision objects from landmarks and world objects
export function generateCollisionObjects(): Array<{ id: string; position: Vector2; size: { width: number; height: number } }> {
  const collisionObjects: Array<{ id: string; position: Vector2; size: { width: number; height: number } }> = [];

  // Add world objects with collision
  worldObjects.forEach(obj => {
    if (obj.collision) {
      collisionObjects.push({
        id: obj.id,
        position: obj.position,
        size: { width: obj.size.x, height: obj.size.y },
      });
    }
  });

  // Add landmarks with collision
  landmarks.forEach(landmark => {
    if (landmark.collision) {
      collisionObjects.push({
        id: landmark.id,
        position: landmark.position,
        size: { width: landmark.size.x, height: landmark.size.y },
      });
    }
  });

  return collisionObjects;
}

export const overworldMap: WorldMap = {
  id: 'map_overworld',
  name: 'Willowmere Overworld',
  width: 5000,
  height: 4000,
  tileSize: 32,
  layers: [
    { id: 'layer_ground', name: 'Ground', type: 'tile', data: [], opacity: 1, visible: true },
    { id: 'layer_paths', name: 'Paths', type: 'tile', data: [], opacity: 1, visible: true },
    { id: 'layer_details', name: 'Details', type: 'tile', data: [], opacity: 1, visible: true },
  ],
  objects: worldObjects,
  spawnPoint: { x: 2000, y: 1750 },
  ambientColor: '#f5f0e6',
};

export function getObjectsByRegion(regionId: string): WorldObject[] {
  const region = regions.find(r => r.id === regionId);
  if (!region) return [];

  return worldObjects.filter(obj => {
    const { x, y, width, height } = region.bounds;
    return obj.position.x >= x && obj.position.x <= x + width &&
           obj.position.y >= y && obj.position.y <= y + height;
  });
}

export function getObjectById(id: string): WorldObject | undefined {
  return worldObjects.find(obj => obj.id === id);
}

// Backward compatibility
export const villageMap = overworldMap;