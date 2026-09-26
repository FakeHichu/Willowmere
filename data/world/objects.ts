import type { WorldObject, WorldMap, InteractionDefinition } from '@shared/types';

const benchInteractions: InteractionDefinition[] = [
  { type: 'sit', label: 'Sit', key: 'E' }
];

const flowerInteractions: InteractionDefinition[] = [
  { type: 'pickup', label: 'Pick', key: 'E' },
  { type: 'inspect', label: 'Examine', key: 'F' }
];

const pondInteractions: InteractionDefinition[] = [
  { type: 'inspect', label: 'Look at water', key: 'E' }
];

const noticeBoardInteractions: InteractionDefinition[] = [
  { type: 'read', label: 'Read', key: 'E' }
];

const doorInteractions: InteractionDefinition[] = [
  { type: 'open', label: 'Enter', key: 'E' }
];

const mailboxInteractions: InteractionDefinition[] = [
  { type: 'inspect', label: 'Check mailbox', key: 'E' }
];

const gardenPlotInteractions: InteractionDefinition[] = [
  { type: 'use', label: 'Water', key: 'E', condition: { type: 'has_item', payload: { itemId: 'item_watering_can' } } },
  { type: 'inspect', label: 'Examine', key: 'F' }
];

export const worldObjects: WorldObject[] = [
  // --------------------------------------------------------------------------
  // CORE BUILDINGS (EXTERIORS & DOORS)
  // --------------------------------------------------------------------------
  {
    id: 'building_town_hall',
    type: 'building',
    position: { x: 300, y: 150 },
    size: { x: 128, y: 96 },
    sprite: 'building_town_hall',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'town_hall', label: 'Town Hall' }
  },
  {
    id: 'building_general_store',
    type: 'building',
    position: { x: 100, y: 250 },
    size: { x: 128, y: 96 },
    sprite: 'building_general_store',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'general_store', label: 'General Store' }
  },
  {
    id: 'building_blacksmith',
    type: 'building',
    position: { x: 600, y: 150 },
    size: { x: 128, y: 96 },
    sprite: 'building_blacksmith',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'blacksmith', label: 'Blacksmith' }
  },
  {
    id: 'building_library',
    type: 'building',
    position: { x: 150, y: 400 },
    size: { x: 128, y: 96 },
    sprite: 'building_library',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'library', label: 'Library' }
  },
  {
    id: 'building_inn',
    type: 'building',
    position: { x: 650, y: 350 },
    size: { x: 128, y: 96 },
    sprite: 'building_inn',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'inn', label: 'Inn' }
  },
  {
    id: 'building_stables',
    type: 'building',
    position: { x: 800, y: 150 },
    size: { x: 128, y: 96 },
    sprite: 'building_stables',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'stables', label: 'Stables' }
  },
  {
    id: 'building_farm_house',
    type: 'building',
    position: { x: 350, y: 50 },
    size: { x: 128, y: 96 },
    sprite: 'building_farm_house',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'farm_house', label: 'Farm House' }
  },
  {
    id: 'building_barn',
    type: 'building',
    position: { x: 200, y: 50 },
    size: { x: 96, y: 80 },
    sprite: 'building_barn',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'barn', label: 'Barn' }
  },
  {
    id: 'building_player_house',
    type: 'building',
    position: { x: 400, y: 450 },
    size: { x: 128, y: 96 },
    sprite: 'building_player_house',
    collision: true,
    interactions: doorInteractions,
    properties: { building: 'player_house', label: 'Player House' }
  },

  // --------------------------------------------------------------------------
  // CENTRAL VILLAGE - TOWN SQUARE & FOUNTAIN & BENCHES
  // --------------------------------------------------------------------------
  {
    id: 'fountain_town_square',
    type: 'fountain',
    position: { x: 448, y: 300 },
    size: { x: 64, y: 64 },
    sprite: 'fountain',
    collision: true,
    interactions: [{ type: 'inspect', label: 'Look at Fountain', key: 'E' }]
  },
  {
    id: 'bench_town_square_1',
    type: 'bench',
    position: { x: 380, y: 280 },
    size: { x: 64, y: 32 },
    sprite: 'bench_wooden',
    collision: true,
    interactions: benchInteractions,
    properties: { facing: 'up' }
  },
  {
    id: 'bench_town_square_2',
    type: 'bench',
    position: { x: 530, y: 280 },
    size: { x: 64, y: 32 },
    sprite: 'bench_wooden',
    collision: true,
    interactions: benchInteractions,
    properties: { facing: 'up' }
  },

  // --------------------------------------------------------------------------
  // WORLD OBJECTS & FLOWERS
  // --------------------------------------------------------------------------
  {
    id: 'notice_board_town',
    type: 'notice_board',
    position: { x: 450, y: 220 },
    size: { x: 48, y: 64 },
    sprite: 'notice_board',
    collision: true,
    interactions: noticeBoardInteractions
  },
  {
    id: 'pond_main',
    type: 'pond',
    position: { x: 550, y: 480 },
    size: { x: 160, y: 96 },
    sprite: 'pond',
    collision: true,
    interactions: pondInteractions
  },
  {
    id: 'flower_wildflower_1',
    type: 'flower',
    position: { x: 520, y: 350 },
    size: { x: 24, y: 24 },
    sprite: 'flower_wildflower',
    collision: false,
    interactions: flowerInteractions,
    properties: { itemType: 'item_wildflower' }
  },
  {
    id: 'flower_lavender_1',
    type: 'flower',
    position: { x: 720, y: 480 },
    size: { x: 24, y: 24 },
    sprite: 'flower_lavender',
    collision: false,
    interactions: flowerInteractions,
    properties: { itemType: 'item_lavender' }
  },
  {
    id: 'flower_sunflower_1',
    type: 'flower',
    position: { x: 780, y: 380 },
    size: { x: 32, y: 48 },
    sprite: 'flower_sunflower',
    collision: false,
    interactions: flowerInteractions,
    properties: { itemType: 'item_sunflower' }
  },
  {
    id: 'scrap_iron_1',
    type: 'item_pickup',
    position: { x: 220, y: 140 },
    size: { x: 16, y: 16 },
    sprite: 'item_iron',
    collision: false,
    interactions: [{ type: 'pickup', label: 'Pick up', key: 'E' }],
    properties: { itemType: 'item_scrap_iron' }
  },
  {
    id: 'scrap_iron_2',
    type: 'item_pickup',
    position: { x: 640, y: 260 },
    size: { x: 16, y: 16 },
    sprite: 'item_iron',
    collision: false,
    interactions: [{ type: 'pickup', label: 'Pick up', key: 'E' }],
    properties: { itemType: 'item_scrap_iron' }
  }
];

const northFarmObjects: WorldObject[] = [
  { id: 'building_farm_house', type: 'building', position: { x: 300, y: 100 }, size: { x: 128, y: 96 }, sprite: 'building_farm_house', collision: true, interactions: [{ type: 'open', label: 'Enter', key: 'E' }], properties: { building: 'farm_house', label: 'Farm House' } },
  { id: 'building_barn', type: 'building', position: { x: 150, y: 100 }, size: { x: 96, y: 80 }, sprite: 'building_barn', collision: true, interactions: [{ type: 'open', label: 'Enter', key: 'E' }], properties: { building: 'barn', label: 'Barn' } },
  { id: 'farm_windmill', type: 'windmill', position: { x: 500, y: 200 }, size: { x: 64, y: 96 }, sprite: 'windmill', collision: true, interactions: [{ type: 'inspect', label: 'Inspect Windmill', key: 'E' }] },
  { id: 'crop_field_1', type: 'crop_field', position: { x: 400, y: 300 }, size: { x: 200, y: 150 }, sprite: 'crop_wheat', collision: false, interactions: [{ type: 'harvest', label: 'Harvest Wheat', key: 'E' }], properties: { itemType: 'item_wheat', growthStage: 'ready' } },
  { id: 'crop_field_2', type: 'crop_field', position: { x: 650, y: 300 }, size: { x: 200, y: 150 }, sprite: 'crop_pumpkin', collision: false, interactions: [{ type: 'harvest', label: 'Harvest Pumpkin', key: 'E' }], properties: { itemType: 'item_pumpkin', growthStage: 'ready' } },
  { id: 'orchard_1', type: 'orchard', position: { x: 100, y: 400 }, size: { x: 150, y: 150 }, sprite: 'orchard_apple', collision: false, interactions: [{ type: 'harvest', label: 'Pick Apples', key: 'E' }], properties: { itemType: 'item_apple' } },
  { id: 'farm_pond', type: 'pond', position: { x: 800, y: 400 }, size: { x: 120, y: 80 }, sprite: 'pond', collision: true, interactions: [{ type: 'fish', label: 'Fish', key: 'E' }, { type: 'inspect', label: 'Look at Water', key: 'F' }] },
  { id: 'animal_pen_chicken', type: 'animal_pen', position: { x: 500, y: 500 }, size: { x: 80, y: 60 }, sprite: 'chicken_coop', collision: true, interactions: [{ type: 'inspect', label: 'Check Chickens', key: 'E' }], properties: { animal: 'chicken' } },
  { id: 'animal_pen_cow', type: 'animal_pen', position: { x: 620, y: 500 }, size: { x: 80, y: 60 }, sprite: 'cow_pen', collision: true, interactions: [{ type: 'inspect', label: 'Check Cows', key: 'E' }], properties: { animal: 'cow' } },
  { id: 'farm_path_to_village', type: 'signpost', position: { x: 380, y: 160 }, size: { x: 32, y: 48 }, sprite: 'signpost', collision: false, interactions: [{ type: 'read', label: 'Read Sign', key: 'E' }], properties: { text: 'Willowmere Village →' } },
  { id: 'farm_path_to_forest', type: 'signpost', position: { x: 380, y: 800 }, size: { x: 32, y: 48 }, sprite: 'signpost', collision: false, interactions: [{ type: 'read', label: 'Read Sign', key: 'E' }], properties: { text: '→ Whispering Woods' } },
  { id: 'haystack_1', type: 'haystack', position: { x: 200, y: 200 }, size: { x: 32, y: 32 }, sprite: 'haystack', collision: true, interactions: [{ type: 'inspect', label: 'Search Hay', key: 'E' }] },
  { id: 'haystack_2', type: 'haystack', position: { x: 900, y: 200 }, size: { x: 32, y: 32 }, sprite: 'haystack', collision: true, interactions: [{ type: 'inspect', label: 'Search Hay', key: 'E' }] },
  { id: 'water_well_farm', type: 'well', position: { x: 420, y: 180 }, size: { x: 32, y: 32 }, sprite: 'well', collision: true, interactions: [{ type: 'inspect', label: 'Draw Water', key: 'E' }] },
];

const eastRiversideObjects: WorldObject[] = [
  { id: 'fishing_dock', type: 'dock', position: { x: 100, y: 450 }, size: { x: 120, y: 40 }, sprite: 'wooden_dock', collision: false, interactions: [{ type: 'fish', label: 'Fish', key: 'E' }, { type: 'inspect', label: 'Look at River', key: 'F' }] },
  { id: 'river_main', type: 'river', position: { x: 250, y: 100 }, size: { x: 80, y: 700 }, sprite: 'river_water', collision: true, interactions: [] },
  { id: 'waterfall', type: 'waterfall', position: { x: 270, y: 150 }, size: { x: 100, y: 100 }, sprite: 'waterfall', collision: true, interactions: [{ type: 'inspect', label: 'Watch Waterfall', key: 'E' }] },
  { id: 'gardener_garden', type: 'garden', position: { x: 500, y: 300 }, size: { x: 150, y: 120 }, sprite: 'flower_garden', collision: false, interactions: [{ type: 'harvest', label: 'Gather Herbs', key: 'E' }, { type: 'inspect', label: 'Admire Flowers', key: 'F' }], properties: { itemType: 'item_lavender' } },
  { id: 'wooden_bridge', type: 'bridge', position: { x: 250, y: 500 }, size: { x: 80, y: 60 }, sprite: 'wooden_bridge', collision: false, interactions: [{ type: 'cross', label: 'Cross Bridge', key: 'E' }] },
  { id: 'cave_entrance', type: 'cave_entrance', position: { x: 800, y: 200 }, size: { x: 80, y: 60 }, sprite: 'cave_entrance', collision: false, interactions: [{ type: 'enter', label: 'Enter Cave', key: 'E' }], properties: { destination: 'cave_interior', locked: false } },
  { id: 'campsite', type: 'campsite', position: { x: 600, y: 600 }, size: { x: 80, y: 60 }, sprite: 'campfire', collision: false, interactions: [{ type: 'rest', label: 'Rest', key: 'E' }, { type: 'inspect', label: 'Check Camp', key: 'F' }] },
  { id: 'riverside_path_village', type: 'signpost', position: { x: 100, y: 500 }, size: { x: 32, y: 48 }, sprite: 'signpost', collision: false, interactions: [{ type: 'read', label: 'Read Sign', key: 'E' }], properties: { text: '← Willowmere Village' } },
  { id: 'riverside_path_mountain', type: 'signpost', position: { x: 270, y: 50 }, size: { x: 32, y: 48 }, sprite: 'signpost', collision: false, interactions: [{ type: 'read', label: 'Read Sign', key: 'E' }], properties: { text: 'Mountain Trail ↑' } },
  { id: 'mushroom_patch_1', type: 'mushroom_patch', position: { x: 400, y: 500 }, size: { x: 24, y: 24 }, sprite: 'mushroom', collision: false, interactions: [{ type: 'pickup', label: 'Pick Mushroom', key: 'E' }], properties: { itemType: 'item_mushroom' } },
  { id: 'mushroom_patch_2', type: 'mushroom_patch', position: { x: 450, y: 550 }, size: { x: 24, y: 24 }, sprite: 'mushroom', collision: false, interactions: [{ type: 'pickup', label: 'Pick Mushroom', key: 'E' }], properties: { itemType: 'item_mushroom' } },
  { id: 'berry_bush_1', type: 'berry_bush', position: { x: 700, y: 400 }, size: { x: 32, y: 32 }, sprite: 'berry_bush', collision: false, interactions: [{ type: 'harvest', label: 'Pick Berries', key: 'E' }], properties: { itemType: 'item_berries' } },
];

const southDockObjects: WorldObject[] = [
  { id: 'south_dock_main', type: 'dock', position: { x: 500, y: 600 }, size: { x: 200, y: 50 }, sprite: 'large_dock', collision: false, interactions: [{ type: 'fish', label: 'Fish', key: 'E' }, { type: 'inspect', label: 'Watch River', key: 'F' }] },
  { id: 'river_south', type: 'river', position: { x: 300, y: 100 }, size: { x: 100, y: 700 }, sprite: 'river_water', collision: true, interactions: [] },
  { id: 'orchard_south', type: 'orchard', position: { x: 100, y: 200 }, size: { x: 180, y: 200 }, sprite: 'orchard_pear', collision: false, interactions: [{ type: 'harvest', label: 'Pick Pears', key: 'E' }], properties: { itemType: 'item_pear' } },
  { id: 'old_bridge', type: 'bridge', position: { x: 350, y: 400 }, size: { x: 60, y: 80 }, sprite: 'old_bridge', collision: false, interactions: [{ type: 'cross', label: 'Cross Bridge', key: 'E' }, { type: 'inspect', label: 'Inspect Bridge', key: 'F' }] },
  { id: 'abandoned_campsite', type: 'campsite', position: { x: 800, y: 300 }, size: { x: 80, y: 60 }, sprite: 'old_campfire', collision: false, interactions: [{ type: 'inspect', label: 'Search Camp', key: 'E' }], properties: { lootable: true, itemType: 'item_old_journal' } },
  { id: 'hidden_clearing', type: 'clearing', position: { x: 900, y: 700 }, size: { x: 100, y: 100 }, sprite: 'forest_clearing', collision: false, interactions: [{ type: 'inspect', label: 'Explore Clearing', key: 'E' }], properties: { hidden: true, secret: 'ancient_stone' } },
  { id: 'south_path_village', type: 'signpost', position: { x: 600, y: 750 }, size: { x: 32, y: 48 }, sprite: 'signpost', collision: false, interactions: [{ type: 'read', label: 'Read Sign', key: 'E' }], properties: { text: 'Willowmere Village ↑' } },
  { id: 'fishing_shack', type: 'building', position: { x: 650, y: 500 }, size: { x: 80, y: 64 }, sprite: 'fishing_shack', collision: true, interactions: [{ type: 'open', label: 'Enter', key: 'E' }], properties: { building: 'fishing_shack', label: 'Fishing Shack' } },
];

const whisperingWoodsObjects: WorldObject[] = [
  { id: 'ancient_tree', type: 'ancient_tree', position: { x: 600, y: 450 }, size: { x: 100, y: 120 }, sprite: 'ancient_tree', collision: true, interactions: [{ type: 'inspect', label: 'Touch Ancient Bark', key: 'E' }], properties: { landmark: true } },
  { id: 'abandoned_cabin', type: 'building', position: { x: 300, y: 300 }, size: { x: 80, y: 64 }, sprite: 'abandoned_cabin', collision: true, interactions: [{ type: 'open', label: 'Enter Cabin', key: 'E' }], properties: { building: 'abandoned_cabin', label: 'Abandoned Cabin' } },
  { id: 'woods_shrine', type: 'shrine', position: { x: 900, y: 200 }, size: { x: 48, y: 48 }, sprite: 'stone_shrine', collision: true, interactions: [{ type: 'inspect', label: 'Pray', key: 'E' }, { type: 'offer', label: 'Leave Offering', key: 'F' }], properties: { sacred: true } },
  { id: 'hidden_path', type: 'hidden_path', position: { x: 100, y: 450 }, size: { x: 40, y: 100 }, sprite: 'hidden_trail', collision: false, interactions: [{ type: 'enter', label: 'Follow Hidden Path', key: 'E' }], properties: { secret: true, leadsTo: 'secret_grove' } },
  { id: 'secret_grove', type: 'secret_grove', position: { x: 100, y: 100 }, size: { x: 100, y: 100 }, sprite: 'magic_grove', collision: false, interactions: [{ type: 'inspect', label: 'Meditate', key: 'E' }], properties: { hidden: true, magical: true, reward: 'item_blessing' } },
  { id: 'woods_entrance_village', type: 'signpost', position: { x: 100, y: 450 }, size: { x: 32, y: 48 }, sprite: 'signpost', collision: false, interactions: [{ type: 'read', label: 'Read Sign', key: 'E' }], properties: { text: '← Willowmere Village' } },
  { id: 'wild_herbs_1', type: 'herb_patch', position: { x: 400, y: 600 }, size: { x: 24, y: 24 }, sprite: 'wild_herb', collision: false, interactions: [{ type: 'harvest', label: 'Gather Herbs', key: 'E' }], properties: { itemType: 'item_wild_herb' } },
  { id: 'wild_herbs_2', type: 'herb_patch', position: { x: 500, y: 650 }, size: { x: 24, y: 24 }, sprite: 'wild_herb', collision: false, interactions: [{ type: 'harvest', label: 'Gather Herbs', key: 'E' }], properties: { itemType: 'item_wild_herb' } },
  { id: 'glowing_mushroom', type: 'mushroom_patch', position: { x: 750, y: 350 }, size: { x: 24, y: 24 }, sprite: 'glowing_mushroom', collision: false, interactions: [{ type: 'pickup', label: 'Pick Glowing Mushroom', key: 'E' }], properties: { itemType: 'item_glowing_mushroom', rare: true } },
  { id: 'deer_1', type: 'wildlife', position: { x: 200, y: 200 }, size: { x: 48, y: 48 }, sprite: 'deer', collision: false, interactions: [{ type: 'inspect', label: 'Watch Deer', key: 'E' }], properties: { animal: 'deer' } },
  { id: 'fox_1', type: 'wildlife', position: { x: 800, y: 600 }, size: { x: 32, y: 32 }, sprite: 'fox', collision: false, interactions: [{ type: 'inspect', label: 'Watch Fox', key: 'E' }], properties: { animal: 'fox' } },
  { id: 'mysterious_stone', type: 'standing_stone', position: { x: 450, y: 250 }, size: { x: 32, y: 48 }, sprite: 'standing_stone', collision: true, interactions: [{ type: 'inspect', label: 'Read Runes', key: 'E' }], properties: { ancient: true, clue: 'whispering_woods_secret' } },
];

export const worldMaps: Record<string, WorldMap> = {
  village: {
    id: 'map_village',
    name: 'Willowmere Village',
    width: 1200,
    height: 900,
    tileSize: 32,
    layers: [
      { id: 'layer_ground', name: 'Ground', type: 'tile', data: [], opacity: 1, visible: true }
    ],
    objects: worldObjects,
    spawnPoint: { x: 480, y: 360 },
    ambientColor: '#f5f0e6'
  },
  north_farm: {
    id: 'map_north_farm',
    name: 'North Farm',
    width: 1200,
    height: 900,
    tileSize: 32,
    layers: [
      { id: 'layer_ground', name: 'Ground', type: 'tile', data: [], opacity: 1, visible: true }
    ],
    objects: northFarmObjects,
    spawnPoint: { x: 380, y: 160 },
    ambientColor: '#e8f5e9'
  },
  east_riverside: {
    id: 'map_east_riverside',
    name: 'East Riverside',
    width: 1200,
    height: 900,
    tileSize: 32,
    layers: [
      { id: 'layer_ground', name: 'Ground', type: 'tile', data: [], opacity: 1, visible: true }
    ],
    objects: eastRiversideObjects,
    spawnPoint: { x: 100, y: 450 },
    ambientColor: '#e3f2fd'
  },
  south_dock: {
    id: 'map_south_dock',
    name: 'South Dock',
    width: 1200,
    height: 900,
    tileSize: 32,
    layers: [
      { id: 'layer_ground', name: 'Ground', type: 'tile', data: [], opacity: 1, visible: true }
    ],
    objects: southDockObjects,
    spawnPoint: { x: 600, y: 700 },
    ambientColor: '#e0f7fa'
  },
  whispering_woods: {
    id: 'map_whispering_woods',
    name: 'Whispering Woods',
    width: 1200,
    height: 900,
    tileSize: 32,
    layers: [
      { id: 'layer_ground', name: 'Ground', type: 'tile', data: [], opacity: 1, visible: true }
    ],
    objects: whisperingWoodsObjects,
    spawnPoint: { x: 100, y: 450 },
    ambientColor: '#c8e6c9'
  }
};

// Convenience alias so scenes can import `villageMap` directly
export const villageMap = worldMaps.village;

/**
 * Returns all world objects within `radius` pixels of `position`.
 * Searches the village map objects by default.
 */
export function getObjectsAtPosition(
  position: { x: number; y: number },
  radius: number,
  mapObjects: WorldObject[] = worldObjects
): WorldObject[] {
  return mapObjects.filter(obj => {
    const dx = obj.position.x - position.x;
    const dy = obj.position.y - position.y;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  });
}

export function getObjectById(id: string): WorldObject | undefined {
  const allObjects = [
    ...worldObjects,
    ...northFarmObjects,
    ...eastRiversideObjects,
    ...southDockObjects,
    ...whisperingWoodsObjects,
  ];
  return allObjects.find(obj => obj.id === id);
}

export function getObjectsByType(type: string): WorldObject[] {
  return worldObjects.filter(obj => obj.type === type);
}
