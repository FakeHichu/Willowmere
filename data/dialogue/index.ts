import type { DialogueTree } from '@shared/types';

export const dialogueTrees: DialogueTree[] = [
  {
    id: 'dialogue_arthur',
    npcId: 'npc_arthur',
    nodes: [
      {
        id: 'greeting',
        text: 'Welcome to Willowmere! I am Arthur, the Mayor. We are glad to have a new resident in our village.',
        choices: [
          { id: 'ask_village', text: 'Tell me about Willowmere.', nextNodeId: 'village_info' },
          { id: 'ask_quest', text: 'How can I contribute to the village?', nextNodeId: 'quest_info' },
          { id: 'leave', text: 'Thank you, Mayor Arthur!', nextNodeId: null }
        ]
      },
      {
        id: 'village_info',
        text: 'Willowmere is a peaceful place. We have the General Store to the west, Blacksmith to the east, and North Farm up top.',
        choices: [
          { id: 'ask_quest_2', text: 'Are there any tasks for me?', nextNodeId: 'quest_info' },
          { id: 'leave_2', text: 'I will go explore.', nextNodeId: null }
        ]
      },
      {
        id: 'quest_info',
        text: 'Bram at the forge could use some help collecting scrap iron around the village. Could you find 2 pieces for him?',
        choices: [
          { id: 'accept', text: 'I will find the scrap iron for Bram!', nextNodeId: 'accepted', action: { type: 'accept_quest', payload: { questId: 'quest_tool_repair' } } },
          { id: 'decline', text: 'I will check back later.', nextNodeId: null }
        ]
      },
      {
        id: 'accepted',
        text: 'Wonderful! Thank you for helping our community thrive.',
        choices: [{ id: 'go', text: 'On my way!', nextNodeId: null }]
      }
    ]
  },
  {
    id: 'dialogue_elara',
    npcId: 'npc_elara',
    nodes: [
      {
        id: 'greeting',
        text: 'Hello dear! Welcome to Willowmere General Store. What can I get for you today?',
        choices: [
          { id: 'browse', text: 'What do you sell here?', nextNodeId: 'store_talk' },
          { id: 'leave', text: 'Just looking around, thanks!', nextNodeId: null }
        ]
      },
      {
        id: 'store_talk',
        text: 'We carry fresh seeds, gardening watering cans, baked bread, and local crafts!',
        choices: [{ id: 'leave_2', text: 'I will check back soon!', nextNodeId: null }]
      }
    ]
  },
  {
    id: 'dialogue_bram',
    npcId: 'npc_bram',
    nodes: [
      {
        id: 'greeting',
        text: 'Clang... clang... Oh, hello! I am Bram. Need iron tools or anvil work?',
        choices: [
          { id: 'ask_work', text: 'Arthur sent me to check if you need scrap iron.', nextNodeId: 'iron_talk' },
          { id: 'leave', text: 'Keep up the good work!', nextNodeId: null }
        ]
      },
      {
        id: 'iron_talk',
        text: 'Aye! Scrap iron is essential for hammering new horseshoes and nails.',
        choices: [{ id: 'leave_2', text: 'I will find some for you!', nextNodeId: null }]
      }
    ]
  },
  {
    id: 'dialogue_lily',
    npcId: 'npc_lily',
    nodes: [
      {
        id: 'greeting',
        text: 'Good day! Mind the lavender beds—they are blooming so brightly today!',
        choices: [
          { id: 'flowers', text: 'Your flowers are lovely!', nextNodeId: 'flower_talk' },
          { id: 'leave', text: 'Have a great day!', nextNodeId: null }
        ]
      },
      {
        id: 'flower_talk',
        text: 'Thank you! If you ever gather wildflowers or sun-blossoms around the meadows, bring them by!',
        choices: [
          { id: 'accept', text: 'I can gather some wildflowers!', nextNodeId: 'flower_quest', action: { type: 'accept_quest', payload: { questId: 'quest_flower_hunt' } } },
          { id: 'leave_2', text: 'I will keep that in mind.', nextNodeId: null }
        ]
      },
      {
        id: 'flower_quest',
        text: 'Oh delightful! Thank you so much!',
        choices: [{ id: 'go', text: 'I will bring them soon!', nextNodeId: null }]
      }
    ]
  },
  {
    id: 'dialogue_finn',
    npcId: 'npc_finn',
    nodes: [
      {
        id: 'greeting',
        text: 'Welcome to Willowmere Inn! Warm hearth, hot stew, and fresh mattresses upstairs!',
        choices: [{ id: 'leave', text: 'Looks cozy in here!', nextNodeId: null }]
      }
    ]
  },
  {
    id: 'dialogue_mira',
    npcId: 'npc_mira',
    nodes: [
      {
        id: 'greeting',
        text: 'Shh... Welcome to the Library. Looking for village history or botanical lore?',
        choices: [{ id: 'leave', text: 'Just browsing the archives.', nextNodeId: null }]
      }
    ]
  },
  {
    id: 'dialogue_tom',
    npcId: 'npc_tom',
    nodes: [
      {
        id: 'greeting',
        text: 'Howdy! Watch your step near the horses. Need feed or a ride along the trail?',
        choices: [{ id: 'leave', text: 'Just passing by the stables!', nextNodeId: null }]
      }
    ]
  },
  {
    id: 'dialogue_nora',
    npcId: 'npc_nora',
    nodes: [
      {
        id: 'greeting',
        text: 'Shh... don\'t scare the trout! Early morning by the river is the best time to fish.',
        choices: [{ id: 'leave', text: 'Good luck with the catch!', nextNodeId: null }]
      }
    ]
  },
  {
    id: 'dialogue_walter',
    npcId: 'npc_walter',
    nodes: [
      {
        id: 'greeting',
        text: 'Welcome to North Farm! Hard work makes for bountiful harvests.',
        choices: [{ id: 'leave', text: 'Keep up the great crops!', nextNodeId: null }]
      }
    ]
  },
  {
    id: 'dialogue_sasha',
    npcId: 'npc_sasha',
    nodes: [
      {
        id: 'greeting',
        text: 'Hi hi! Do you want to play hide and seek or look at shiny pebbles with me?',
        choices: [{ id: 'leave', text: 'Maybe later, Sasha!', nextNodeId: null }]
      }
    ]
  }
];

export function getDialogueTreeById(id: string): DialogueTree | undefined {
  return dialogueTrees.find(tree => tree.id === id);
}

export function getDialogueTreeForNpc(npcId: string): DialogueTree | undefined {
  return dialogueTrees.find(tree => tree.npcId === npcId);
}
