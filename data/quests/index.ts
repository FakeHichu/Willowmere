import type { QuestDefinition } from '@shared/types';

export const quests: QuestDefinition[] = [
  {
    id: 'quest_flower_hunt',
    name: 'The Garden\'s Request',
    description: 'Mabel needs help gathering wildflowers for her garden.',
    giverNpcId: 'npc_mabel',
    steps: [
      {
        id: 'step_talk_mabel',
        type: 'talk',
        targetId: 'npc_mabel',
        description: 'Talk to Mabel about her garden',
        nextStepId: 'step_collect_flowers'
      },
      {
        id: 'step_collect_flowers',
        type: 'collect',
        targetId: 'item_wildflower',
        quantity: 3,
        description: 'Collect 3 wildflowers from around the village',
        nextStepId: 'step_return_mabel'
      },
      {
        id: 'step_return_mabel',
        type: 'talk',
        targetId: 'npc_mabel',
        description: 'Return to Mabel with the flowers',
        nextStepId: null
      }
    ],
    rewards: [
      { type: 'currency', quantity: 10 },
      { type: 'relationship', npcId: 'npc_mabel', quantity: 1 }
    ]
  },
  {
    id: 'quest_bread_delivery',
    name: 'Fresh from the Oven',
    description: 'Rose needs someone to deliver bread to Arthur.',
    giverNpcId: 'npc_rose',
    steps: [
      {
        id: 'step_accept_bread',
        type: 'talk',
        targetId: 'npc_rose',
        description: 'Get the bread from Rose',
        nextStepId: 'step_deliver_arthur'
      },
      {
        id: 'step_deliver_arthur',
        type: 'deliver',
        targetId: 'npc_arthur',
        itemId: 'item_bread_loaf',
        description: 'Deliver the bread to Arthur',
        nextStepId: null
      }
    ],
    rewards: [
      { type: 'item', itemId: 'item_bread_loaf', quantity: 1 },
      { type: 'currency', quantity: 15 }
    ],
    prerequisites: []
  },
  {
    id: 'quest_sketch_hunt',
    name: 'The Artist\'s Eye',
    description: 'Luna wants to sketch the most beautiful spots in the village.',
    giverNpcId: 'npc_luna',
    steps: [
      {
        id: 'step_talk_luna',
        type: 'talk',
        targetId: 'npc_luna',
        description: 'Ask Luna what they\'re looking for',
        nextStepId: 'step_find_pond'
      },
      {
        id: 'step_find_pond',
        type: 'reach',
        targetId: 'location_pond',
        targetPosition: { x: 350, y: 450 },
        description: 'Find the old pond by the willow tree',
        nextStepId: 'step_return_luna'
      },
      {
        id: 'step_return_luna',
        type: 'talk',
        targetId: 'npc_luna',
        description: 'Tell Luna about the pond',
        nextStepId: null
      }
    ],
    rewards: [
      { type: 'item', itemId: 'item_sketch', quantity: 1 },
      { type: 'relationship', npcId: 'npc_luna', quantity: 2 }
    ]
  },
  {
    id: 'quest_tool_repair',
    name: 'An Honest Day\'s Work',
    description: 'Arthur\'s old tools could use some repair work.',
    giverNpcId: 'npc_arthur',
    steps: [
      {
        id: 'step_talk_arthur',
        type: 'talk',
        targetId: 'npc_arthur',
        description: 'Ask Arthur about the tools',
        nextStepId: 'step_collect_iron',
      },
      {
        id: 'step_collect_iron',
        type: 'collect',
        targetId: 'item_scrap_iron',
        quantity: 2,
        description: 'Find scrap iron around the village',
        nextStepId: 'step_return_arthur'
      },
      {
        id: 'step_return_arthur',
        type: 'talk',
        targetId: 'npc_arthur',
        description: 'Return the scrap iron to Arthur',
        nextStepId: null
      }
    ],
    rewards: [
      { type: 'item', itemId: 'item_hammer', quantity: 1 },
      { type: 'currency', quantity: 20 },
      { type: 'relationship', npcId: 'npc_arthur', quantity: 1 }
    ]
  },
  {
    id: 'quest_garden_help',
    name: 'Green Thumbs',
    description: 'Help Mabel tend to the community garden.',
    giverNpcId: 'npc_mabel',
    steps: [
      {
        id: 'step_interact_garden',
        type: 'interact',
        targetId: 'object_garden_plot',
        quantity: 3,
        description: 'Water 3 garden plots',
        nextStepId: 'step_return_mabel_garden'
      },
      {
        id: 'step_return_mabel_garden',
        type: 'talk',
        targetId: 'npc_mabel',
        description: 'Let Mabel know the garden is watered',
        nextStepId: null
      }
    ],
    rewards: [
      { type: 'item', itemId: 'item_seeds', quantity: 5 },
      { type: 'relationship', npcId: 'npc_mabel', quantity: 2 }
    ],
    prerequisites: ['quest_flower_hunt']
  }
];

export function getQuestById(id: string): QuestDefinition | undefined {
  return quests.find(quest => quest.id === id);
}

export function getQuestsByNpc(npcId: string): QuestDefinition[] {
  return quests.filter(quest => quest.giverNpcId === npcId);
}

export function getAvailableQuests(completedQuestIds: string[], activeQuestIds: string[]): QuestDefinition[] {
  return quests.filter(quest => {
    const isCompleted = completedQuestIds.includes(quest.id);
    const isActive = activeQuestIds.includes(quest.id);
    if (isCompleted || isActive) return false;

    if (quest.prerequisites && quest.prerequisites.length > 0) {
      return quest.prerequisites.every(prereq => completedQuestIds.includes(prereq));
    }
    return true;
  });
}
