import type { NPCDefinition } from '@shared/types';

export const npcs: NPCDefinition[] = [
  {
    id: 'npc_arthur',
    name: 'Arthur',
    role: 'Mayor & Leader',
    position: { x: 340, y: 200 },
    sprite: 'npc_arthur',
    portrait: 'portrait_arthur',
    personality: ['wise', 'responsible', 'welcoming'],
    backstory: 'Arthur has served as the Mayor of Willowmere for over a decade. He keeps the peace and helps newcomers find their place in the village.',
    dialogueTreeId: 'dialogue_arthur',
    questIds: ['quest_welcome_willowmere', 'quest_tool_repair'],
    schedule: [
      { time: '08:00', position: { x: 340, y: 200 }, action: 'office' },
      { time: '12:00', position: { x: 450, y: 300 }, action: 'town_square' },
      { time: '14:00', position: { x: 340, y: 200 }, action: 'office' },
      { time: '17:00', position: { x: 670, y: 380 }, action: 'inn' }
    ]
  },
  {
    id: 'npc_elara',
    name: 'Elara',
    role: 'General Store Owner',
    position: { x: 140, y: 300 },
    sprite: 'npc_elara',
    portrait: 'portrait_elara',
    personality: ['resourceful', 'friendly', 'shrewd'],
    backstory: 'Elara runs the Willowmere General Store, stocking seeds, tools, and local produce for all the villagers.',
    dialogueTreeId: 'dialogue_elara',
    questIds: ['quest_store_supplies'],
    schedule: [
      { time: '07:00', position: { x: 140, y: 300 }, action: 'shop' },
      { time: '19:00', position: { x: 670, y: 380 }, action: 'inn' }
    ]
  },
  {
    id: 'npc_bram',
    name: 'Bram',
    role: 'Village Blacksmith',
    position: { x: 640, y: 200 },
    sprite: 'npc_bram',
    portrait: 'portrait_bram',
    personality: ['hardworking', 'quiet', 'reliable'],
    backstory: 'Bram works the forge day in and day out, crafting iron tools and repairing farming equipment.',
    dialogueTreeId: 'dialogue_bram',
    questIds: ['quest_iron_forging'],
    schedule: [
      { time: '08:00', position: { x: 640, y: 200 }, action: 'forge' },
      { time: '18:00', position: { x: 450, y: 300 }, action: 'town_square' }
    ]
  },
  {
    id: 'npc_lily',
    name: 'Lily',
    role: 'Gardener',
    position: { x: 740, y: 440 },
    sprite: 'npc_lily',
    portrait: 'portrait_lily',
    personality: ['gentle', 'nature-lover', 'cheerful'],
    backstory: 'Lily tends the communal flower and herb gardens, always eager to share floral tips with curious visitors.',
    dialogueTreeId: 'dialogue_lily',
    questIds: ['quest_flower_hunt'],
    schedule: [
      { time: '06:00', position: { x: 740, y: 440 }, action: 'garden' },
      { time: '16:00', position: { x: 450, y: 300 }, action: 'town_square' }
    ]
  },
  {
    id: 'npc_finn',
    name: 'Finn',
    role: 'Innkeeper',
    position: { x: 690, y: 380 },
    sprite: 'npc_finn',
    portrait: 'portrait_finn',
    personality: ['hospitable', 'jovial', 'storyteller'],
    backstory: 'Finn keeps the fireplace warm and the stew brewing at the Willowmere Inn, greeting travelers with a warm smile.',
    dialogueTreeId: 'dialogue_finn',
    questIds: ['quest_inn_recipes'],
    schedule: [
      { time: '12:00', position: { x: 690, y: 380 }, action: 'inn_counter' },
      { time: '23:00', position: { x: 690, y: 380 }, action: 'rest' }
    ]
  },
  {
    id: 'npc_mira',
    name: 'Mira',
    role: 'Librarian & Historian',
    position: { x: 190, y: 450 },
    sprite: 'npc_mira',
    portrait: 'portrait_mira',
    personality: ['scholarly', 'curious', 'thoughtful'],
    backstory: 'Mira archives Willowmere ancient chronicles and manages the village library.',
    dialogueTreeId: 'dialogue_mira',
    questIds: ['quest_ancient_history'],
    schedule: [
      { time: '09:00', position: { x: 190, y: 450 }, action: 'library' },
      { time: '17:00', position: { x: 450, y: 300 }, action: 'town_square' }
    ]
  },
  {
    id: 'npc_tom',
    name: 'Tom',
    role: 'Stable Master',
    position: { x: 840, y: 200 },
    sprite: 'npc_tom',
    portrait: 'portrait_tom',
    personality: ['energetic', 'animal-lover', 'direct'],
    backstory: 'Tom cares for the village horses and manages transport along the forest paths.',
    dialogueTreeId: 'dialogue_tom',
    questIds: ['quest_stable_cleaning'],
    schedule: [
      { time: '07:00', position: { x: 840, y: 200 }, action: 'stables' },
      { time: '19:00', position: { x: 690, y: 380 }, action: 'inn' }
    ]
  },
  {
    id: 'npc_nora',
    name: 'Nora',
    role: 'Fisherwoman',
    position: { x: 920, y: 460 },
    sprite: 'npc_nora',
    portrait: 'portrait_nora',
    personality: ['patient', 'calm', 'perceptive'],
    backstory: 'Nora spends her mornings down by the river bank, fishing and taking in the morning mist.',
    dialogueTreeId: 'dialogue_nora',
    questIds: ['quest_fresh_catch'],
    schedule: [
      { time: '05:00', position: { x: 920, y: 460 }, action: 'riverside' },
      { time: '20:00', position: { x: 690, y: 380 }, action: 'inn' }
    ]
  },
  {
    id: 'npc_walter',
    name: 'Walter',
    role: 'Farmer',
    position: { x: 380, y: 100 },
    sprite: 'npc_walter',
    portrait: 'portrait_walter',
    personality: ['practical', 'hardworking', 'humorous'],
    backstory: 'Walter manages the North Farm fields, growing wheat, pumpkins, and apples for the community.',
    dialogueTreeId: 'dialogue_walter',
    questIds: ['quest_crop_harvest'],
    schedule: [
      { time: '06:00', position: { x: 380, y: 100 }, action: 'farm' },
      { time: '18:00', position: { x: 690, y: 380 }, action: 'inn' }
    ]
  },
  {
    id: 'npc_sasha',
    name: 'Sasha',
    role: 'Village Child',
    position: { x: 470, y: 340 },
    sprite: 'npc_sasha',
    portrait: 'portrait_sasha',
    personality: ['playful', 'curious', 'adventurous'],
    backstory: 'Sasha loves running around the town square, collecting shiny stones and playing hide and seek.',
    dialogueTreeId: 'dialogue_sasha',
    questIds: ['quest_lost_toy'],
    schedule: [
      { time: '08:00', position: { x: 470, y: 340 }, action: 'town_square' },
      { time: '16:00', position: { x: 400, y: 450 }, action: 'home' }
    ]
  }
];

export function getNpcById(id: string): NPCDefinition | undefined {
  return npcs.find(npc => npc.id === id);
}

export function getNpcsAtPosition(position: { x: number; y: number }, radius: number = 50): NPCDefinition[] {
  return npcs.filter(npc => {
    const dx = npc.position.x - position.x;
    const dy = npc.position.y - position.y;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  });
}
