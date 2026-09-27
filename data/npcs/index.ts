import type { NPCDefinition } from '@shared/types';

// ============================================================================
// World-space NPC definitions
// Village region: x 2000-4000, y 1500-3100
// Riverside: x 4000-6000, y 1500-3100
// Whispering Woods: x 2000-4000, y 0-1500
// Southern Farmland: x 0-2000, y 2800-4500
// Ancient Ruins: x 4000-6000, y 0-1500
// Northern Mountains: x 2000-6000, y -1200-0  (clamped to ~0)
// Hidden Grove: x 0-2000, y 0-1500
// Lakeside Hollow: x 0-2000, y 1500-2800
// Highland Trail: x 4000-6000, y 2800-4500
// Abandoned Camp: x 0-2000, y 4200-4500 (southern edge)
// Old Shrine: x 1000-2000, y 100-600
// Cave Underground: internal
// ============================================================================

export const npcs: NPCDefinition[] = [

  // ─── VILLAGE NPCs ─────────────────────────────────────────────────────────
  {
    id: 'npc_arthur',
    name: 'Arthur',
    role: 'Mayor & Leader',
    position: { x: 2980, y: 1880 },
    sprite: 'npc_arthur',
    portrait: 'portrait_arthur',
    personality: ['wise', 'responsible', 'welcoming'],
    backstory: 'Arthur has served as the Mayor of Willowmere for over a decade. He keeps the peace and helps newcomers find their place in the village.',
    dialogueTreeId: 'dialogue_arthur',
    questIds: ['quest_welcome_willowmere', 'quest_tool_repair'],
    schedule: [
      { time: '08:00', position: { x: 2980, y: 1880 }, action: 'office' },
      { time: '12:00', position: { x: 3100, y: 2100 }, action: 'town_square' },
      { time: '14:00', position: { x: 2980, y: 1880 }, action: 'office' },
      { time: '17:30', position: { x: 3200, y: 2050 }, action: 'walk_north' },
      { time: '19:00', position: { x: 3400, y: 2300 }, action: 'inn' },
    ],
  },
  {
    id: 'npc_elara',
    name: 'Elara',
    role: 'General Store Owner',
    position: { x: 2640, y: 2000 },
    sprite: 'npc_elara',
    portrait: 'portrait_elara',
    personality: ['resourceful', 'friendly', 'shrewd'],
    backstory: 'Elara runs the Willowmere General Store, stocking seeds, tools, and local produce for all the villagers.',
    dialogueTreeId: 'dialogue_elara',
    questIds: ['quest_store_supplies'],
    schedule: [
      { time: '07:00', position: { x: 2640, y: 2000 }, action: 'shop' },
      { time: '12:30', position: { x: 3100, y: 2100 }, action: 'town_square_lunch' },
      { time: '13:30', position: { x: 2640, y: 2000 }, action: 'shop' },
      { time: '19:00', position: { x: 3400, y: 2300 }, action: 'inn' },
    ],
  },
  {
    id: 'npc_bram',
    name: 'Bram',
    role: 'Village Blacksmith',
    position: { x: 3580, y: 1780 },
    sprite: 'npc_bram',
    portrait: 'portrait_bram',
    personality: ['hardworking', 'quiet', 'reliable'],
    backstory: 'Bram works the forge day in and day out, crafting iron tools and repairing farming equipment.',
    dialogueTreeId: 'dialogue_bram',
    questIds: ['quest_iron_forging'],
    schedule: [
      { time: '06:00', position: { x: 3580, y: 1780 }, action: 'forge' },
      { time: '18:00', position: { x: 3100, y: 2100 }, action: 'town_square' },
      { time: '20:00', position: { x: 3400, y: 2300 }, action: 'inn' },
    ],
  },
  {
    id: 'npc_lily',
    name: 'Lily',
    role: 'Herbalist & Gardener',
    position: { x: 3700, y: 2400 },
    sprite: 'npc_lily',
    portrait: 'portrait_lily',
    personality: ['gentle', 'nature-lover', 'cheerful'],
    backstory: 'Lily tends the communal herb garden and serves as the village healer, knowing every local plant.',
    dialogueTreeId: 'dialogue_lily',
    questIds: ['quest_flower_hunt', 'quest_herb_medicine'],
    schedule: [
      { time: '06:00', position: { x: 3700, y: 2400 }, action: 'garden' },
      { time: '08:00', position: { x: 2800, y: 2600 }, action: 'herb_field' },
      { time: '14:00', position: { x: 3700, y: 2400 }, action: 'garden' },
      { time: '17:00', position: { x: 3100, y: 2100 }, action: 'town_square' },
    ],
  },
  {
    id: 'npc_finn',
    name: 'Finn',
    role: 'Innkeeper',
    position: { x: 3400, y: 2300 },
    sprite: 'npc_finn',
    portrait: 'portrait_finn',
    personality: ['hospitable', 'jovial', 'storyteller'],
    backstory: 'Finn keeps the fireplace warm and the stew brewing at the Willowmere Inn, greeting travelers with a warm smile.',
    dialogueTreeId: 'dialogue_finn',
    questIds: ['quest_inn_recipes'],
    schedule: [
      { time: '08:00', position: { x: 3400, y: 2300 }, action: 'inn_prep' },
      { time: '12:00', position: { x: 3400, y: 2300 }, action: 'inn_counter' },
      { time: '02:00', position: { x: 3420, y: 2320 }, action: 'rest' },
    ],
  },
  {
    id: 'npc_mira',
    name: 'Mira',
    role: 'Librarian & Historian',
    position: { x: 2700, y: 2500 },
    sprite: 'npc_mira',
    portrait: 'portrait_mira',
    personality: ['scholarly', 'curious', 'thoughtful'],
    backstory: 'Mira archives Willowmere\'s ancient chronicles and manages the village library. She is obsessed with the ruins to the north.',
    dialogueTreeId: 'dialogue_mira',
    questIds: ['quest_ancient_history', 'quest_lost_tome'],
    schedule: [
      { time: '09:00', position: { x: 2700, y: 2500 }, action: 'library' },
      { time: '12:00', position: { x: 3100, y: 2100 }, action: 'town_square' },
      { time: '13:00', position: { x: 2700, y: 2500 }, action: 'library' },
      { time: '18:00', position: { x: 3100, y: 2100 }, action: 'evening_walk' },
    ],
  },
  {
    id: 'npc_tom',
    name: 'Tom',
    role: 'Stable Master',
    position: { x: 3800, y: 1850 },
    sprite: 'npc_tom',
    portrait: 'portrait_tom',
    personality: ['energetic', 'animal-lover', 'direct'],
    backstory: 'Tom cares for the village horses and manages the transport routes along the forest paths. He knows every trail in the region.',
    dialogueTreeId: 'dialogue_tom',
    questIds: ['quest_stable_cleaning', 'quest_lost_horse'],
    schedule: [
      { time: '05:30', position: { x: 3800, y: 1850 }, action: 'stables_morning' },
      { time: '09:00', position: { x: 3850, y: 1900 }, action: 'stables' },
      { time: '18:00', position: { x: 3100, y: 2100 }, action: 'town_square' },
      { time: '21:00', position: { x: 3400, y: 2300 }, action: 'inn' },
    ],
  },
  {
    id: 'npc_nora',
    name: 'Nora',
    role: 'Fisherwoman',
    position: { x: 3950, y: 2600 },
    sprite: 'npc_nora',
    portrait: 'portrait_nora',
    personality: ['patient', 'calm', 'perceptive'],
    backstory: 'Nora spends her mornings down by the river, fishing and watching the morning mist roll in from Riverside Basin.',
    dialogueTreeId: 'dialogue_nora',
    questIds: ['quest_fresh_catch'],
    schedule: [
      { time: '05:00', position: { x: 4080, y: 2700 }, action: 'fishing_village_bank' },
      { time: '11:00', position: { x: 3100, y: 2100 }, action: 'sell_fish' },
      { time: '14:00', position: { x: 4080, y: 2700 }, action: 'fishing_afternoon' },
      { time: '20:00', position: { x: 3400, y: 2300 }, action: 'inn' },
    ],
  },
  {
    id: 'npc_walter',
    name: 'Walter',
    role: 'North Farm Operator',
    position: { x: 2200, y: 1650 },
    sprite: 'npc_walter',
    portrait: 'portrait_walter',
    personality: ['practical', 'hardworking', 'humorous'],
    backstory: 'Walter manages the North Farm fields adjacent to the village, growing wheat, pumpkins, and apples for the community.',
    dialogueTreeId: 'dialogue_walter',
    questIds: ['quest_crop_harvest'],
    schedule: [
      { time: '05:30', position: { x: 2200, y: 1650 }, action: 'farm_morning' },
      { time: '12:00', position: { x: 3100, y: 2100 }, action: 'town_square_lunch' },
      { time: '13:30', position: { x: 2200, y: 1650 }, action: 'farm_afternoon' },
      { time: '19:00', position: { x: 3400, y: 2300 }, action: 'inn' },
    ],
  },
  {
    id: 'npc_sasha',
    name: 'Sasha',
    role: 'Village Child',
    position: { x: 3100, y: 2100 },
    sprite: 'npc_sasha',
    portrait: 'portrait_sasha',
    personality: ['playful', 'curious', 'adventurous'],
    backstory: 'Sasha loves running around the town square, collecting shiny stones and daring others to race.',
    dialogueTreeId: 'dialogue_sasha',
    questIds: ['quest_lost_toy'],
    schedule: [
      { time: '08:00', position: { x: 3100, y: 2100 }, action: 'town_square_play' },
      { time: '12:00', position: { x: 2850, y: 2600 }, action: 'home_lunch' },
      { time: '13:30', position: { x: 3100, y: 2100 }, action: 'town_square_play' },
      { time: '17:00', position: { x: 2850, y: 2600 }, action: 'home' },
    ],
  },
  {
    id: 'npc_priest',
    name: 'Brother Aldric',
    role: 'Village Priest',
    position: { x: 3050, y: 2900 },
    sprite: 'npc_priest',
    portrait: 'portrait_priest',
    personality: ['devout', 'compassionate', 'solemn'],
    backstory: 'Aldric tends the village chapel and offers prayers for travelers. He carries an old compass pointing toward the Old Shrine.',
    dialogueTreeId: 'dialogue_priest',
    questIds: ['quest_shrine_blessing', 'quest_lost_relic'],
    schedule: [
      { time: '06:00', position: { x: 3050, y: 2900 }, action: 'morning_prayers' },
      { time: '10:00', position: { x: 3100, y: 2100 }, action: 'village_walk' },
      { time: '14:00', position: { x: 3050, y: 2900 }, action: 'chapel' },
      { time: '20:00', position: { x: 3050, y: 2900 }, action: 'evening_prayers' },
    ],
  },

  // ─── RIVERSIDE BASIN NPCs ─────────────────────────────────────────────────
  {
    id: 'npc_fisherman',
    name: 'Old Gareth',
    role: 'Riverside Fisherman',
    position: { x: 4600, y: 2400 },
    sprite: 'npc_fisherman',
    portrait: 'portrait_fisherman',
    personality: ['weathered', 'wise', 'superstitious'],
    backstory: 'Gareth has fished the great river for forty years. He speaks of strange lights beneath the deep water.',
    dialogueTreeId: 'dialogue_fisherman',
    questIds: ['quest_great_catch', 'quest_deep_water_mystery'],
    schedule: [
      { time: '04:30', position: { x: 4600, y: 2400 }, action: 'fishing_dock' },
      { time: '14:00', position: { x: 4700, y: 2200 }, action: 'campfire_break' },
      { time: '17:00', position: { x: 4600, y: 2400 }, action: 'fishing_evening' },
      { time: '21:00', position: { x: 4750, y: 2150 }, action: 'river_camp' },
    ],
  },
  {
    id: 'npc_river_merchant',
    name: 'Petra',
    role: 'Traveling Merchant',
    position: { x: 4800, y: 1900 },
    sprite: 'npc_river_merchant',
    portrait: 'portrait_merchant',
    personality: ['opportunistic', 'charming', 'secretive'],
    backstory: 'Petra travels the river routes selling rare goods. She knows shortcuts through the woods but does not share them freely.',
    dialogueTreeId: 'dialogue_river_merchant',
    questIds: ['quest_rare_goods'],
    schedule: [
      { time: '09:00', position: { x: 4800, y: 1900 }, action: 'market_stall' },
      { time: '20:00', position: { x: 4750, y: 2150 }, action: 'river_camp_rest' },
    ],
  },

  // ─── WHISPERING WOODS NPCs ────────────────────────────────────────────────
  {
    id: 'npc_ranger',
    name: 'Sylva',
    role: 'Forest Ranger',
    position: { x: 2800, y: 700 },
    sprite: 'npc_ranger',
    portrait: 'portrait_ranger',
    personality: ['alert', 'independent', 'protective'],
    backstory: 'Sylva has patrolled the Whispering Woods for a decade. She knows every animal trail and hidden hollow in the forest.',
    dialogueTreeId: 'dialogue_ranger',
    questIds: ['quest_poacher_trail', 'quest_forest_spirit'],
    schedule: [
      { time: '06:00', position: { x: 2400, y: 500 }, action: 'north_patrol' },
      { time: '10:00', position: { x: 3200, y: 800 }, action: 'east_patrol' },
      { time: '14:00', position: { x: 2800, y: 700 }, action: 'ranger_post' },
      { time: '20:00', position: { x: 2800, y: 700 }, action: 'camp_night' },
    ],
  },
  {
    id: 'npc_traveler',
    name: 'Marco',
    role: 'Lost Traveler',
    position: { x: 3000, y: 1200 },
    sprite: 'npc_traveler',
    portrait: 'portrait_traveler',
    personality: ['anxious', 'grateful', 'adventurous'],
    backstory: 'Marco wandered into the Whispering Woods while searching for the ancient ruins. He lost his map and is looking for help.',
    dialogueTreeId: 'dialogue_traveler',
    questIds: ['quest_escort_ruins', 'quest_lost_map'],
    schedule: [
      { time: '08:00', position: { x: 3000, y: 1200 }, action: 'waiting_lost' },
      { time: '15:00', position: { x: 2900, y: 1100 }, action: 'wandering' },
    ],
  },
  {
    id: 'npc_mysterious',
    name: 'The Wanderer',
    role: 'Mysterious Figure',
    position: { x: 2500, y: 400 },
    sprite: 'npc_mysterious',
    portrait: 'portrait_mysterious',
    personality: ['cryptic', 'ancient', 'knowing'],
    backstory: 'No one knows where this robed figure comes from. They appear near the Ancient Tree at dusk, whispering to the roots.',
    dialogueTreeId: 'dialogue_mysterious',
    questIds: ['quest_ancient_secret'],
    schedule: [
      { time: '19:00', position: { x: 2500, y: 400 }, action: 'ancient_tree_dusk' },
      { time: '22:00', position: { x: 2200, y: 600 }, action: 'wander_night' },
      { time: '05:00', position: { x: 2500, y: 400 }, action: 'ancient_tree_dawn' },
    ],
  },

  // ─── SOUTHERN FARMLAND NPCs ───────────────────────────────────────────────
  {
    id: 'npc_farmer_main',
    name: 'Edith',
    role: 'Senior Farmer',
    position: { x: 700, y: 3200 },
    sprite: 'npc_farmer_main',
    portrait: 'portrait_farmer',
    personality: ['weathered', 'stubborn', 'fair'],
    backstory: 'Edith has worked the Southern Farmland for thirty years. She inherited the land from her parents and knows every season\'s rhythm.',
    dialogueTreeId: 'dialogue_farmer_main',
    questIds: ['quest_crop_blight', 'quest_farm_help'],
    schedule: [
      { time: '05:00', position: { x: 700, y: 3200 }, action: 'farm_morning_chores' },
      { time: '12:00', position: { x: 800, y: 3100 }, action: 'barn_lunch' },
      { time: '13:30', position: { x: 700, y: 3200 }, action: 'afternoon_harvest' },
      { time: '19:00', position: { x: 800, y: 3100 }, action: 'barn_rest' },
    ],
  },
  {
    id: 'npc_farmhand_1',
    name: 'Denis',
    role: 'Farmhand',
    position: { x: 500, y: 3400 },
    sprite: 'npc_farmhand_1',
    portrait: 'portrait_farmhand',
    personality: ['cheerful', 'simple', 'hardworking'],
    backstory: 'Denis works the pumpkin fields from dawn to dusk and knows which crop sells best at market.',
    dialogueTreeId: 'dialogue_farmhand',
    questIds: ['quest_pumpkin_delivery'],
    schedule: [
      { time: '06:00', position: { x: 500, y: 3400 }, action: 'field_work' },
      { time: '19:00', position: { x: 800, y: 3100 }, action: 'rest_barn' },
    ],
  },
  {
    id: 'npc_farmhand_2',
    name: 'Rosa',
    role: 'Farmhand',
    position: { x: 1000, y: 3500 },
    sprite: 'npc_farmhand_2',
    portrait: 'portrait_farmhand2',
    personality: ['quiet', 'observant', 'kind'],
    backstory: 'Rosa tends the apple orchard and knows which trees give the sweetest fruit.',
    dialogueTreeId: 'dialogue_farmhand2',
    questIds: ['quest_apple_harvest'],
    schedule: [
      { time: '07:00', position: { x: 1000, y: 3500 }, action: 'orchard_work' },
      { time: '18:00', position: { x: 800, y: 3100 }, action: 'barn_evening' },
    ],
  },

  // ─── ANCIENT RUINS NPCs ───────────────────────────────────────────────────
  {
    id: 'npc_archaeologist',
    name: 'Professor Aldwyn',
    role: 'Ruins Archaeologist',
    position: { x: 4800, y: 600 },
    sprite: 'npc_archaeologist',
    portrait: 'portrait_archaeologist',
    personality: ['obsessive', 'intellectual', 'absentminded'],
    backstory: 'Aldwyn has been excavating the Ancient Ruins for three years. He is convinced a great civilization once thrived here.',
    dialogueTreeId: 'dialogue_archaeologist',
    questIds: ['quest_artifact_recovery', 'quest_ruins_inscription'],
    schedule: [
      { time: '08:00', position: { x: 4800, y: 600 }, action: 'excavation_site' },
      { time: '13:00', position: { x: 4900, y: 800 }, action: 'camp_study' },
      { time: '16:00', position: { x: 4800, y: 600 }, action: 'excavation_site' },
      { time: '21:00', position: { x: 4900, y: 800 }, action: 'camp_rest' },
    ],
  },
  {
    id: 'npc_ruins_guard',
    name: 'Magnus',
    role: 'Ruins Guardian',
    position: { x: 4500, y: 300 },
    sprite: 'npc_ruins_guard',
    portrait: 'portrait_guard',
    personality: ['stern', 'duty-bound', 'honorable'],
    backstory: 'Magnus guards the ancient site on behalf of a distant order. He allows access only to those who prove worthy.',
    dialogueTreeId: 'dialogue_ruins_guard',
    questIds: ['quest_prove_worth'],
    schedule: [
      { time: '00:00', position: { x: 4500, y: 300 }, action: 'guard_post' },
    ],
  },

  // ─── HIDDEN GROVE NPCs ────────────────────────────────────────────────────
  {
    id: 'npc_druid',
    name: 'Elder Fenwick',
    role: 'Grove Druid',
    position: { x: 800, y: 800 },
    sprite: 'npc_druid',
    portrait: 'portrait_druid',
    personality: ['serene', 'wise', 'protective'],
    backstory: 'Elder Fenwick has tended the Hidden Grove for generations. He speaks to the trees and knows the land\'s heartbeat.',
    dialogueTreeId: 'dialogue_druid',
    questIds: ['quest_grove_blessing', 'quest_nature_balance'],
    schedule: [
      { time: '06:00', position: { x: 800, y: 800 }, action: 'morning_ritual' },
      { time: '12:00', position: { x: 600, y: 1000 }, action: 'walk_south_grove' },
      { time: '18:00', position: { x: 800, y: 800 }, action: 'evening_ritual' },
      { time: '22:00', position: { x: 800, y: 800 }, action: 'night_vigil' },
    ],
  },

  // ─── LAKESIDE HOLLOW NPCs ────────────────────────────────────────────────
  {
    id: 'npc_hermit',
    name: 'Old Cormac',
    role: 'Lakeside Hermit',
    position: { x: 1100, y: 2100 },
    sprite: 'npc_hermit',
    portrait: 'portrait_hermit',
    personality: ['reclusive', 'gruff', 'secretly kind'],
    backstory: 'Cormac lives alone in a shack by the lake. He avoids the village but occasionally trades rare herbs and potions.',
    dialogueTreeId: 'dialogue_hermit',
    questIds: ['quest_hermit_errand', 'quest_lake_mystery'],
    schedule: [
      { time: '07:00', position: { x: 1100, y: 2100 }, action: 'lake_morning' },
      { time: '14:00', position: { x: 900, y: 2300 }, action: 'foraging' },
      { time: '20:00', position: { x: 1100, y: 2100 }, action: 'shack_rest' },
    ],
  },

  // ─── HIGHLAND TRAIL NPCs ──────────────────────────────────────────────────
  {
    id: 'npc_mountaineer',
    name: 'Kira',
    role: 'Mountain Guide',
    position: { x: 4800, y: 3200 },
    sprite: 'npc_mountaineer',
    portrait: 'portrait_mountaineer',
    personality: ['bold', 'ambitious', 'reliable'],
    backstory: 'Kira has climbed every peak visible from Willowmere. She offers guiding services through the treacherous Highland Trail.',
    dialogueTreeId: 'dialogue_mountaineer',
    questIds: ['quest_summit_stone', 'quest_highland_map'],
    schedule: [
      { time: '07:00', position: { x: 4800, y: 3200 }, action: 'trail_head' },
      { time: '14:00', position: { x: 5200, y: 3600 }, action: 'upper_ridge' },
      { time: '19:00', position: { x: 4800, y: 3200 }, action: 'base_camp' },
    ],
  },

  // ─── ABANDONED CAMP NPCs ──────────────────────────────────────────────────
  {
    id: 'npc_scout',
    name: 'Dax',
    role: 'Wandering Scout',
    position: { x: 1200, y: 4300 },
    sprite: 'npc_scout',
    portrait: 'portrait_scout',
    personality: ['twitchy', 'paranoid', 'resourceful'],
    backstory: 'Dax stumbled upon the Abandoned Camp and found disturbing signs. He fears something is watching from the treeline.',
    dialogueTreeId: 'dialogue_scout',
    questIds: ['quest_camp_mystery', 'quest_missing_patrol'],
    schedule: [
      { time: '10:00', position: { x: 1200, y: 4300 }, action: 'abandoned_camp' },
      { time: '16:00', position: { x: 1400, y: 4200 }, action: 'scouting' },
      { time: '20:00', position: { x: 1200, y: 4300 }, action: 'camp_night_watch' },
    ],
  },

  // ─── OLD SHRINE NPCs ──────────────────────────────────────────────────────
  {
    id: 'npc_shrine_keeper',
    name: 'Seraphina',
    role: 'Shrine Keeper',
    position: { x: 1400, y: 300 },
    sprite: 'npc_shrine_keeper',
    portrait: 'portrait_shrine_keeper',
    personality: ['peaceful', 'devoted', 'mysterious'],
    backstory: 'Seraphina maintains the Old Shrine at the northern edge of the world. She speaks of prophecies and offers blessings to pilgrims.',
    dialogueTreeId: 'dialogue_shrine_keeper',
    questIds: ['quest_shrine_offering', 'quest_ancient_prophecy'],
    schedule: [
      { time: '05:00', position: { x: 1400, y: 300 }, action: 'dawn_ritual' },
      { time: '10:00', position: { x: 1300, y: 400 }, action: 'shrine_walk' },
      { time: '18:00', position: { x: 1400, y: 300 }, action: 'dusk_ritual' },
      { time: '23:00', position: { x: 1400, y: 300 }, action: 'night_vigil' },
    ],
  },
];

// ─── Lookup helpers ────────────────────────────────────────────────────────

export function getNpcById(id: string): NPCDefinition | undefined {
  return npcs.find(npc => npc.id === id);
}

export function getNpcsAtPosition(position: { x: number; y: number }, radius: number = 80): NPCDefinition[] {
  return npcs.filter(npc => {
    const dx = npc.position.x - position.x;
    const dy = npc.position.y - position.y;
    return Math.sqrt(dx * dx + dy * dy) <= radius;
  });
}

export function getNpcsByRegion(regionNpcIds: string[]): NPCDefinition[] {
  return npcs.filter(npc => regionNpcIds.includes(npc.id));
}
