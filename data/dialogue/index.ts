import type { DialogueTree } from '@shared/types';

export const dialogueTrees: DialogueTree[] = [
  {
    id: 'dialogue_mabel',
    npcId: 'npc_mabel',
    nodes: [
      {
        id: 'greeting',
        text: 'Oh, hello there! I don\'t believe we\'ve met. I\'m Mabel, the village gardener. Welcome to Willowmere!',
        choices: [
          { id: 'ask_garden', text: 'Your garden is beautiful!', nextNodeId: 'garden_talk' },
          { id: 'ask_help', text: 'Is there anything I can help with?', nextNodeId: 'offer_help' },
          { id: 'leave', text: 'Nice to meet you!', nextNodeId: null }
        ]
      },
      {
        id: 'garden_talk',
        text: 'Why thank you! I\'ve spent many years tending these plants. Each one has its own personality, you know.',
        choices: [
          { id: 'ask_personalities', text: 'Plants have personalities?', nextNodeId: 'plant_personalities' },
          { id: 'ask_help_2', text: 'Can I help with anything?', nextNodeId: 'offer_help' },
          { id: 'leave_2', text: 'I\'ll let you get back to work.', nextNodeId: null }
        ]
      },
      {
        id: 'plant_personalities',
        text: 'Of course! The roses are quite dramatic, the vegetables are practical folk, and the wildflowers... well, they\'re free spirits.',
        choices: [
          { id: 'leave_3', text: 'That\'s fascinating!', nextNodeId: null }
        ]
      },
      {
        id: 'offer_help',
        text: 'How thoughtful of you! I could use some wildflowers for a new arrangement. Would you gather 3 of them from around the village?',
        choices: [
          { id: 'accept_quest', text: 'I\'d be happy to help!', nextNodeId: 'quest_accepted', action: { type: 'accept_quest', payload: { questId: 'quest_flower_hunt' } } },
          { id: 'decline', text: 'Maybe another time.', nextNodeId: null }
        ]
      },
      {
        id: 'quest_accepted',
        text: 'Wonderful! Look for wildflowers near the meadow and by the stream. They love the sunshine!',
        choices: [
          { id: 'go', text: 'I\'ll find them!', nextNodeId: null }
        ]
      }
    ]
  },
  {
    id: 'dialogue_rose',
    npcId: 'npc_rose',
    nodes: [
      {
        id: 'greeting',
        text: 'Welcome, welcome! You must be new around here. I\'m Rose—I run the bakery. Have you tried our bread yet?',
        choices: [
          { id: 'praise', text: 'It smells amazing in here!', nextNodeId: 'bakery_talk' },
          { id: 'ask_help', text: 'Do you need any help?', nextNodeId: 'offer_help' },
          { id: 'leave', text: 'Just passing through!', nextNodeId: null }
        ]
      },
      {
        id: 'bakery_talk',
        text: 'Oh, you\'re too kind! I\'ve been baking since before the sun rose. There\'s something magical about bread, don\'t you think?',
        choices: [
          { id: 'ask_help_2', text: 'Anything I can do to help?', nextNodeId: 'offer_help' },
          { id: 'leave_2', text: 'I\'ll take a loaf to go!', nextNodeId: null }
        ]
      },
      {
        id: 'offer_help',
        text: 'Actually, yes! Arthur the blacksmith asked for a bread delivery, but I can\'t leave the oven. Could you take it to him?',
        choices: [
          { id: 'accept', text: 'I\'ll deliver it for you!', nextNodeId: 'quest_accepted', action: { type: 'accept_quest', payload: { questId: 'quest_bread_delivery' } } },
          { id: 'decline', text: 'Maybe later!', nextNodeId: null }
        ]
      },
      {
        id: 'quest_accepted',
        text: 'Thank you so much! Arthur\'s forge is on the east side of the village. He\'ll appreciate the fresh bread!',
        choices: [
          { id: 'go', text: 'On my way!', nextNodeId: null }
        ]
      }
    ]
  },
  {
    id: 'dialogue_arthur',
    npcId: 'npc_arthur',
    nodes: [
      {
        id: 'greeting',
        text: '...',
        choices: [
          { id: 'greet', text: 'Hello! I\'m new to the village.', nextNodeId: 'introduction' },
          { id: 'ask_work', text: 'What are you working on?', nextNodeId: 'work_talk' },
          { id: 'leave', text: '(wave and continue on)', nextNodeId: null }
        ]
      },
      {
        id: 'introduction',
        text: 'Arthur. I make the tools. Good to meet you.',
        choices: [
          { id: 'ask_work_2', text: 'What kind of tools?', nextNodeId: 'work_talk' },
          { id: 'ask_help', text: 'Need any help around here?', nextNodeId: 'offer_help' },
          { id: 'leave_2', text: 'Pleasure meeting you.', nextNodeId: null }
        ]
      },
      {
        id: 'work_talk',
        text: 'Hammers, plows, nails. Everything the village needs to grow and build. Practical things for practical work.',
        choices: [
          { id: 'ask_help_2', text: 'Can I help with anything?', nextNodeId: 'offer_help' },
          { id: 'leave_3', text: 'Keep up the good work.', nextNodeId: null }
        ]
      },
      {
        id: 'offer_help',
        text: 'Could use some scrap iron if you find any. Good materials are hard to come by.',
        choices: [
          { id: 'accept', text: 'I\'ll keep an eye out!', nextNodeId: 'quest_accepted', action: { type: 'accept_quest', payload: { questId: 'quest_tool_repair' } } },
          { id: 'decline', text: 'I\'ll let you know if I see any.', nextNodeId: null }
        ]
      },
      {
        id: 'quest_accepted',
        text: 'Appreciate it. Check near the old barn or the stream.',
        choices: [
          { id: 'go', text: 'I\'ll take a look.', nextNodeId: null }
        ]
      }
    ]
  },
  {
    id: 'dialogue_luna',
    npcId: 'npc_luna',
    nodes: [
      {
        id: 'greeting',
        text: 'Oh! I didn\'t see you there. I was watching how the light falls on those leaves. See how it turns gold at the edges?',
        choices: [
          { id: 'observe', text: 'It\'s beautiful.', nextNodeId: 'art_talk' },
          { id: 'ask_who', text: 'What are you doing?', nextNodeId: 'introduction' },
          { id: 'leave', text: 'I\'ll leave you to your observations.', nextNodeId: null }
        ]
      },
      {
        id: 'introduction',
        text: 'I\'m Luna. I sketch things—moments, really. The village has so many interesting ones. Every shadow tells a story.',
        choices: [
          { id: 'art_talk_2', text: 'That sounds lovely.', nextNodeId: 'art_talk' },
          { id: 'ask_help', text: 'Can I help with your art?', nextNodeId: 'offer_help' },
          { id: 'leave_2', text: 'Good luck with your sketches!', nextNodeId: null }
        ]
      },
      {
        id: 'art_talk',
        text: 'Isn\'t it? I\'m trying to capture the essence of this place. The way the wind moves through the grass, the sound of water...',
        choices: [
          { id: 'ask_help_2', text: 'Would you like some help?', nextNodeId: 'offer_help' },
          { id: 'leave_3', text: 'I\'ll let you work.', nextNodeId: null }
        ]
      },
      {
        id: 'offer_help',
        text: 'Actually... I\'ve heard there\'s an old pond by the willow tree. They say the reflections there are extraordinary. Could you find it for me?',
        choices: [
          { id: 'accept', text: 'I\'d love to help you find it!', nextNodeId: 'quest_accepted', action: { type: 'accept_quest', payload: { questId: 'quest_sketch_hunt' } } },
          { id: 'decline', text: 'I\'ll let you know if I see it.', nextNodeId: null }
        ]
      },
      {
        id: 'quest_accepted',
        text: 'Thank you! It should be somewhere past the farm, I think. I\'ll be here, sketching the clouds.',
        choices: [
          { id: 'go', text: 'I\'ll find it!', nextNodeId: null }
        ]
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
