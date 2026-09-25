import type { NPCDefinition } from '@shared/types';

export const npcs: NPCDefinition[] = [
  {
    id: 'npc_mabel',
    name: 'Mabel',
    role: 'Village Gardener',
    position: { x: 400, y: 300 },
    sprite: 'npc_mabel',
    portrait: 'portrait_mabel',
    personality: ['warm', 'curious', 'eccentric'],
    backstory: 'Mabel has tended the village gardens for longer than anyone can remember. She speaks to her plants and swears they talk back. Her cottage overflows with dried herbs, seed packets, and curious botanical specimens.',
    dialogueTreeId: 'dialogue_mabel',
    questIds: ['quest_flower_hunt', 'quest_garden_help'],
    relationships: [
      { npcId: 'npc_arthur', relationship: 'old friend', level: 3 },
      { npcId: 'npc_rose', relationship: 'customer', level: 2 }
    ]
  },
  {
    id: 'npc_rose',
    name: 'Rose',
    role: 'Bakery Owner',
    position: { x: 600, y: 200 },
    sprite: 'npc_rose',
    portrait: 'portrait_rose',
    personality: ['cheerful', 'talkative', 'hardworking'],
    backstory: 'Rose runs the village bakery with boundless energy and an even more boundless collection of stories. She knows everyone\'s business and means well with every piece of gossip she shares.',
    dialogueTreeId: 'dialogue_rose',
    questIds: ['quest_bread_delivery', 'quest_baking_help'],
    relationships: [
      { npcId: 'npc_arthur', relationship: 'friend', level: 2 },
      { npcId: 'npc_mabel', relationship: 'supplier', level: 2 }
    ]
  },
  {
    id: 'npc_arthur',
    name: 'Arthur',
    role: 'Village Blacksmith',
    position: { x: 200, y: 400 },
    sprite: 'npc_arthur',
    portrait: 'portrait_arthur',
    personality: ['quiet', 'practical', 'kind'],
    backstory: 'Arthur speaks little and works much. His forge has produced every tool in the village for three generations. Beneath his stoic exterior lies a gentle soul who once dreamed of being a poet.',
    dialogueTreeId: 'dialogue_arthur',
    questIds: ['quest_tool_repair'],
    relationships: [
      { npcId: 'npc_mabel', relationship: 'old friend', level: 3 },
      { npcId: 'npc_luna', relationship: 'mentor', level: 2 }
    ]
  },
  {
    id: 'npc_luna',
    name: 'Luna',
    role: 'Wandering Artist',
    position: { x: 500, y: 500 },
    sprite: 'npc_luna',
    portrait: 'portrait_luna',
    personality: ['dreamy', 'adventurous', 'observant'],
    backstory: 'Luna drifted into Willowmere one autumn evening and never quite left. They sketch everything—the way light falls on morning dew, the shapes of clouds, the expressions on people\'s faces when they think no one is watching.',
    dialogueTreeId: 'dialogue_luna',
    questIds: ['quest_sketch_hunt', 'quest_inspiration'],
    relationships: [
      { npcId: 'npc_arthur', relationship: 'student', level: 2 }
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
