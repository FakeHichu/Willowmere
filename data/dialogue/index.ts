import type { DialogueTree } from '@shared/types';

export const dialogueTrees: DialogueTree[] = [

  // ─── VILLAGE NPCs ───────────────────────────────────────────────────────────
  {
    id: 'dialogue_arthur',
    npcId: 'npc_arthur',
    nodes: [
      {
        id: 'greeting',
        text: 'Welcome to Willowmere! I am Arthur, the Mayor. We are glad to have you here. This village has stood for over two centuries, and every soul here matters.',
        choices: [
          { id: 'ask_village', text: 'Tell me about Willowmere.', nextNodeId: 'village_info' },
          { id: 'ask_quest', text: 'How can I contribute to the village?', nextNodeId: 'quest_info' },
          { id: 'ask_world', text: 'What lies beyond the village?', nextNodeId: 'world_info' },
          { id: 'leave', text: 'Good day, Mayor Arthur.', nextNodeId: null },
        ],
      },
      {
        id: 'village_info',
        text: 'Willowmere sits at the heart of a larger world. To the north, the Whispering Woods hide ancient secrets. East leads to Riverside Basin. The Ancient Ruins to the northeast are a constant source of curiosity.',
        choices: [
          { id: 'ask_quest_2', text: 'Are there tasks I could help with?', nextNodeId: 'quest_info' },
          { id: 'leave_2', text: 'I will go explore!', nextNodeId: null },
        ],
      },
      {
        id: 'world_info',
        text: 'Beyond our borders: the Whispering Woods to the north hide a Forest Ranger named Sylva. The Hidden Grove on the western edge is said to be blessed. And those ancient ruins to the northeast... Mira at the library knows more.',
        choices: [
          { id: 'interesting', text: 'Fascinating. I shall explore.', nextNodeId: null },
        ],
      },
      {
        id: 'quest_info',
        text: 'Bram at the forge could use help collecting scrap iron. Lily in the garden is also gathering rare herbs for the village medicine cabinet. Both are important for our community.',
        choices: [
          { id: 'accept', text: 'I will help Bram with the iron!', nextNodeId: 'accepted', action: { type: 'accept_quest', payload: { questId: 'quest_tool_repair' } } },
          { id: 'decline', text: 'I will think about it.', nextNodeId: null },
        ],
      },
      {
        id: 'accepted',
        text: 'Wonderful! Bram will be in his forge just east of here. Thank you — Willowmere grows stronger with every helping hand.',
        choices: [{ id: 'go', text: 'On my way!', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_elara',
    npcId: 'npc_elara',
    nodes: [
      {
        id: 'greeting',
        text: 'Good day! Welcome to Willowmere General Store. Seeds, tools, cured meats, fresh bread — I carry it all. What brings you in?',
        choices: [
          { id: 'browse', text: 'What are your best sellers?', nextNodeId: 'store_talk' },
          { id: 'rare', text: 'Do you ever carry anything unusual?', nextNodeId: 'rare_goods' },
          { id: 'leave', text: 'Just looking, thanks!', nextNodeId: null },
        ],
      },
      {
        id: 'store_talk',
        text: 'Our traveler\'s pack always sells fast — bread, rope, a lantern. Good for exploring the woods or the ruins. I also carry medicinal herbs sent by Lily.',
        choices: [{ id: 'leave_2', text: 'I will check back soon!', nextNodeId: null }],
      },
      {
        id: 'rare_goods',
        text: 'Sometimes the river merchant Petra passes through. She brings things from far away — elixirs, exotic dyes, strange trinkets. Hard to know what she will bring next.',
        choices: [{ id: 'thanks', text: 'Good to know. Thank you!', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_bram',
    npcId: 'npc_bram',
    nodes: [
      {
        id: 'greeting',
        text: 'Clang... clang... Oh! Welcome. I am Bram. I forge the tools this village runs on. Looking for something made of iron?',
        choices: [
          { id: 'ask_work', text: 'Arthur mentioned you need scrap iron.', nextNodeId: 'iron_talk' },
          { id: 'ask_craft', text: 'What can you forge?', nextNodeId: 'craft_talk' },
          { id: 'leave', text: 'Keep up the good work!', nextNodeId: null },
        ],
      },
      {
        id: 'iron_talk',
        text: 'Aye! Good man. Scrap iron is my lifeblood. Old nails, broken horseshoes, anything iron will do. If you find any lying about — near the stables or farmland — bring them over.',
        choices: [{ id: 'accept_iron', text: 'I will look for some scrap iron!', nextNodeId: null }],
      },
      {
        id: 'craft_talk',
        text: 'Anything iron or steel. Swords, axes, ploughshares, door hinges. You bring the ore, I bring the fire.',
        choices: [{ id: 'interesting', text: 'Impressive. I will come back when I have materials.', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_lily',
    npcId: 'npc_lily',
    nodes: [
      {
        id: 'greeting',
        text: 'Oh! Hello there. Mind the lavender beds — they are blooming so beautifully today. I am Lily, the village herbalist.',
        choices: [
          { id: 'herbs', text: 'What herbs do you grow here?', nextNodeId: 'herb_talk' },
          { id: 'quest_herb', text: 'Do you need any help gathering plants?', nextNodeId: 'herb_quest' },
          { id: 'leave', text: 'Your garden is beautiful!', nextNodeId: null },
        ],
      },
      {
        id: 'herb_talk',
        text: 'Lavender for calm, chamomile for sleep, bonewort for healing. The rarest are the Moonlit Lotus, which only bloom at night near the lakeside. I have only ever found three.',
        choices: [{ id: 'interesting', text: 'Moonlit Lotus... I will keep an eye out.', nextNodeId: null }],
      },
      {
        id: 'herb_quest',
        text: 'Yes! I need wildflowers and sun-blossoms from the meadows north of here. They are used in my healing salves for the village.',
        choices: [
          { id: 'accept', text: 'I can gather some wildflowers!', nextNodeId: 'herb_accepted', action: { type: 'accept_quest', payload: { questId: 'quest_flower_hunt' } } },
          { id: 'decline', text: 'I will come back when I can.', nextNodeId: null },
        ],
      },
      {
        id: 'herb_accepted',
        text: 'Oh thank you! Wildflowers are best found in the meadows near the Whispering Woods edge. Please, be careful if you go too far in.',
        choices: [{ id: 'go', text: 'I will bring you some flowers soon!', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_finn',
    npcId: 'npc_finn',
    nodes: [
      {
        id: 'greeting',
        text: 'Ahh, welcome to the Willowmere Inn! Warm hearth, fresh stew, and a soft bed upstairs. I am Finn, your host. What brings you in?',
        choices: [
          { id: 'ask_rumors', text: 'Heard any interesting news lately?', nextNodeId: 'rumors' },
          { id: 'ask_rest', text: 'Tell me about resting here.', nextNodeId: 'rest_info' },
          { id: 'leave', text: 'Cozy place! I will be back.', nextNodeId: null },
        ],
      },
      {
        id: 'rumors',
        text: 'Let me think... Old Gareth down by the riverside says he saw lights under the deep water at night. And that archaeologist at the ruins found something that shook him. He came in here looking pale as a ghost.',
        choices: [{ id: 'interesting', text: 'Intriguing... Thank you, Finn.', nextNodeId: null }],
      },
      {
        id: 'rest_info',
        text: 'A good sleep here restores your strength and brightens the next morning. World feels sharper after a proper rest at the inn. I always say — a tired traveler makes poor decisions.',
        choices: [{ id: 'thanks', text: 'Wise words. Thank you!', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_mira',
    npcId: 'npc_mira',
    nodes: [
      {
        id: 'greeting',
        text: 'Oh! Shh... Welcome to the Library. I am Mira, keeper of Willowmere\'s chronicles. Are you here to learn or just to wander?',
        choices: [
          { id: 'history', text: 'Tell me about the history of this land.', nextNodeId: 'history_talk' },
          { id: 'ruins', text: 'What do you know about the Ancient Ruins?', nextNodeId: 'ruins_talk' },
          { id: 'leave', text: 'Just passing through. Have a good day!', nextNodeId: null },
        ],
      },
      {
        id: 'history_talk',
        text: 'Willowmere was founded over two centuries ago. The land predates the village by millennia. The Ancient Ruins to the northeast belong to a civilization called the Aerthian. They vanished without explanation.',
        choices: [
          { id: 'aerthian', text: 'What happened to the Aerthians?', nextNodeId: 'aerthian_talk' },
        ],
      },
      {
        id: 'aerthian_talk',
        text: 'No one knows. The records simply stop. No war, no plague recorded. They were here — then gone. The ruins still hum with some power no one has identified. Professor Aldwyn is trying to learn more.',
        choices: [{ id: 'quest_tomb', text: 'I would like to help investigate.', nextNodeId: 'quest_offer', action: { type: 'accept_quest', payload: { questId: 'quest_ancient_history' } } }],
      },
      {
        id: 'quest_offer',
        text: 'Then I suggest speaking with Aldwyn at the ruins. Tell him I sent you. Here — take this partial translation I found. It may open certain sealed doors.',
        choices: [{ id: 'thanks', text: 'Thank you, Mira. I will head to the ruins.', nextNodeId: null }],
      },
      {
        id: 'ruins_talk',
        text: 'The Ancient Ruins cover the northeastern region. Magnus guards the outer perimeter — he is affiliated with an order whose name I have not been able to translate. And deep within... well. There are things in the archive I dare not repeat in daylight.',
        choices: [{ id: 'interesting', text: 'Mysterious. I will investigate carefully.', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_tom',
    npcId: 'npc_tom',
    nodes: [
      {
        id: 'greeting',
        text: 'Howdy! Tom here, stable master. Watch your step around Bramble — she bites. You looking to hire a horse or just visiting?',
        choices: [
          { id: 'ask_horse', text: 'How do I hire a horse?', nextNodeId: 'horse_info' },
          { id: 'ask_trails', text: 'What do you know about the forest trails?', nextNodeId: 'trail_talk' },
          { id: 'leave', text: 'Just looking at the horses!', nextNodeId: null },
        ],
      },
      {
        id: 'horse_info',
        text: 'For a few coins, you can take a horse along the main road. They are not built for forest trails though — too many roots and low branches. You\'ll want to go on foot if heading north.',
        choices: [{ id: 'thanks', text: 'Good to know. Thanks, Tom.', nextNodeId: null }],
      },
      {
        id: 'trail_talk',
        text: 'I know every trail south and east. For the woods... ask the ranger, Sylva. She patrols those paths. You will find her in the Whispering Woods, usually near the big oak at the ridge.',
        choices: [{ id: 'thanks', text: 'I will find Sylva. Thank you!', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_nora',
    npcId: 'npc_nora',
    nodes: [
      {
        id: 'greeting',
        text: '...Shh. Don\'t scare the trout. I am Nora. The river gives generously to those who are patient.',
        choices: [
          { id: 'fish', text: 'Caught anything good today?', nextNodeId: 'fish_talk' },
          { id: 'river', text: 'What is special about Riverside Basin?', nextNodeId: 'river_talk' },
          { id: 'leave', text: 'Good luck with the catch!', nextNodeId: null },
        ],
      },
      {
        id: 'fish_talk',
        text: 'Two silver trout and a catfish this morning. Nothing unusual... except the deep river glowed faintly at midnight last week. Not like moonlight. Deeper. Old Gareth saw it too.',
        choices: [{ id: 'mysterious', text: 'Strange. A glowing river...', nextNodeId: null }],
      },
      {
        id: 'river_talk',
        text: 'The Basin leads to the Great Waterfall to the north. Below that waterfall... no one goes. Current is too strong. But sometimes you can hear something from below. Not water sounds. Something else.',
        choices: [{ id: 'creepy', text: 'I may have to investigate that waterfall...', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_walter',
    npcId: 'npc_walter',
    nodes: [
      {
        id: 'greeting',
        text: 'Aha, a new face! Welcome to North Farm. I am Walter. Hard work and good soil is all you need for a proper life.',
        choices: [
          { id: 'ask_farm', text: 'What do you grow here?', nextNodeId: 'farm_talk' },
          { id: 'ask_help', text: 'Do you need help with anything?', nextNodeId: 'quest_offer' },
          { id: 'leave', text: 'Good crops this season!', nextNodeId: null },
        ],
      },
      {
        id: 'farm_talk',
        text: 'Wheat, pumpkins, apples, and a few rows of barley. The Southern Farmland grows more — Edith runs a bigger operation. But this patch provides the village\'s daily bread.',
        choices: [{ id: 'thanks', text: 'Impressive work. Keep it up!', nextNodeId: null }],
      },
      {
        id: 'quest_offer',
        text: 'Actually — if you come across any wild mushrooms in the forest, I could use them. They make the best soup. And my wife says the southern orchards need checking. Could you head down that way?',
        choices: [
          { id: 'accept', text: 'I can check the orchards for you.', nextNodeId: null, action: { type: 'accept_quest', payload: { questId: 'quest_crop_harvest' } } },
          { id: 'decline', text: 'Maybe another time!', nextNodeId: null },
        ],
      },
    ],
  },

  {
    id: 'dialogue_sasha',
    npcId: 'npc_sasha',
    nodes: [
      {
        id: 'greeting',
        text: 'Hi hi! I found a shiny pebble today and it has got little sparks inside! Do you want to see? Or we could play hide and seek!',
        choices: [
          { id: 'pebble', text: 'Let me see the pebble!', nextNodeId: 'pebble_talk' },
          { id: 'game', text: 'Tell me about your adventures around the village.', nextNodeId: 'adventure_talk' },
          { id: 'leave', text: 'Maybe later, Sasha!', nextNodeId: null },
        ],
      },
      {
        id: 'pebble_talk',
        text: 'See! There are tiny gold specks inside! I found it near the old wall behind the library. There are lots of interesting things near that wall if you look carefully.',
        choices: [{ id: 'thanks', text: 'Wow! What a find, Sasha!', nextNodeId: null }],
      },
      {
        id: 'adventure_talk',
        text: 'I found a hidden gap behind the mill! And there is a really tall tree in the woods that has faces carved in the bark. I saw them once but I was not allowed to go back.',
        choices: [{ id: 'curious', text: 'Faces on a tree? That is curious.', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_priest',
    npcId: 'npc_priest',
    nodes: [
      {
        id: 'greeting',
        text: 'Blessings, traveler. I am Brother Aldric. The chapel is open to any soul seeking rest or reflection. Is there something weighing on your heart?',
        choices: [
          { id: 'shrine', text: 'I heard of an Old Shrine to the north. Tell me about it.', nextNodeId: 'shrine_talk' },
          { id: 'bless', text: 'Can you offer a blessing before I travel?', nextNodeId: 'bless_talk' },
          { id: 'leave', text: 'Thank you, Brother Aldric.', nextNodeId: null },
        ],
      },
      {
        id: 'shrine_talk',
        text: 'The Old Shrine is ancient — older than Willowmere, older than memory. Its keeper is Seraphina. She has maintained it alone for as long as I can remember. The pilgrimage there is said to bring clarity to the troubled mind.',
        choices: [
          { id: 'quest_shrine', text: 'I will make the pilgrimage.', nextNodeId: null, action: { type: 'accept_quest', payload: { questId: 'quest_shrine_blessing' } } },
        ],
      },
      {
        id: 'bless_talk',
        text: 'Of course. May your steps be firm and your sight clear. May you find what you seek, and may what you find not be the thing you feared.',
        choices: [{ id: 'thanks', text: 'Thank you, Brother Aldric.', nextNodeId: null }],
      },
    ],
  },

  // ─── RIVERSIDE NPCs ──────────────────────────────────────────────────────
  {
    id: 'dialogue_fisherman',
    npcId: 'npc_fisherman',
    nodes: [
      {
        id: 'greeting',
        text: 'Forty years on this river and she still surprises me. Name\'s Gareth. You here to fish or just gazing at the water?',
        choices: [
          { id: 'lights', text: 'I heard about strange lights under the water...', nextNodeId: 'lights_talk' },
          { id: 'fish', text: 'What is good fishing around here?', nextNodeId: 'fishing_talk' },
          { id: 'leave', text: 'Good luck with the lines, Gareth.', nextNodeId: null },
        ],
      },
      {
        id: 'lights_talk',
        text: 'Aye. Three weeks back. The deep pool just north of the big rock. Pulsing light, blue-green. Like something breathing down there. Nora saw it too. Not a fish — too steady. Too deliberate.',
        choices: [
          { id: 'investigate', text: 'I want to investigate that pool.', nextNodeId: null, action: { type: 'accept_quest', payload: { questId: 'quest_deep_water_mystery' } } },
        ],
      },
      {
        id: 'fishing_talk',
        text: 'The calm stretches near the tall reeds give silver trout at dawn. After the waterfall, there are golden carp — but crossing that current is not for the faint of heart.',
        choices: [{ id: 'thanks', text: 'Helpful. Thank you, Gareth.', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_river_merchant',
    npcId: 'npc_river_merchant',
    nodes: [
      {
        id: 'greeting',
        text: 'Welcome, welcome! I am Petra, merchant of the river road. Rare goods, unusual trinkets, things you will not find in that sleepy village market.',
        choices: [
          { id: 'browse', text: 'Show me what you have!', nextNodeId: 'merchant_goods' },
          { id: 'shortcut', text: 'Do you know any shortcuts through the woods?', nextNodeId: 'shortcut_talk' },
          { id: 'leave', text: 'Maybe next time, Petra.', nextNodeId: null },
        ],
      },
      {
        id: 'merchant_goods',
        text: 'Today I have a vial of deep-river essence, a compass that points to treasure rather than north, and dried herbs from the coastal highlands. All genuine, all rare.',
        choices: [{ id: 'thanks', text: 'I will keep it in mind.', nextNodeId: null }],
      },
      {
        id: 'shortcut_talk',
        text: 'Ha! Information is a commodity too, friend. But... I like your face. The hidden path through the north bank reeds — it cuts four minutes off the trip to the ruins. Do not tell Sylva I told you.',
        choices: [{ id: 'thanks', text: 'I appreciate it. Thank you, Petra.', nextNodeId: null }],
      },
    ],
  },

  // ─── WHISPERING WOODS NPCs ────────────────────────────────────────────────
  {
    id: 'dialogue_ranger',
    npcId: 'npc_ranger',
    nodes: [
      {
        id: 'greeting',
        text: 'Halt. I am Sylva, Forest Ranger. These woods are not safe for the unprepared. State your business.',
        choices: [
          { id: 'explore', text: 'I am exploring the area.', nextNodeId: 'explore_talk' },
          { id: 'poachers', text: 'Have you seen any unusual activity?', nextNodeId: 'poacher_talk' },
          { id: 'leave', text: 'Understood. I will be careful.', nextNodeId: null },
        ],
      },
      {
        id: 'explore_talk',
        text: 'Then stay on the marked trail. The deeper you go, the more... the woods change. The Ancient Tree at the north ridge is a landmark — you can orient yourself by it. But do not approach it at night.',
        choices: [{ id: 'why', text: 'Why not at night?', nextNodeId: 'night_warning' }],
      },
      {
        id: 'night_warning',
        text: 'Because someone — something — is already there. A robed figure. It watches and it whispers. I have not been able to approach without... feeling like I should not be there.',
        choices: [{ id: 'curious', text: 'I think I need to speak to this figure.', nextNodeId: null }],
      },
      {
        id: 'poacher_talk',
        text: 'Tracks. Boot prints, wide spacing — these people are moving fast and carrying weight. They are hunting the deer in the protected grove. If you see any, send word.',
        choices: [
          { id: 'accept', text: 'I will keep watch.', nextNodeId: null, action: { type: 'accept_quest', payload: { questId: 'quest_poacher_trail' } } },
        ],
      },
    ],
  },

  {
    id: 'dialogue_traveler',
    npcId: 'npc_traveler',
    nodes: [
      {
        id: 'greeting',
        text: 'Oh! Another person! Thank goodness. I am Marco — completely, utterly lost. I came looking for the Ancient Ruins and ended up... here.',
        choices: [
          { id: 'help', text: 'I can help guide you to the ruins.', nextNodeId: 'escort_talk' },
          { id: 'directions', text: 'The ruins are northeast. Keep the river to your right.', nextNodeId: 'directions_talk' },
          { id: 'leave', text: 'Good luck, Marco!', nextNodeId: null },
        ],
      },
      {
        id: 'escort_talk',
        text: 'You would do that? Wonderful! I have a letter for the Professor at the ruins. He is supposed to help me find... well, I probably should not say until we get there.',
        choices: [
          { id: 'accept', text: 'Lead the way — or follow me, rather.', nextNodeId: null, action: { type: 'accept_quest', payload: { questId: 'quest_escort_ruins' } } },
        ],
      },
      {
        id: 'directions_talk',
        text: 'Northeast, river to my right. Got it. Wait — I came from the river. Does that mean I went the wrong way? Oh no...',
        choices: [{ id: 'reassure', text: 'You will find it. The ruins are hard to miss.', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_mysterious',
    npcId: 'npc_mysterious',
    nodes: [
      {
        id: 'greeting',
        text: '...You found me. The tree showed you the way, yes? Not everyone can see the path to this place.',
        choices: [
          { id: 'who', text: 'Who are you?', nextNodeId: 'identity_talk' },
          { id: 'tree', text: 'What is the Ancient Tree?', nextNodeId: 'tree_talk' },
          { id: 'leave', text: '...I will come back another time.', nextNodeId: null },
        ],
      },
      {
        id: 'identity_talk',
        text: 'Names are cages. I have had many. I have watched this forest for longer than the village has stood. The Aerthians called me by one name. Your kind now calls me nothing at all.',
        choices: [{ id: 'ancient', text: 'You are connected to the Ancient Civilization...', nextNodeId: 'aerthian_secret' }],
      },
      {
        id: 'aerthian_secret',
        text: 'The Aerthians did not vanish. They changed. The ruins above ground are a shell. What they became... lives beneath. And it is waking. Slowly. You must be careful in those ruins.',
        choices: [{ id: 'quest', text: 'What should I do?', nextNodeId: null, action: { type: 'accept_quest', payload: { questId: 'quest_ancient_secret' } } }],
      },
      {
        id: 'tree_talk',
        text: 'This tree is the oldest living thing in the valley. It remembers the world before the first stone was laid. It breathes. It dreams. And lately... it has been restless.',
        choices: [{ id: 'understand', text: 'I understand. I will be careful.', nextNodeId: null }],
      },
    ],
  },

  // ─── SOUTHERN FARMLAND NPCs ──────────────────────────────────────────────
  {
    id: 'dialogue_farmer_main',
    npcId: 'npc_farmer_main',
    nodes: [
      {
        id: 'greeting',
        text: 'Ah, a visitor! I am Edith. These are the Southern Farmlands — been in my family three generations. Something I can help you with?',
        choices: [
          { id: 'help', text: 'Do you need any help on the farm?', nextNodeId: 'quest_offer' },
          { id: 'blight', text: 'Are the crops doing well this season?', nextNodeId: 'blight_talk' },
          { id: 'leave', text: 'Just passing through. Nice farm!', nextNodeId: null },
        ],
      },
      {
        id: 'quest_offer',
        text: 'Actually, yes. The western wheat field has a strange color to it. Might be blight, might be something worse. Could you look and report back to me?',
        choices: [
          { id: 'accept', text: 'I will check the wheat field for you.', nextNodeId: null, action: { type: 'accept_quest', payload: { questId: 'quest_crop_blight' } } },
          { id: 'decline', text: 'Not right now, but I will remember.', nextNodeId: null },
        ],
      },
      {
        id: 'blight_talk',
        text: 'Most of it, yes. But the west field... something is off. The wheat yellowed too fast. Denis says he saw strange tracks near it at night. Not animal tracks.',
        choices: [{ id: 'strange', text: 'That is worrying. I will take a look.', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_farmhand',
    npcId: 'npc_farmhand_1',
    nodes: [
      {
        id: 'greeting',
        text: 'Hiya! Denis here. Pumpkin season is my favourite — there is something satisfying about pulling a fat pumpkin off the vine. You looking for Edith?',
        choices: [
          { id: 'tracks', text: 'I heard about strange tracks near the wheat field?', nextNodeId: 'tracks_talk' },
          { id: 'leave', text: 'Just exploring. Keep up the good work!', nextNodeId: null },
        ],
      },
      {
        id: 'tracks_talk',
        text: 'Yeah, I saw them. Three-toed. Wide apart. Deeper than a man\'s boot. Whatever made them was heavy. And it moved in a circle, like it was inspecting the crop.',
        choices: [{ id: 'thanks', text: 'Interesting. Thank you, Denis.', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_farmhand2',
    npcId: 'npc_farmhand_2',
    nodes: [
      {
        id: 'greeting',
        text: 'Oh hello. Rosa. I tend the orchard. Can I help you?',
        choices: [
          { id: 'apples', text: 'How are the apple trees looking?', nextNodeId: 'apple_talk' },
          { id: 'leave', text: 'Lovely orchard. Keep at it!', nextNodeId: null },
        ],
      },
      {
        id: 'apple_talk',
        text: 'Most are good, but the oldest tree — the gnarled one at the southeast corner — has not fruited in two years. I think it misses the old well that dried up. Water it from the river, maybe.',
        choices: [{ id: 'thanks', text: 'I will see what I can do.', nextNodeId: null }],
      },
    ],
  },

  // ─── ANCIENT RUINS NPCs ──────────────────────────────────────────────────
  {
    id: 'dialogue_archaeologist',
    npcId: 'npc_archaeologist',
    nodes: [
      {
        id: 'greeting',
        text: 'Not now, I am— oh! A visitor. Forgive me. I am Professor Aldwyn. Three years excavating these ruins and they still hold secrets. Are you here to help or to wander?',
        choices: [
          { id: 'help', text: 'I would like to help with the excavation.', nextNodeId: 'help_talk' },
          { id: 'ruins', text: 'What have you found so far?', nextNodeId: 'discovery_talk' },
          { id: 'leave', text: 'Just passing through, Professor.', nextNodeId: null },
        ],
      },
      {
        id: 'help_talk',
        text: 'Excellent! I need someone to retrieve three engraved stones from the lower vault. The entrance is past the guardian Magnus. I cannot get through — he does not trust scholars. But perhaps a traveler could prove themselves differently.',
        choices: [
          { id: 'accept', text: 'I will find those engraved stones.', nextNodeId: null, action: { type: 'accept_quest', payload: { questId: 'quest_artifact_recovery' } } },
        ],
      },
      {
        id: 'discovery_talk',
        text: 'A calendar system that predicted astronomical events we have only just confirmed. A language that shares roots with no known tongue. And a chamber that... hums. At certain frequencies. As if it is responding to something.',
        choices: [{ id: 'fascinating', text: 'Remarkable. What do you think it is?', nextNodeId: 'theory_talk' }],
      },
      {
        id: 'theory_talk',
        text: 'My theory? The Aerthians built a conduit. For what, I do not know. But three weeks ago it pulsed. Once. I have not slept properly since.',
        choices: [{ id: 'thanks', text: 'I will help you figure it out.', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_ruins_guard',
    npcId: 'npc_ruins_guard',
    nodes: [
      {
        id: 'greeting',
        text: 'This site is protected by the Order of the Sealed Gate. Entry requires proof of worthiness. State your intention.',
        choices: [
          { id: 'worthy', text: 'I wish to prove myself worthy.', nextNodeId: 'trial_talk' },
          { id: 'mira', text: 'Mira at the village library sent me. She had a translation.', nextNodeId: 'mira_mention' },
          { id: 'leave', text: 'I will come back when I am prepared.', nextNodeId: null },
        ],
      },
      {
        id: 'trial_talk',
        text: 'The trial is this: retrieve the three stone markers from the outer ring and return them here in correct order. Those who have no purpose in this place cannot identify the correct sequence.',
        choices: [
          { id: 'accept', text: 'I will find the markers.', nextNodeId: null, action: { type: 'accept_quest', payload: { questId: 'quest_prove_worth' } } },
        ],
      },
      {
        id: 'mira_mention',
        text: '...Mira sent you. That changes things. The keeper of Willowmere\'s archives vouches for you. You may proceed — but take nothing that belongs here.',
        choices: [{ id: 'understood', text: 'Understood. I will be respectful.', nextNodeId: null }],
      },
    ],
  },

  // ─── GROVE + LAKESIDE + HIGHLAND + CAMP NPCs ────────────────────────────
  {
    id: 'dialogue_druid',
    npcId: 'npc_druid',
    nodes: [
      {
        id: 'greeting',
        text: 'Be welcome, young traveler. I am Elder Fenwick. Few find their way here unless the grove wishes to receive them. What seeks you?',
        choices: [
          { id: 'blessing', text: 'I seek a blessing for my journey.', nextNodeId: 'blessing_talk' },
          { id: 'grove', text: 'What is this place?', nextNodeId: 'grove_talk' },
          { id: 'leave', text: 'I am simply exploring. This place is beautiful.', nextNodeId: null },
        ],
      },
      {
        id: 'blessing_talk',
        text: 'Bring me a moonlit lotus — they bloom at the lakeside after midnight. In exchange, I will weave a blessing into your boots. You will walk faster and quieter through wild terrain.',
        choices: [
          { id: 'accept', text: 'I will find the moonlit lotus.', nextNodeId: null, action: { type: 'accept_quest', payload: { questId: 'quest_grove_blessing' } } },
        ],
      },
      {
        id: 'grove_talk',
        text: 'This grove is a nexus — a point where the land\'s energy concentrates. Plants grow twice as fast here. Animals are calm. And things that should not be possible... sometimes are.',
        choices: [{ id: 'thanks', text: 'Remarkable. Thank you, Elder.', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_hermit',
    npcId: 'npc_hermit',
    nodes: [
      {
        id: 'greeting',
        text: '...What do you want. I am not selling and I am not entertaining. State your business quickly.',
        choices: [
          { id: 'trade', text: 'I heard you have rare herbs and potions.', nextNodeId: 'trade_talk' },
          { id: 'lake', text: 'Do you know anything strange about the lake?', nextNodeId: 'lake_talk' },
          { id: 'leave', text: 'Nothing. Carry on.', nextNodeId: null },
        ],
      },
      {
        id: 'trade_talk',
        text: 'Hmph. I might. Bring me something useful — dried river-reeds, ten of them — and I will give you a restoration tonic worth three times the trouble.',
        choices: [
          { id: 'accept', text: 'I will find you river-reeds.', nextNodeId: null, action: { type: 'accept_quest', payload: { questId: 'quest_hermit_errand' } } },
        ],
      },
      {
        id: 'lake_talk',
        text: 'The lake is deep. Too deep. I dropped a rope weighted with stone — it never hit bottom. And at the new moon... something pushes air up from below. Warm air. This high up. Make of that what you will.',
        choices: [{ id: 'noted', text: 'That is unsettling. Thank you.', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_mountaineer',
    npcId: 'npc_mountaineer',
    nodes: [
      {
        id: 'greeting',
        text: 'Kira. Mountain guide. Glad to see someone made it to the trail head without turning back. What brings you up here?',
        choices: [
          { id: 'summit', text: 'I want to reach the summit.', nextNodeId: 'summit_talk' },
          { id: 'guide', text: 'Can you guide me through the Highland Trail?', nextNodeId: 'guide_talk' },
          { id: 'leave', text: 'Just scouting the terrain.', nextNodeId: null },
        ],
      },
      {
        id: 'summit_talk',
        text: 'Good. The summit of Greymane offers a view of every region for miles. On a clear day you can see the ruins, the grove, even the coast. But there is something at the top — a stone marker. Bring it back and I can read it for you.',
        choices: [
          { id: 'accept', text: 'I will climb to the summit.', nextNodeId: null, action: { type: 'accept_quest', payload: { questId: 'quest_summit_stone' } } },
        ],
      },
      {
        id: 'guide_talk',
        text: 'Follow the red cairns and you will be fine up to the second ridge. After that, the rock is loose and the wind picks up. Stay low, lean into the slope, and never stop moving.',
        choices: [{ id: 'thanks', text: 'Good advice. Thank you, Kira.', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_scout',
    npcId: 'npc_scout',
    nodes: [
      {
        id: 'greeting',
        text: 'Oh thank goodness, someone else! I am Dax. I found this camp two days ago and I cannot shake the feeling I am being watched. Look at this — who left in such a hurry?',
        choices: [
          { id: 'investigate', text: 'Let me look around the camp with you.', nextNodeId: 'camp_clues' },
          { id: 'calm', text: 'Calm down. What exactly did you find?', nextNodeId: 'findings_talk' },
          { id: 'leave', text: 'Good luck, Dax. Stay safe.', nextNodeId: null },
        ],
      },
      {
        id: 'camp_clues',
        text: 'A patrol roster — look, three names listed. Only one returned. And this map — it marks something south of here, beyond the ridge. A symbol I do not recognize.',
        choices: [
          { id: 'accept', text: 'I will investigate the marked location.', nextNodeId: null, action: { type: 'accept_quest', payload: { questId: 'quest_camp_mystery' } } },
        ],
      },
      {
        id: 'findings_talk',
        text: 'Food left mid-meal. No blood. No sign of struggle. Just... gone. And the ashes in the fire pit are warm — but no one has been here. That makes no sense.',
        choices: [{ id: 'mystery', text: 'This is strange. I will investigate.', nextNodeId: null }],
      },
    ],
  },

  {
    id: 'dialogue_shrine_keeper',
    npcId: 'npc_shrine_keeper',
    nodes: [
      {
        id: 'greeting',
        text: 'You have walked far to find this place. Few do. I am Seraphina, keeper of the Old Shrine. The land itself must have guided your steps. Be still a moment.',
        choices: [
          { id: 'blessing', text: 'I seek a blessing at the shrine.', nextNodeId: 'blessing_talk' },
          { id: 'prophecy', text: 'Brother Aldric spoke of prophecies. Tell me.', nextNodeId: 'prophecy_talk' },
          { id: 'leave', text: 'I will spend a moment in quiet reflection.', nextNodeId: null },
        ],
      },
      {
        id: 'blessing_talk',
        text: 'Lay an offering at the stone — moonlight, water, or the seed of something that grows. The shrine does not want treasure. It wants intention.',
        choices: [
          { id: 'accept', text: 'I will make an offering.', nextNodeId: null, action: { type: 'accept_quest', payload: { questId: 'quest_shrine_offering' } } },
        ],
      },
      {
        id: 'prophecy_talk',
        text: 'The stone carries a single inscription, worn but legible: "When the deep remembers, the land will answer." The Aerthians carved it. It is not a warning. It is an announcement.',
        choices: [
          { id: 'accept', text: 'Tell me more about the Aerthians.', nextNodeId: null, action: { type: 'accept_quest', payload: { questId: 'quest_ancient_prophecy' } } },
        ],
      },
    ],
  },
];

export function getDialogueTreeById(id: string): DialogueTree | undefined {
  return dialogueTrees.find(tree => tree.id === id);
}

export function getDialogueTreeForNpc(npcId: string): DialogueTree | undefined {
  return dialogueTrees.find(tree => tree.npcId === npcId);
}
