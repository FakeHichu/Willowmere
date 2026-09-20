import type { ItemDefinition } from '@/types';

export const items: ItemDefinition[] = [
  // Flowers
  {
    id: 'item_wildflower',
    name: 'Wildflower',
    description: 'A colorful wildflower found growing throughout the village.',
    category: 'flower',
    stackable: true,
    maxStack: 20,
    value: 2,
    sprite: 'item_wildflower'
  },
  {
    id: 'item_lavender',
    name: 'Lavender',
    description: 'Fragrant purple flowers with a calming scent.',
    category: 'flower',
    stackable: true,
    maxStack: 20,
    value: 3,
    sprite: 'item_lavender'
  },
  {
    id: 'item_sunflower',
    name: 'Sunflower',
    description: 'A tall, cheerful flower that follows the sun.',
    category: 'flower',
    stackable: true,
    maxStack: 10,
    value: 5,
    sprite: 'item_sunflower'
  },

  // Food
  {
    id: 'item_bread_loaf',
    name: 'Fresh Bread',
    description: 'A warm loaf of bread from Rose\'s bakery.',
    category: 'food',
    stackable: true,
    maxStack: 10,
    value: 8,
    sprite: 'item_bread'
  },
  {
    id: 'item_apple',
    name: 'Apple',
    description: 'A crisp red apple from the orchard.',
    category: 'food',
    stackable: true,
    maxStack: 20,
    value: 3,
    sprite: 'item_apple'
  },

  // Materials
  {
    id: 'item_scrap_iron',
    name: 'Scrap Iron',
    description: 'A piece of old iron that could be repurposed.',
    category: 'material',
    stackable: true,
    maxStack: 30,
    value: 5,
    sprite: 'item_iron'
  },
  {
    id: 'item_wood',
    name: 'Wood',
    description: 'A sturdy piece of timber.',
    category: 'material',
    stackable: true,
    maxStack: 30,
    value: 3,
    sprite: 'item_wood'
  },

  // Tools
  {
    id: 'item_hammer',
    name: 'Hammer',
    description: 'A well-crafted hammer from Arthur\'s forge.',
    category: 'tool',
    stackable: false,
    maxStack: 1,
    value: 50,
    sprite: 'item_hammer'
  },
  {
    id: 'item_watering_can',
    name: 'Watering Can',
    description: 'Essential for tending gardens.',
    category: 'tool',
    stackable: false,
    maxStack: 1,
    value: 30,
    sprite: 'item_watering_can'
  },

  // Gifts
  {
    id: 'item_sketch',
    name: 'Village Sketch',
    description: 'A beautiful sketch of Willowmere by Luna.',
    category: 'gift',
    stackable: false,
    maxStack: 1,
    value: 25,
    sprite: 'item_sketch'
  },

  // Seeds
  {
    id: 'item_seeds',
    name: 'Flower Seeds',
    description: 'A packet of assorted flower seeds from Mabel.',
    category: 'material',
    stackable: true,
    maxStack: 50,
    value: 2,
    sprite: 'item_seeds'
  }
];

export function getItemById(id: string): ItemDefinition | undefined {
  return items.find(item => item.id === id);
}

export function getItemsByCategory(category: ItemDefinition['category']): ItemDefinition[] {
  return items.filter(item => item.category === category);
}
