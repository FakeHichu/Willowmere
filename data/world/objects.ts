import type { WorldObject, Vector2 } from '@shared/types';

export const worldObjects: WorldObject[] = [
  // Village Props
  {
    id: 'prop_barrel_1',
    type: 'container',
    position: { x: 2920, y: 2200 },
    size: { x: 32, y: 32 },
    sprite: 'barrel',
    collision: true,
    interactions: [{ type: 'inspect', label: 'Inspect Barrel', action: { type: 'inspect' } }],
  },
  {
    id: 'prop_crate_1',
    type: 'container',
    position: { x: 2950, y: 2200 },
    size: { x: 32, y: 32 },
    sprite: 'crate',
    collision: true,
    interactions: [{ type: 'inspect', label: 'Search Crate', action: { type: 'inspect' } }],
  },
  {
    id: 'prop_bench_square',
    type: 'furniture',
    position: { x: 3050, y: 2320 },
    size: { x: 48, y: 24 },
    sprite: 'wooden_bench',
    collision: true,
    interactions: [{ type: 'sit', label: 'Sit Down', action: { type: 'sit' } }],
  },
  {
    id: 'prop_lantern_square_1',
    type: 'light_source',
    position: { x: 2980, y: 2280 },
    size: { x: 24, y: 48 },
    sprite: 'street_lantern',
    collision: true,
    interactions: [],
    properties: { lightRadius: 180, lightColor: '#ffb74d', intensity: 0.9 },
  },

  // Farmland Storytelling Props
  {
    id: 'prop_broken_wagon_farm',
    type: 'storytelling',
    position: { x: 1050, y: 3450 },
    size: { x: 64, y: 48 },
    sprite: 'broken_wagon',
    collision: true,
    interactions: [{ type: 'inspect', label: 'Examine Broken Cart', action: { type: 'inspect' } }],
    properties: { description: 'An old wooden wagon with a shattered wheel, moss growing on the spokes.' },
  },
  {
    id: 'prop_haybale_1',
    type: 'prop',
    position: { x: 1120, y: 3420 },
    size: { x: 40, y: 32 },
    sprite: 'haybale',
    collision: true,
    interactions: [],
  },

  // Abandoned Camp Storytelling Props
  {
    id: 'prop_extinguished_campfire',
    type: 'storytelling',
    position: { x: 920, y: 2020 },
    size: { x: 48, y: 48 },
    sprite: 'campfire_extinguished',
    collision: true,
    interactions: [{ type: 'inspect', label: 'Check Ashes', action: { type: 'inspect' } }],
    properties: { lightRadius: 60, lightColor: '#ff7043', intensity: 0.3 },
  },
  {
    id: 'prop_scattered_tools',
    type: 'storytelling',
    position: { x: 940, y: 2050 },
    size: { x: 32, y: 32 },
    sprite: 'abandoned_tools',
    collision: false,
    interactions: [{ type: 'pickup', label: 'Inspect Tools', action: { type: 'pickup' } }],
  },

  // Ancient Ruins Storytelling Props
  {
    id: 'prop_ruins_pillar_1',
    type: 'architecture',
    position: { x: 4750, y: 550 },
    size: { x: 48, y: 96 },
    sprite: 'stone_pillar_broken',
    collision: true,
    interactions: [],
  },
  {
    id: 'prop_ruins_chest',
    type: 'container',
    position: { x: 4850, y: 620 },
    size: { x: 40, y: 32 },
    sprite: 'ancient_chest',
    collision: true,
    interactions: [{ type: 'open', label: 'Open Ancient Chest', action: { type: 'open' } }],
  },

  // Whispering Woods Storytelling Props
  {
    id: 'prop_fallen_mossy_log',
    type: 'nature',
    position: { x: 2800, y: 650 },
    size: { x: 80, y: 32 },
    sprite: 'mossy_log',
    collision: true,
    interactions: [{ type: 'inspect', label: 'Look for Mushrooms', action: { type: 'inspect' } }],
  },
  {
    id: 'prop_forest_lantern',
    type: 'light_source',
    position: { x: 2420, y: 430 },
    size: { x: 24, y: 48 },
    sprite: 'stone_lantern',
    collision: true,
    interactions: [],
    properties: { lightRadius: 150, lightColor: '#81c784', intensity: 0.8 },
  },

  // Riverside Props
  {
    id: 'prop_fishing_net',
    type: 'prop',
    position: { x: 4920, y: 2320 },
    size: { x: 32, y: 32 },
    sprite: 'fishing_net',
    collision: false,
    interactions: [{ type: 'inspect', label: 'Inspect Net', action: { type: 'inspect' } }],
  },
];

export function getObjectsByRegion(regionId: string): WorldObject[] {
  // Return objects positioned within the region bounds or explicit region properties
  return worldObjects;
}

export function generateCollisionObjects(): Array<{ id: string; position: { x: number; y: number }; size: { width: number; height: number } }> {
  const collisionObjects: Array<{ id: string; position: { x: number; y: number }; size: { width: number; height: number } }> = [];

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

  return collisionObjects;
}

export function getObjectById(id: string): WorldObject | undefined {
  return worldObjects.find(obj => obj.id === id);
}

export const overworldMap = {
  id: 'overworld',
  name: 'Willowmere Overworld',
  width: 8000,
  height: 6000,
  tileSize: 32,
  spawnPoint: { x: 3000, y: 2400 },
};