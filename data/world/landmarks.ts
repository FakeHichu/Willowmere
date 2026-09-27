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
  // 1. VILLAGE LANDMARKS
  {
    id: 'fountain_town_square',
    name: 'Town Square Fountain',
    description: 'A beautiful stone fountain at the heart of the village, its water crystal clear.',
    position: { x: 3000, y: 2300 },
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
    id: 'clock_tower_village',
    name: 'Village Clock Tower',
    description: 'A grand timber and stone clock tower that chimes over the valley.',
    position: { x: 3050, y: 2100 },
    size: { x: 96, y: 160 },
    regionId: 'village',
    type: 'building',
    sprite: 'clock_tower',
    collision: true,
    discovered: true,
    discoveryMessage: 'You discovered the Village Clock Tower!',
    interactions: [{ type: 'inspect', label: 'Check Time', key: 'E' }],
  },
  {
    id: 'notice_board_town',
    name: 'Village Notice Board',
    description: 'A wooden board covered in local notices, quests, and announcements.',
    position: { x: 2950, y: 2220 },
    size: { x: 48, y: 64 },
    regionId: 'village',
    type: 'structure',
    sprite: 'notice_board',
    collision: true,
    discovered: true,
    interactions: [{ type: 'read', label: 'Read Notices', key: 'E' }],
  },

  // 2. RIVERSIDE LANDMARKS
  {
    id: 'fishing_dock',
    name: 'Riverside Fishing Dock',
    description: 'A sturdy wooden dock extending into the swift river currents.',
    position: { x: 4900, y: 2300 },
    size: { x: 120, y: 40 },
    regionId: 'riverside',
    type: 'structure',
    sprite: 'wooden_dock',
    collision: false,
    discovered: false,
    discoveryMessage: 'You discovered the Riverside Fishing Dock!',
    interactions: [{ type: 'fish', label: 'Cast Line', key: 'E' }],
  },
  {
    id: 'great_waterfall',
    name: 'Roaring Great Waterfall',
    description: 'A massive cascade of white water rushing down from the Northern Ridge into the river.',
    position: { x: 5500, y: 1700 },
    size: { x: 196, y: 128 },
    regionId: 'riverside',
    type: 'water',
    sprite: 'great_waterfall',
    collision: true,
    discovered: false,
    discoveryMessage: 'You discovered the Roaring Great Waterfall!',
    interactions: [{ type: 'inspect', label: 'Admires Cascade', key: 'E' }],
  },
  {
    id: 'wooden_bridge',
    name: 'River Crossing Bridge',
    description: 'A heavy timber bridge spanning the wide river channel.',
    position: { x: 4300, y: 2300 },
    size: { x: 160, y: 48 },
    regionId: 'riverside',
    type: 'structure',
    sprite: 'wooden_bridge',
    collision: false,
    discovered: false,
    discoveryMessage: 'You crossed the River Crossing Bridge!',
  },

  // 3. WHISPERING WOODS LANDMARKS
  {
    id: 'giant_ancient_tree',
    name: 'Great Ancient Sentinel Tree',
    description: 'A towering colossal tree with glowing moss whose canopy covers half the grove.',
    position: { x: 3000, y: 750 },
    size: { x: 192, y: 192 },
    regionId: 'whispering_woods',
    type: 'tree',
    sprite: 'giant_tree',
    collision: true,
    discovered: false,
    discoveryMessage: 'You discovered the Great Ancient Sentinel Tree!',
    interactions: [{ type: 'inspect', label: 'Touch Bark', key: 'E' }],
  },
  {
    id: 'woods_shrine',
    name: 'Whispering Shrine',
    description: 'A mossy stone altar nestled deep within the shadowed woods.',
    position: { x: 2400, y: 400 },
    size: { x: 64, y: 64 },
    regionId: 'whispering_woods',
    type: 'shrine',
    sprite: 'forest_shrine',
    collision: true,
    discovered: false,
    discoveryMessage: 'You discovered the Whispering Shrine!',
    interactions: [{ type: 'pray', label: 'Offer Prayer', key: 'E' }],
  },

  // 4. SOUTHERN FARMLAND LANDMARKS
  {
    id: 'farm_windmill',
    name: 'Old Valley Windmill',
    description: 'A historic tall wooden windmill turning gracefully in the warm southern breeze.',
    position: { x: 800, y: 3400 },
    size: { x: 128, y: 160 },
    regionId: 'southern_farmland',
    type: 'structure',
    sprite: 'windmill',
    collision: true,
    discovered: false,
    discoveryMessage: 'You discovered the Old Valley Windmill!',
    interactions: [{ type: 'inspect', label: 'Inspect Gears', key: 'E' }],
  },
  {
    id: 'crop_field_wheat',
    name: 'Golden Wheat Fields',
    description: 'Rippling acres of golden wheat ready for harvest.',
    position: { x: 1200, y: 3500 },
    size: { x: 256, y: 192 },
    regionId: 'southern_farmland',
    type: 'natural',
    sprite: 'wheat_field',
    collision: false,
    discovered: false,
    discoveryMessage: 'You entered the Golden Wheat Fields!',
  },

  // 5. ANCIENT RUINS LANDMARKS
  {
    id: 'ruined_tower_peak',
    name: 'Shattered Watchtower',
    description: 'A high stone tower broken by time, guarding ancient secrets.',
    position: { x: 4800, y: 600 },
    size: { x: 128, y: 192 },
    regionId: 'ancient_ruins',
    type: 'ruin',
    sprite: 'ruined_tower',
    collision: true,
    discovered: false,
    discoveryMessage: 'You discovered the Shattered Watchtower!',
    interactions: [{ type: 'inspect', label: 'Search Ruins', key: 'E' }],
  },

  // 6. NORTHERN MOUNTAINS LANDMARKS
  {
    id: 'mountain_peak_overlook',
    name: 'Frostwind Overlook Peak',
    description: 'A high snowy mountain cliff overlooking the whole Willowmere valley below.',
    position: { x: 3000, y: -800 },
    size: { x: 160, y: 160 },
    regionId: 'northern_mountains',
    type: 'viewpoint',
    sprite: 'mountain_peak',
    collision: true,
    discovered: false,
    discoveryMessage: 'You stood atop Frostwind Overlook Peak!',
    interactions: [{ type: 'view', label: 'Survey Valley', key: 'E' }],
  },

  // 7. HIGHLAND TRAIL LANDMARKS
  {
    id: 'highland_cliff_edge',
    name: 'Highland Precipice',
    description: 'A dramatic cliff face carved by mountain winds.',
    position: { x: 800, y: -800 },
    size: { x: 160, y: 128 },
    regionId: 'highland_trail',
    type: 'viewpoint',
    sprite: 'highland_cliff',
    collision: true,
    discovered: false,
    discoveryMessage: 'You reached the Highland Precipice!',
  },

  // 8. OLD SHRINE LANDMARKS
  {
    id: 'ancient_sanctuary_shrine',
    name: 'Sanctuary of the Eternal Flame',
    description: 'A sacred high-altitude stone shrine holding an unextinguished blue flame.',
    position: { x: 900, y: -2300 },
    size: { x: 128, y: 128 },
    regionId: 'old_shrine',
    type: 'shrine',
    sprite: 'sanctuary_shrine',
    collision: true,
    discovered: false,
    discoveryMessage: 'You discovered the Sanctuary of the Eternal Flame!',
    interactions: [{ type: 'inspect', label: 'Commune with Flame', key: 'E' }],
  },

  // 9. HIDDEN GROVE LANDMARKS
  {
    id: 'healing_spring_pool',
    name: 'Sunlit Healing Springs',
    description: 'A glowing secluded spring surrounded by flowering petals.',
    position: { x: 3000, y: 3800 },
    size: { x: 128, y: 96 },
    regionId: 'hidden_grove',
    type: 'natural',
    sprite: 'healing_spring',
    collision: false,
    discovered: false,
    discoveryMessage: 'You discovered the Sunlit Healing Springs!',
    interactions: [{ type: 'inspect', label: 'Rest at Spring', key: 'E' }],
  },

  // 10. LAKESIDE LANDMARKS
  {
    id: 'mirror_lake',
    name: 'Mirror Lake Haven',
    description: 'A serene expanse of clear water reflecting the sky and mountains.',
    position: { x: 5000, y: 3800 },
    size: { x: 256, y: 192 },
    regionId: 'lakeside',
    type: 'water',
    sprite: 'mirror_lake',
    collision: true,
    discovered: false,
    discoveryMessage: 'You discovered Mirror Lake Haven!',
  },

  // 11. ABANDONED CAMP LANDMARKS
  {
    id: 'tattered_tents',
    name: 'Abandoned Explorer Encampment',
    description: 'Weathered tents, extinguished campfires, and forgotten supplies from a past expedition.',
    position: { x: 900, y: 2000 },
    size: { x: 160, y: 128 },
    regionId: 'abandoned_camp',
    type: 'structure',
    sprite: 'abandoned_camp',
    collision: true,
    discovered: false,
    discoveryMessage: 'You stumbled upon the Abandoned Explorer Encampment!',
    interactions: [{ type: 'inspect', label: 'Scavenge Supplies', key: 'E' }],
  },

  // 12. CAVE/UNDERGROUND LANDMARKS
  {
    id: 'crystal_chamber_cave',
    name: 'Luminescent Crystal Cavern',
    description: 'A deep subterranean cave gleaming with giant violet and azure crystals.',
    position: { x: 5000, y: -800 },
    size: { x: 160, y: 160 },
    regionId: 'cave_underground',
    type: 'natural',
    sprite: 'crystal_cave',
    collision: true,
    discovered: false,
    discoveryMessage: 'You entered the Luminescent Crystal Cavern!',
    interactions: [{ type: 'inspect', label: 'Gather Crystals', key: 'E' }],
  },
];

export function getLandmarksByRegion(regionId: string): Landmark[] {
  return landmarks.filter(l => l.regionId === regionId);
}

export function getLandmarkById(id: string): Landmark | undefined {
  return landmarks.find(l => l.id === id);
}

export function getLandmarksAtPosition(position: Vector2, radius: number = 50): Landmark[] {
  return landmarks.filter(l => {
    const dx = l.position.x - position.x;
    const dy = l.position.y - position.y;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  });
}