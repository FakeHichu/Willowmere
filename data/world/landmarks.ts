import type { Vector2 } from '@shared/types';

export interface Landmark {
  id: string;
  name: string;
  description: string;
  position: Vector2;
  size: Vector2;
  regionId: string;
  type: LandmarkType;
  sprite: string;
  collision: boolean;
  discovered: boolean;
  discoveryMessage?: string;
  interactions?: LandmarkInteraction[];
  properties?: Record<string, unknown>;
}

export type LandmarkType =
  | 'natural'
  | 'structure'
  | 'ruin'
  | 'shrine'
  | 'water'
  | 'tree'
  | 'rock'
  | 'viewpoint'
  | 'hidden'
  | 'building';

export interface LandmarkInteraction {
  type: string;
  label: string;
  key: string;
  action?: string;
  condition?: Record<string, unknown>;
}

export const landmarks: Landmark[] = [
  // VILLAGE LANDMARKS
  {
    id: 'fountain_town_square',
    name: 'Town Square Fountain',
    description: 'A beautiful stone fountain at the heart of the village, its water crystal clear.',
    position: { x: 2000, y: 1700 },
    size: { x: 64, y: 64 },
    regionId: 'village',
    type: 'structure',
    sprite: 'fountain',
    collision: true,
    discovered: true,
    discoveryMessage: 'You found the Town Square Fountain!',
    interactions: [
      { type: 'inspect', label: 'Drink Water', key: 'E' },
      { type: 'inspect', label: 'Make a Wish', key: 'F' },
    ],
  },
  {
    id: 'notice_board_town',
    name: 'Village Notice Board',
    description: 'A wooden board covered in local notices, quests, and announcements.',
    position: { x: 2050, y: 1620 },
    size: { x: 48, y: 64 },
    regionId: 'village',
    type: 'structure',
    sprite: 'notice_board',
    collision: true,
    discovered: true,
    interactions: [
      { type: 'read', label: 'Read Notices', key: 'E' },
    ],
  },
  {
    id: 'pond_main',
    name: 'Village Pond',
    description: 'A peaceful pond with lily pads and small fish. The willow trees dip their branches into the water.',
    position: { x: 2150, y: 1880 },
    size: { x: 160, y: 96 },
    regionId: 'village',
    type: 'water',
    sprite: 'pond',
    collision: true,
    discovered: true,
    interactions: [
      { type: 'fish', label: 'Fish', key: 'E' },
      { type: 'inspect', label: 'Watch Reflections', key: 'F' },
    ],
  },

  // RIVERSIDE LANDMARKS
  {
    id: 'fishing_dock',
    name: 'Fishing Dock',
    description: 'A sturdy wooden dock extending into the river. Perfect for fishing.',
    position: { x: 2900, y: 2050 },
    size: { x: 120, y: 40 },
    regionId: 'riverside',
    type: 'structure',
    sprite: 'wooden_dock',
    collision: false,
    discovered: false,
    discoveryMessage: 'You discovered the Fishing Dock!',
    interactions: [
      { type: 'fish', label: 'Fish', key: 'E' },
      { type: 'inspect', label: 'Watch River', key: 'F' },
    ],
  },
  {
    id: 'waterfall',
    name: 'Riverside Waterfall',
    description: 'A beautiful cascade where the river drops over ancient rocks. The mist creates rainbows in sunlight.',
    position: { x: 2970, y: 1350 },
    size: { x: 100, y: 100 },
    regionId: 'riverside',
    type: 'water',
    sprite: 'waterfall',
    collision: true,
    discovered: false,
    discoveryMessage: 'You found the Riverside Waterfall!',
    interactions: [
      { type: 'inspect', label: 'Watch Waterfall', key: 'E' },
    ],
  },
  {
    id: 'wooden_bridge',
    name: 'Wooden Bridge',
    description: 'A well-crafted bridge spanning the river, connecting the paths on either side.',
    position: { x: 2950, y: 2000 },
    size: { x: 80, y: 60 },
    regionId: 'riverside',
    type: 'structure',
    sprite: 'wooden_bridge',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'cross', label: 'Cross Bridge', key: 'E' },
    ],
  },
  {
    id: 'cave_entrance_riverside',
    name: 'Riverside Cave',
    description: 'A mysterious cave entrance behind the waterfall. Cool air drifts out from within.',
    position: { x: 3500, y: 1400 },
    size: { x: 80, y: 60 },
    regionId: 'riverside',
    type: 'hidden',
    sprite: 'cave_entrance',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'enter', label: 'Enter Cave', key: 'E' },
    ],
    properties: { destination: 'hidden_cavern' },
  },

  // WHISPERING WOODS LANDMARKS
  {
    id: 'ancient_tree',
    name: 'The Ancient Oak',
    description: 'A massive oak tree, centuries old. Its bark is etched with strange symbols that seem to glow faintly.',
    position: { x: 2000, y: 200 },
    size: { x: 100, y: 120 },
    regionId: 'whispering_woods',
    type: 'tree',
    sprite: 'ancient_tree',
    collision: true,
    discovered: false,
    discoveryMessage: 'You stand before the Ancient Oak. Its presence is overwhelming.',
    interactions: [
      { type: 'inspect', label: 'Touch Ancient Bark', key: 'E' },
      { type: 'inspect', label: 'Read Symbols', key: 'F' },
    ],
    properties: { landmark: true, ancient: true },
  },
  {
    id: 'woods_shrine',
    name: 'Forest Shrine',
    description: 'A small stone shrine nestled in a clearing. Offerings of flowers and coins rest at its base.',
    position: { x: 2900, y: -400 },
    size: { x: 48, y: 48 },
    regionId: 'whispering_woods',
    type: 'shrine',
    sprite: 'stone_shrine',
    collision: true,
    discovered: false,
    discoveryMessage: 'You discovered the Forest Shrine.',
    interactions: [
      { type: 'inspect', label: 'Pray', key: 'E' },
      { type: 'offer', label: 'Leave Offering', key: 'F' },
    ],
    properties: { sacred: true },
  },
  {
    id: 'mysterious_stone',
    name: 'Standing Stone',
    description: 'An ancient standing stone covered in runes. The air around it hums with latent magic.',
    position: { x: 2450, y: -350 },
    size: { x: 32, y: 48 },
    regionId: 'whispering_woods',
    type: 'rock',
    sprite: 'standing_stone',
    collision: true,
    discovered: false,
    interactions: [
      { type: 'inspect', label: 'Read Runes', key: 'E' },
    ],
    properties: { ancient: true, clue: 'whispering_woods_secret' },
  },
  {
    id: 'abandoned_cabin',
    name: 'Abandoned Ranger Cabin',
    description: 'A weathered cabin, long abandoned. Someone once lived here, watching over the woods.',
    position: { x: 1300, y: -300 },
    size: { x: 80, y: 64 },
    regionId: 'whispering_woods',
    type: 'structure',
    sprite: 'abandoned_cabin',
    collision: true,
    discovered: false,
    discoveryMessage: 'You found an abandoned cabin. It looks like nobody has been here for years.',
    interactions: [
      { type: 'open', label: 'Enter Cabin', key: 'E' },
    ],
    properties: { building: 'abandoned_cabin', label: 'Abandoned Cabin' },
  },
  {
    id: 'hidden_path',
    name: 'Hidden Forest Path',
    description: 'A narrow, overgrown trail that few notice. It winds deeper into the woods.',
    position: { x: 1100, y: 200 },
    size: { x: 40, y: 100 },
    regionId: 'whispering_woods',
    type: 'hidden',
    sprite: 'hidden_trail',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'enter', label: 'Follow Hidden Path', key: 'E' },
    ],
    properties: { secret: true, leadsTo: 'secret_grove' },
  },
  {
    id: 'secret_grove',
    name: 'Secret Grove',
    description: 'A hidden clearing bathed in golden light. Magical energy permeates the air.',
    position: { x: 1100, y: -500 },
    size: { x: 100, y: 100 },
    regionId: 'whispering_woods',
    type: 'hidden',
    sprite: 'magic_grove',
    collision: false,
    discovered: false,
    discoveryMessage: 'You discovered the Secret Grove! A place of ancient magic.',
    interactions: [
      { type: 'inspect', label: 'Meditate', key: 'E' },
    ],
    properties: { hidden: true, magical: true, reward: 'item_blessing' },
  },
  {
    id: 'glowing_mushroom',
    name: 'Glowing Mushroom Cluster',
    description: 'Bioluminescent mushrooms that pulse with soft blue light. Rare and valuable.',
    position: { x: 2750, y: -250 },
    size: { x: 24, y: 24 },
    regionId: 'whispering_woods',
    type: 'natural',
    sprite: 'glowing_mushroom',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'pickup', label: 'Pick Glowing Mushroom', key: 'E' },
    ],
    properties: { itemType: 'item_glowing_mushroom', rare: true },
  },

  // NORTHERN WILDS LANDMARKS
  {
    id: 'wilds_lookout',
    name: 'Wilds Lookout',
    description: 'A natural rocky outcrop offering a sweeping view of the forest below.',
    position: { x: 1800, y: -1600 },
    size: { x: 80, y: 60 },
    regionId: 'northern_wilds',
    type: 'viewpoint',
    sprite: 'lookout_point',
    collision: false,
    discovered: false,
    discoveryMessage: 'You found the Wilds Lookout. The view is breathtaking.',
    interactions: [
      { type: 'inspect', label: 'Admire View', key: 'E' },
    ],
  },
  {
    id: 'rock_formation_1',
    name: 'Twin Stone Spires',
    description: 'Two towering stone spires rising from the earth. Ancient glacial formations.',
    position: { x: 1500, y: -1200 },
    size: { x: 60, y: 120 },
    regionId: 'northern_wilds',
    type: 'rock',
    sprite: 'stone_spire',
    collision: true,
    discovered: false,
    interactions: [
      { type: 'inspect', label: 'Examine Formation', key: 'E' },
    ],
  },
  {
    id: 'rock_formation_2',
    name: 'Balanced Boulder',
    description: 'A massive boulder precariously balanced on a small stone. A geological wonder.',
    position: { x: 2200, y: -1800 },
    size: { x: 80, y: 80 },
    regionId: 'northern_wilds',
    type: 'rock',
    sprite: 'balanced_boulder',
    collision: true,
    discovered: false,
    interactions: [
      { type: 'inspect', label: 'Test Stability', key: 'E' },
    ],
  },

  // ANCIENT RUINS LANDMARKS
  {
    id: 'ruins_gate',
    name: 'Ruins Gate',
    description: 'A crumbling archway marking the entrance to the ancient ruins. Faded carvings adorn the stone.',
    position: { x: 3200, y: 200 },
    size: { x: 120, y: 80 },
    regionId: 'ancient_ruins',
    type: 'ruin',
    sprite: 'ruins_gate',
    collision: true,
    discovered: false,
    discoveryMessage: 'You stand before the Ruins Gate. Ages of history lie beyond.',
    interactions: [
      { type: 'inspect', label: 'Read Carvings', key: 'E' },
    ],
  },
  {
    id: 'broken_pillar_1',
    name: 'Fallen Pillar',
    description: 'A once-mighty pillar now lies in pieces. Vines crawl over the ancient stone.',
    position: { x: 3500, y: -100 },
    size: { x: 60, y: 100 },
    regionId: 'ancient_ruins',
    type: 'ruin',
    sprite: 'broken_pillar',
    collision: true,
    discovered: false,
    interactions: [
      { type: 'inspect', label: 'Search Debris', key: 'E' },
    ],
  },
  {
    id: 'puzzle_pedestal',
    name: 'Puzzle Pedestal',
    description: 'A stone pedestal with rotating rings. An ancient mechanism waiting to be solved.',
    position: { x: 3800, y: -200 },
    size: { x: 48, y: 48 },
    regionId: 'ancient_ruins',
    type: 'ruin',
    sprite: 'puzzle_pedestal',
    collision: true,
    discovered: false,
    interactions: [
      { type: 'inspect', label: 'Examine Mechanism', key: 'E' },
      { type: 'use', label: 'Rotate Ring', key: 'F' },
    ],
    properties: { puzzle: true },
  },
  {
    id: 'statue_guardian',
    name: 'Stone Guardian',
    description: 'A massive statue of a forgotten deity. Its eyes seem to follow you.',
    position: { x: 4100, y: 100 },
    size: { x: 64, y: 100 },
    regionId: 'ancient_ruins',
    type: 'ruin',
    sprite: 'stone_guardian',
    collision: true,
    discovered: false,
    interactions: [
      { type: 'inspect', label: 'Study Statue', key: 'E' },
    ],
  },

  // HIGHLAND TRAIL LANDMARKS
  {
    id: 'cliff_edge',
    name: 'Cliff Edge',
    description: 'A sheer drop overlooking the valley below. Wind howls through the crags.',
    position: { x: 400, y: -1800 },
    size: { x: 100, y: 40 },
    regionId: 'highland_trail',
    type: 'viewpoint',
    sprite: 'cliff_edge',
    collision: true,
    discovered: false,
    discoveryMessage: 'You stand at the Cliff Edge. The wind whispers of distant lands.',
    interactions: [
      { type: 'inspect', label: 'Look Down', key: 'E' },
    ],
  },
  {
    id: 'waterfall_highland',
    name: 'Highland Waterfall',
    description: 'A ribbon of water cascading down the mountainside, feeding the river far below.',
    position: { x: 200, y: -2200 },
    size: { x: 60, y: 160 },
    regionId: 'highland_trail',
    type: 'water',
    sprite: 'waterfall',
    collision: true,
    discovered: false,
    interactions: [
      { type: 'inspect', label: 'Feel Mist', key: 'E' },
    ],
  },
  {
    id: 'lookout_point',
    name: 'Eagle\'s Perch',
    description: 'The highest accessible point on the trail. On clear days, you can see the entire valley.',
    position: { x: 600, y: -2800 },
    size: { x: 80, y: 60 },
    regionId: 'highland_trail',
    type: 'viewpoint',
    sprite: 'lookout_point',
    collision: false,
    discovered: false,
    discoveryMessage: 'You reached Eagle\'s Perch. The world spreads out beneath you.',
    interactions: [
      { type: 'inspect', label: 'Survey Lands', key: 'E' },
    ],
  },
  {
    id: 'old_bridge_highland',
    name: 'Old Stone Bridge',
    description: 'An ancient stone bridge spanning a deep chasm. Remarkably still standing.',
    position: { x: 300, y: -3200 },
    size: { x: 60, y: 80 },
    regionId: 'highland_trail',
    type: 'structure',
    sprite: 'stone_bridge',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'cross', label: 'Cross Bridge', key: 'E' },
    ],
  },

  // OLD SHRINE LANDMARKS
  {
    id: 'shrine_central',
    name: 'Central Shrine',
    description: 'An ancient shrine dedicated to a forgotten god. The air is thick with reverence.',
    position: { x: 600, y: -3400 },
    size: { x: 80, y: 80 },
    regionId: 'old_shrine',
    type: 'shrine',
    sprite: 'grand_shrine',
    collision: true,
    discovered: false,
    discoveryMessage: 'You found the Old Shrine. A sacred place of power.',
    interactions: [
      { type: 'inspect', label: 'Pray', key: 'E' },
      { type: 'offer', label: 'Leave Offering', key: 'F' },
    ],
    properties: { sacred: true, questLocation: true },
  },
  {
    id: 'surrounding_stones_1',
    name: 'Standing Stone North',
    description: 'One of four stones surrounding the central shrine. Carved with protective runes.',
    position: { x: 600, y: -3480 },
    size: { x: 32, y: 48 },
    regionId: 'old_shrine',
    type: 'rock',
    sprite: 'standing_stone',
    collision: true,
    discovered: false,
    interactions: [
      { type: 'inspect', label: 'Read Rune', key: 'E' },
    ],
  },
  {
    id: 'surrounding_stones_2',
    name: 'Standing Stone East',
    description: 'One of four stones surrounding the central shrine. Carved with protective runes.',
    position: { x: 680, y: -3400 },
    size: { x: 32, y: 48 },
    regionId: 'old_shrine',
    type: 'rock',
    sprite: 'standing_stone',
    collision: true,
    discovered: false,
    interactions: [
      { type: 'inspect', label: 'Read Rune', key: 'E' },
    ],
  },
  {
    id: 'surrounding_stones_3',
    name: 'Standing Stone South',
    description: 'One of four stones surrounding the central shrine. Carved with protective runes.',
    position: { x: 600, y: -3320 },
    size: { x: 32, y: 48 },
    regionId: 'old_shrine',
    type: 'rock',
    sprite: 'standing_stone',
    collision: true,
    discovered: false,
    interactions: [
      { type: 'inspect', label: 'Read Rune', key: 'E' },
    ],
  },
  {
    id: 'surrounding_stones_4',
    name: 'Standing Stone West',
    description: 'One of four stones surrounding the central shrine. Carved with protective runes.',
    position: { x: 520, y: -3400 },
    size: { x: 32, y: 48 },
    regionId: 'old_shrine',
    type: 'rock',
    sprite: 'standing_stone',
    collision: true,
    discovered: false,
    interactions: [
      { type: 'inspect', label: 'Read Rune', key: 'E' },
    ],
  },
  {
    id: 'offering_altar',
    name: 'Offering Altar',
    description: 'A stone altar before the shrine. Old offerings have turned to dust.',
    position: { x: 600, y: -3350 },
    size: { x: 48, y: 32 },
    regionId: 'old_shrine',
    type: 'shrine',
    sprite: 'offering_altar',
    collision: true,
    discovered: false,
    interactions: [
      { type: 'offer', label: 'Place Offering', key: 'E' },
    ],
  },
  {
    id: 'eternal_flame',
    name: 'Eternal Flame',
    description: 'A flame that has burned for centuries without fuel. It never flickers, never dies.',
    position: { x: 600, y: -3440 },
    size: { x: 24, y: 48 },
    regionId: 'old_shrine',
    type: 'natural',
    sprite: 'eternal_flame',
    collision: false,
    discovered: false,
    discoveryMessage: 'The Eternal Flame burns before you. Its warmth is comforting.',
    interactions: [
      { type: 'inspect', label: 'Warm Hands', key: 'E' },
    ],
    properties: { magical: true, eternal: true },
  },

  // SOUTHERN GROVE LANDMARKS
  {
    id: 'giant_tree',
    name: 'The Great Willow',
    description: 'An enormous willow tree, its branches creating a natural cathedral. Leaves shimmer with golden light.',
    position: { x: 2000, y: 3100 },
    size: { x: 150, y: 150 },
    regionId: 'southern_grove',
    type: 'tree',
    sprite: 'giant_willow',
    collision: true,
    discovered: false,
    discoveryMessage: 'You stand beneath the Great Willow. Its presence is ancient and kind.',
    interactions: [
      { type: 'inspect', label: 'Touch Bark', key: 'E' },
      { type: 'sit', label: 'Rest Under Branches', key: 'F' },
    ],
    properties: { landmark: true, magical: true },
  },
  {
    id: 'flower_clearing',
    name: 'Flower Clearing',
    description: 'A meadow bursting with wildflowers of every color. Butterflies dance on the breeze.',
    position: { x: 2400, y: 3000 },
    size: { x: 120, y: 100 },
    regionId: 'southern_grove',
    type: 'natural',
    sprite: 'flower_clearing',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'harvest', label: 'Gather Flowers', key: 'E' },
    ],
    properties: { itemType: 'item_wildflower', abundant: true },
  },
  {
    id: 'fairy_ring',
    name: 'Fairy Ring',
    description: 'A perfect circle of mushrooms. Legend says fairies dance here on moonlit nights.',
    position: { x: 1600, y: 2800 },
    size: { x: 40, y: 40 },
    regionId: 'southern_grove',
    type: 'hidden',
    sprite: 'fairy_ring',
    collision: false,
    discovered: false,
    discoveryMessage: 'You found a Fairy Ring! The air shimmers with magic.',
    interactions: [
      { type: 'inspect', label: 'Enter Ring', key: 'E' },
    ],
    properties: { magical: true, secret: true },
  },
  {
    id: 'healing_spring',
    name: 'Healing Spring',
    description: 'A small spring with water that glows faintly. Said to cure any ailment.',
    position: { x: 1800, y: 3400 },
    size: { x: 40, y: 40 },
    regionId: 'southern_grove',
    type: 'water',
    sprite: 'healing_spring',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'inspect', label: 'Drink Water', key: 'E' },
      { type: 'pickup', label: 'Fill Bottle', key: 'F' },
    ],
    properties: { healing: true, itemType: 'item_healing_water' },
  },

  // FARMLAND LANDMARKS
  {
    id: 'farm_windmill',
    name: 'Old Windmill',
    description: 'A traditional windmill that has ground grain for generations. Its sails turn lazily in the breeze.',
    position: { x: 300, y: 1400 },
    size: { x: 64, y: 96 },
    regionId: 'farmland',
    type: 'structure',
    sprite: 'windmill',
    collision: true,
    discovered: false,
    interactions: [
      { type: 'inspect', label: 'Inspect Windmill', key: 'E' },
    ],
  },
  {
    id: 'crop_field_wheat',
    name: 'Wheat Field',
    description: 'Golden wheat sways in the wind. Ready for harvest.',
    position: { x: 500, y: 1800 },
    size: { x: 200, y: 150 },
    regionId: 'farmland',
    type: 'natural',
    sprite: 'crop_wheat',
    collision: false,
    discovered: false,
    interactions: [
      { type: 'harvest', label: 'Harvest Wheat', key: 'E' },
    ],
    properties: { itemType: 'item_wheat', growthStage: 'ready' },
  },
  {
    id: 'farm_pond',
    name: 'Farm Pond',
    description: 'A peaceful pond stocked with fish. Ducks often visit.',
    position: { x: 900, y: 2200 },
    size: { x: 120, y: 80 },
    regionId: 'farmland',
    type: 'water',
    sprite: 'pond',
    collision: true,
    discovered: false,
    interactions: [
      { type: 'fish', label: 'Fish', key: 'E' },
      { type: 'inspect', label: 'Watch Ducks', key: 'F' },
    ],
  },

  // HIDDEN CAVERN LANDMARKS
  {
    id: 'cavern_entrance',
    name: 'Cavern Entrance',
    description: 'A yawning mouth in the earth. Cool, damp air flows out, carrying echoes of dripping water.',
    position: { x: 1300, y: 100 },
    size: { x: 80, y: 60 },
    regionId: 'hidden_cavern',
    type: 'hidden',
    sprite: 'cave_entrance',
    collision: false,
    discovered: false,
    discoveryMessage: 'You found the Hidden Cavern entrance. Darkness waits within.',
    interactions: [
      { type: 'enter', label: 'Enter Cavern', key: 'E' },
    ],
    properties: { destination: 'cavern_interior' },
  },
  {
    id: 'crystal_chamber',
    name: 'Crystal Chamber',
    description: 'A cavern covered in glowing crystals. They pulse with inner light.',
    position: { x: 1000, y: -100 },
    size: { x: 100, y: 100 },
    regionId: 'hidden_cavern',
    type: 'natural',
    sprite: 'crystal_chamber',
    collision: false,
    discovered: false,
    discoveryMessage: 'You discovered the Crystal Chamber! The beauty takes your breath away.',
    interactions: [
      { type: 'inspect', label: 'Touch Crystal', key: 'E' },
      { type: 'pickup', label: 'Collect Shard', key: 'F' },
    ],
    properties: { itemType: 'item_crystal_shard', magical: true },
  },
  {
    id: 'underground_pool',
    name: 'Underground Pool',
    description: 'A perfectly still pool deep underground. The water is so clear it seems invisible.',
    position: { x: 1500, y: 200 },
    size: { x: 80, y: 60 },
    regionId: 'hidden_cavern',
    type: 'water',
    sprite: 'underground_pool',
    collision: true,
    discovered: false,
    interactions: [
      { type: 'inspect', label: 'Peer Into Depths', key: 'E' },
    ],
    properties: { magical: true },
  },
];

export function getLandmarkById(id: string): Landmark | undefined {
  return landmarks.find(l => l.id === id);
}

export function getLandmarksByRegion(regionId: string): Landmark[] {
  return landmarks.filter(l => l.regionId === regionId);
}

export function getLandmarksAtPosition(position: Vector2, radius: number): Landmark[] {
  return landmarks.filter(landmark => {
    const dx = landmark.position.x - position.x;
    const dy = landmark.position.y - position.y;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  });
}

export function getUndiscoveredLandmarks(regionId: string): Landmark[] {
  return landmarks.filter(l => l.regionId === regionId && !l.discovered);
}