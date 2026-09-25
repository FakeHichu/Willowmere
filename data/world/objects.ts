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
  // Village Center - Benches
  {
    id: 'bench_town_square_1',
    type: 'bench',
    position: { x: 350, y: 280 },
    size: { x: 64, y: 32 },
    sprite: 'bench_wooden',
    collision: true,
    interactions: benchInteractions,
    properties: { facing: 'up' }
  },
  {
    id: 'bench_town_square_2',
    type: 'bench',
    position: { x: 450, y: 280 },
    size: { x: 64, y: 32 },
    sprite: 'bench_wooden',
    collision: true,
    interactions: benchInteractions,
    properties: { facing: 'up' }
  },
  {
    id: 'bench_pond',
    type: 'bench',
    position: { x: 280, y: 480 },
    size: { x: 64, y: 32 },
    sprite: 'bench_wooden',
    collision: true,
    interactions: benchInteractions,
    properties: { facing: 'right' }
  },

  // Flowers
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
    id: 'flower_wildflower_2',
    type: 'flower',
    position: { x: 180, y: 320 },
    size: { x: 24, y: 24 },
    sprite: 'flower_wildflower',
    collision: false,
    interactions: flowerInteractions,
    properties: { itemType: 'item_wildflower' }
  },
  {
    id: 'flower_wildflower_3',
    type: 'flower',
    position: { x: 650, y: 450 },
    size: { x: 24, y: 24 },
    sprite: 'flower_wildflower',
    collision: false,
    interactions: flowerInteractions,
    properties: { itemType: 'item_wildflower' }
  },
  {
    id: 'flower_lavender_1',
    type: 'flower',
    position: { x: 150, y: 200 },
    size: { x: 24, y: 24 },
    sprite: 'flower_lavender',
    collision: false,
    interactions: flowerInteractions,
    properties: { itemType: 'item_lavender' }
  },
  {
    id: 'flower_sunflower_1',
    type: 'flower',
    position: { x: 700, y: 280 },
    size: { x: 32, y: 48 },
    sprite: 'flower_sunflower',
    collision: false,
    interactions: flowerInteractions,
    properties: { itemType: 'item_sunflower' }
  },

  // Pond
  {
    id: 'pond_main',
    type: 'pond',
    position: { x: 320, y: 520 },
    size: { x: 160, y: 96 },
    sprite: 'pond',
    collision: true,
    interactions: pondInteractions
  },

  // Notice Board
  {
    id: 'notice_board_town',
    type: 'notice_board',
    position: { x: 400, y: 180 },
    size: { x: 48, y: 64 },
    sprite: 'notice_board',
    collision: true,
    interactions: noticeBoardInteractions
  },

  // Doors
  {
    id: 'door_bakery',
    type: 'door',
    position: { x: 620, y: 180 },
    size: { x: 32, y: 48 },
    sprite: 'door_wood',
    collision: false,
    interactions: doorInteractions,
    properties: { building: 'bakery' }
  },
  {
    id: 'door_cottage_1',
    type: 'door',
    position: { x: 150, y: 150 },
    size: { x: 32, y: 48 },
    sprite: 'door_wood',
    collision: false,
    interactions: doorInteractions,
    properties: { building: 'cottage_1' }
  },
  {
    id: 'door_cottage_2',
    type: 'door',
    position: { x: 720, y: 350 },
    size: { x: 32, y: 48 },
    sprite: 'door_wood',
    collision: false,
    interactions: doorInteractions,
    properties: { building: 'cottage_2' }
  },

  // Mailboxes
  {
    id: 'mailbox_cottage_1',
    type: 'mailbox',
    position: { x: 100, y: 170 },
    size: { x: 24, y: 32 },
    sprite: 'mailbox',
    collision: true,
    interactions: mailboxInteractions
  },
  {
    id: 'mailbox_cottage_2',
    type: 'mailbox',
    position: { x: 780, y: 370 },
    size: { x: 24, y: 32 },
    sprite: 'mailbox',
    collision: true,
    interactions: mailboxInteractions
  },

  // Garden Plots
  {
    id: 'garden_plot_1',
    type: 'garden_plot',
    position: { x: 380, y: 320 },
    size: { x: 48, y: 48 },
    sprite: 'garden_plot',
    collision: false,
    interactions: gardenPlotInteractions
  },
  {
    id: 'garden_plot_2',
    type: 'garden_plot',
    position: { x: 430, y: 320 },
    size: { x: 48, y: 48 },
    sprite: 'garden_plot',
    collision: false,
    interactions: gardenPlotInteractions
  },
  {
    id: 'garden_plot_3',
    type: 'garden_plot',
    position: { x: 480, y: 320 },
    size: { x: 48, y: 48 },
    sprite: 'garden_plot',
    collision: false,
    interactions: gardenPlotInteractions
  },

  // Scrap Iron (for Arthur's quest)
  {
    id: 'scrap_iron_1',
    type: 'item_pickup',
    position: { x: 100, y: 450 },
    size: { x: 16, y: 16 },
    sprite: 'item_iron',
    collision: false,
    interactions: [{ type: 'pickup', label: 'Pick up', key: 'E' }],
    properties: { itemType: 'item_scrap_iron' }
  },
  {
    id: 'scrap_iron_2',
    type: 'item_pickup',
    position: { x: 550, y: 550 },
    size: { x: 16, y: 16 },
    sprite: 'item_iron',
    collision: false,
    interactions: [{ type: 'pickup', label: 'Pick up', key: 'E' }],
    properties: { itemType: 'item_scrap_iron' }
  }
];

export const villageMap: WorldMap = {
  id: 'map_village',
  name: 'Willowmere Village',
  width: 800,
  height: 600,
  tileSize: 32,
  layers: [
    {
      id: 'layer_ground',
      name: 'Ground',
      type: 'tile',
      data: [], // Will be generated procedurally for now
      opacity: 1,
      visible: true
    }
  ],
  objects: worldObjects,
  spawnPoint: { x: 400, y: 300 },
  ambientColor: '#f5f0e6'
};

export function getObjectById(id: string): WorldObject | undefined {
  return worldObjects.find(obj => obj.id === id);
}

export function getObjectsAtPosition(position: { x: number; y: number }, radius: number = 40): WorldObject[] {
  return worldObjects.filter(obj => {
    const dx = (obj.position.x + obj.size.x / 2) - position.x;
    const dy = (obj.position.y + obj.size.y / 2) - position.y;
    return Math.sqrt(dx * dx + dy * dy) <= radius + Math.max(obj.size.x, obj.size.y) / 2;
  });
}

export function getObjectsByType(type: string): WorldObject[] {
  return worldObjects.filter(obj => obj.type === type);
}
