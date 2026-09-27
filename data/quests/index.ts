import type { QuestDefinition } from '@shared/types';

export const quests: QuestDefinition[] = [

  // ──────────────────────────────────────────────────────────────────────────
  // VILLAGE QUESTS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'quest_welcome_willowmere',
    name: 'Welcome to Willowmere',
    description: 'Mayor Arthur wants you to familiarize yourself with the village and meet its residents.',
    giverNpcId: 'npc_arthur',
    steps: [
      { id: 'step_meet_elara', type: 'talk', targetId: 'npc_elara', description: 'Meet Elara at the General Store', nextStepId: 'step_meet_bram' },
      { id: 'step_meet_bram', type: 'talk', targetId: 'npc_bram', description: 'Visit Bram at the Blacksmith forge', nextStepId: 'step_meet_lily' },
      { id: 'step_meet_lily', type: 'talk', targetId: 'npc_lily', description: 'Meet Lily in the garden', nextStepId: 'step_return_arthur' },
      { id: 'step_return_arthur', type: 'talk', targetId: 'npc_arthur', description: 'Report back to Mayor Arthur', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 50 },
      { type: 'relationship', npcId: 'npc_arthur', quantity: 2 },
    ],
  },

  {
    id: 'quest_tool_repair',
    name: 'Iron for the Forge',
    description: 'Bram needs scrap iron to maintain the village tools. Gather 3 pieces from around the farmlands.',
    giverNpcId: 'npc_arthur',
    steps: [
      { id: 'step_find_iron', type: 'collect', targetId: 'item_scrap_iron', quantity: 3, description: 'Collect 3 pieces of scrap iron', nextStepId: 'step_deliver_bram' },
      { id: 'step_deliver_bram', type: 'deliver', targetId: 'npc_bram', itemId: 'item_scrap_iron', description: 'Deliver iron to Bram at the forge', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 30 },
      { type: 'item', itemId: 'item_iron_blade', quantity: 1 },
      { type: 'relationship', npcId: 'npc_bram', quantity: 2 },
    ],
  },

  {
    id: 'quest_flower_hunt',
    name: "Lily's Garden Request",
    description: "Lily needs wildflowers and sun-blossoms for her healing salves. Gather them from the meadows north of the village.",
    giverNpcId: 'npc_lily',
    steps: [
      { id: 'step_collect_wildflowers', type: 'collect', targetId: 'item_wildflower', quantity: 3, description: 'Gather 3 wildflowers from the northern meadows', nextStepId: 'step_collect_sunblossom' },
      { id: 'step_collect_sunblossom', type: 'collect', targetId: 'item_sunblossom', quantity: 2, description: 'Gather 2 sun-blossoms near the forest edge', nextStepId: 'step_return_lily' },
      { id: 'step_return_lily', type: 'talk', targetId: 'npc_lily', description: 'Return the flowers to Lily', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_healing_salve', quantity: 2 },
      { type: 'currency', quantity: 25 },
      { type: 'relationship', npcId: 'npc_lily', quantity: 2 },
    ],
  },

  {
    id: 'quest_herb_medicine',
    name: 'The Healing Herb',
    description: 'Lily asks you to find a rare Bonewort herb deep in the Whispering Woods for a special medicine.',
    giverNpcId: 'npc_lily',
    steps: [
      { id: 'step_find_bonewort', type: 'collect', targetId: 'item_bonewort', quantity: 1, description: 'Find Bonewort in the Whispering Woods', nextStepId: 'step_return_lily_herb' },
      { id: 'step_return_lily_herb', type: 'deliver', targetId: 'npc_lily', itemId: 'item_bonewort', description: 'Bring the Bonewort to Lily', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_elixir', quantity: 1 },
      { type: 'currency', quantity: 40 },
    ],
    prerequisites: ['quest_flower_hunt'],
  },

  {
    id: 'quest_inn_recipes',
    name: "Finn's Recipe",
    description: 'Finn wants to add a new stew to his menu. He needs three local ingredients.',
    giverNpcId: 'npc_finn',
    steps: [
      { id: 'step_get_mushroom', type: 'collect', targetId: 'item_forest_mushroom', quantity: 2, description: 'Collect mushrooms from the Whispering Woods', nextStepId: 'step_get_trout' },
      { id: 'step_get_trout', type: 'collect', targetId: 'item_silver_trout', quantity: 1, description: 'Get a silver trout from Nora by the river', nextStepId: 'step_return_finn' },
      { id: 'step_return_finn', type: 'deliver', targetId: 'npc_finn', itemId: 'item_forest_mushroom', description: 'Bring the ingredients to Finn', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_hearty_stew', quantity: 3 },
      { type: 'currency', quantity: 35 },
    ],
  },

  {
    id: 'quest_ancient_history',
    name: 'The Aerthian Chronicles',
    description: 'Mira has tasked you with helping research the Ancient Ruins. She wants you to speak with Professor Aldwyn.',
    giverNpcId: 'npc_mira',
    steps: [
      { id: 'step_reach_ruins', type: 'reach', targetId: 'region_ancient_ruins', targetPosition: { x: 4800, y: 600 }, description: 'Travel to the Ancient Ruins', nextStepId: 'step_meet_aldwyn' },
      { id: 'step_meet_aldwyn', type: 'talk', targetId: 'npc_archaeologist', description: 'Speak with Professor Aldwyn', nextStepId: 'step_return_mira' },
      { id: 'step_return_mira', type: 'talk', targetId: 'npc_mira', description: 'Report your findings to Mira', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 50 },
      { type: 'relationship', npcId: 'npc_mira', quantity: 3 },
    ],
  },

  {
    id: 'quest_lost_tome',
    name: 'The Missing Chronicle',
    description: 'Mira is missing Volume IV of the Aerthian Chronicles. She believes it was taken to the ruins.',
    giverNpcId: 'npc_mira',
    steps: [
      { id: 'step_search_ruins', type: 'explore', targetId: 'location_ruins_archive', targetPosition: { x: 4700, y: 400 }, description: 'Search the ruins archive chamber', nextStepId: 'step_find_tome' },
      { id: 'step_find_tome', type: 'collect', targetId: 'item_aerthian_tome', quantity: 1, description: 'Retrieve the missing tome', nextStepId: 'step_return_tome' },
      { id: 'step_return_tome', type: 'deliver', targetId: 'npc_mira', itemId: 'item_aerthian_tome', description: 'Return the tome to Mira', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_translation_key', quantity: 1 },
      { type: 'currency', quantity: 60 },
    ],
    prerequisites: ['quest_ancient_history'],
  },

  {
    id: 'quest_stable_cleaning',
    name: 'Muck and Manure',
    description: 'Tom needs help cleaning the stables and checking on the horses.',
    giverNpcId: 'npc_tom',
    steps: [
      { id: 'step_clean_stalls', type: 'interact', targetId: 'object_stable_stall', description: 'Clean all three stable stalls', nextStepId: 'step_water_horses' },
      { id: 'step_water_horses', type: 'collect', targetId: 'item_water_bucket', quantity: 3, description: 'Fill 3 water buckets from the well', nextStepId: 'step_return_tom' },
      { id: 'step_return_tom', type: 'talk', targetId: 'npc_tom', description: 'Report back to Tom', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 20 },
      { type: 'relationship', npcId: 'npc_tom', quantity: 2 },
    ],
  },

  {
    id: 'quest_lost_horse',
    name: "Bramble's Trail",
    description: "Tom's prized mare Bramble has escaped. Track her down in the northern woods.",
    giverNpcId: 'npc_tom',
    steps: [
      { id: 'step_follow_tracks', type: 'explore', targetId: 'location_forest_clearing', targetPosition: { x: 2800, y: 1300 }, description: 'Follow Bramble\'s tracks into the Whispering Woods', nextStepId: 'step_find_bramble' },
      { id: 'step_find_bramble', type: 'interact', targetId: 'npc_bramble_horse', description: 'Find and calm Bramble', nextStepId: 'step_return_tom_horse' },
      { id: 'step_return_tom_horse', type: 'talk', targetId: 'npc_tom', description: 'Return Bramble to Tom', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 45 },
      { type: 'item', itemId: 'item_riding_boots', quantity: 1 },
    ],
    prerequisites: ['quest_stable_cleaning'],
  },

  {
    id: 'quest_fresh_catch',
    name: "The Morning Catch",
    description: 'Nora wants help delivering the morning fish to Finn at the inn.',
    giverNpcId: 'npc_nora',
    steps: [
      { id: 'step_collect_fish', type: 'collect', targetId: 'item_silver_trout', quantity: 3, description: 'Collect 3 silver trout from Nora', nextStepId: 'step_deliver_finn' },
      { id: 'step_deliver_finn', type: 'deliver', targetId: 'npc_finn', itemId: 'item_silver_trout', description: 'Deliver the fish to Finn at the inn', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 25 },
      { type: 'item', itemId: 'item_fishing_rod', quantity: 1 },
    ],
  },

  {
    id: 'quest_lost_toy',
    name: "Sasha's Lost Treasure",
    description: 'Sasha lost a special carved horse toy somewhere in the village. Help find it.',
    giverNpcId: 'npc_sasha',
    steps: [
      { id: 'step_search_well', type: 'explore', targetId: 'location_old_well', targetPosition: { x: 3050, y: 2800 }, description: 'Search near the old well', nextStepId: 'step_find_toy' },
      { id: 'step_find_toy', type: 'collect', targetId: 'item_carved_horse', quantity: 1, description: 'Find the carved horse toy', nextStepId: 'step_return_sasha' },
      { id: 'step_return_sasha', type: 'deliver', targetId: 'npc_sasha', itemId: 'item_carved_horse', description: 'Return the toy to Sasha', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 10 },
      { type: 'relationship', npcId: 'npc_sasha', quantity: 3 },
    ],
  },

  {
    id: 'quest_shrine_blessing',
    name: 'A Pilgrim\'s Walk',
    description: "Brother Aldric suggests a pilgrimage to the Old Shrine in the northern wilderness.",
    giverNpcId: 'npc_priest',
    steps: [
      { id: 'step_reach_shrine', type: 'reach', targetId: 'landmark_old_shrine', targetPosition: { x: 1400, y: 300 }, description: 'Travel to the Old Shrine', nextStepId: 'step_meet_seraphina' },
      { id: 'step_meet_seraphina', type: 'talk', targetId: 'npc_shrine_keeper', description: 'Speak with Seraphina at the shrine', nextStepId: 'step_return_aldric' },
      { id: 'step_return_aldric', type: 'talk', targetId: 'npc_priest', description: 'Report to Brother Aldric', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_blessed_amulet', quantity: 1 },
      { type: 'currency', quantity: 30 },
    ],
  },

  {
    id: 'quest_lost_relic',
    name: 'The Chapel Relic',
    description: 'A sacred relic has gone missing from the chapel. Aldric suspects it was taken to the ruins.',
    giverNpcId: 'npc_priest',
    steps: [
      { id: 'step_investigate_chapel', type: 'interact', targetId: 'object_chapel_altar', description: 'Examine the chapel altar for clues', nextStepId: 'step_reach_ruins_relic' },
      { id: 'step_reach_ruins_relic', type: 'reach', targetId: 'region_ancient_ruins', targetPosition: { x: 4600, y: 500 }, description: 'Travel to the Ancient Ruins', nextStepId: 'step_find_relic' },
      { id: 'step_find_relic', type: 'collect', targetId: 'item_holy_relic', quantity: 1, description: 'Recover the stolen relic', nextStepId: 'step_return_aldric_relic' },
      { id: 'step_return_aldric_relic', type: 'deliver', targetId: 'npc_priest', itemId: 'item_holy_relic', description: 'Return the relic to Brother Aldric', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_silver_cross', quantity: 1 },
      { type: 'currency', quantity: 60 },
    ],
    prerequisites: ['quest_shrine_blessing'],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // RIVERSIDE QUESTS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'quest_great_catch',
    name: 'The Trophy Fish',
    description: 'Old Gareth challenges you to catch a Golden Carp from below the waterfall.',
    giverNpcId: 'npc_fisherman',
    steps: [
      { id: 'step_reach_waterfall', type: 'reach', targetId: 'landmark_great_waterfall', targetPosition: { x: 4920, y: 900 }, description: 'Travel to the Great Waterfall', nextStepId: 'step_catch_carp' },
      { id: 'step_catch_carp', type: 'collect', targetId: 'item_golden_carp', quantity: 1, description: 'Catch a Golden Carp below the waterfall', nextStepId: 'step_return_gareth' },
      { id: 'step_return_gareth', type: 'deliver', targetId: 'npc_fisherman', itemId: 'item_golden_carp', description: 'Show Gareth the golden carp', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_master_fishing_rod', quantity: 1 },
      { type: 'currency', quantity: 75 },
    ],
  },

  {
    id: 'quest_deep_water_mystery',
    name: 'Lights Beneath the Surface',
    description: 'Gareth and Nora have seen strange lights beneath the deep river pool. Investigate.',
    giverNpcId: 'npc_fisherman',
    steps: [
      { id: 'step_reach_pool', type: 'reach', targetId: 'location_deep_pool', targetPosition: { x: 4700, y: 2600 }, description: 'Travel to the deep river pool', nextStepId: 'step_investigate_pool' },
      { id: 'step_investigate_pool', type: 'interact', targetId: 'object_deep_pool', description: 'Examine the pool at night', nextStepId: 'step_find_source' },
      { id: 'step_find_source', type: 'collect', targetId: 'item_glowing_stone', quantity: 1, description: 'Retrieve a glowing stone from the pool bed', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_luminescent_ore', quantity: 2 },
      { type: 'currency', quantity: 80 },
    ],
    prerequisites: ['quest_great_catch'],
  },

  {
    id: 'quest_rare_goods',
    name: "Petra's Trade Deal",
    description: 'The river merchant Petra has a rare item, but she wants something valuable in exchange.',
    giverNpcId: 'npc_river_merchant',
    steps: [
      { id: 'step_get_crystal', type: 'collect', targetId: 'item_quartz_crystal', quantity: 1, description: 'Find a quartz crystal from the highland caves', nextStepId: 'step_trade_petra' },
      { id: 'step_trade_petra', type: 'deliver', targetId: 'npc_river_merchant', itemId: 'item_quartz_crystal', description: 'Trade the crystal with Petra', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_elixir_rare', quantity: 1 },
      { type: 'currency', quantity: 50 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // WHISPERING WOODS QUESTS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'quest_poacher_trail',
    name: 'The Poachers of the Wood',
    description: "Ranger Sylva has found poacher tracks in the protected forest. Track them down.",
    giverNpcId: 'npc_ranger',
    steps: [
      { id: 'step_follow_trail', type: 'explore', targetId: 'location_poacher_camp', targetPosition: { x: 3400, y: 600 }, description: 'Follow the boot tracks through the forest', nextStepId: 'step_confront_poachers' },
      { id: 'step_confront_poachers', type: 'interact', targetId: 'object_poacher_camp', description: 'Investigate the poacher camp', nextStepId: 'step_report_sylva' },
      { id: 'step_report_sylva', type: 'talk', targetId: 'npc_ranger', description: 'Report to Sylva', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_ranger_cloak', quantity: 1 },
      { type: 'currency', quantity: 55 },
    ],
  },

  {
    id: 'quest_forest_spirit',
    name: 'The Forest Spirit',
    description: 'Strange sounds have been heard deep in the Whispering Woods. Sylva believes something spiritual is at work.',
    giverNpcId: 'npc_ranger',
    steps: [
      { id: 'step_explore_deep_woods', type: 'explore', targetId: 'location_spirit_hollow', targetPosition: { x: 2100, y: 200 }, description: 'Explore deeper into the Whispering Woods', nextStepId: 'step_find_hollow' },
      { id: 'step_find_hollow', type: 'interact', targetId: 'object_glowing_hollow', description: 'Approach the Glowing Mushroom Hollow', nextStepId: 'step_return_sylva' },
      { id: 'step_return_sylva', type: 'talk', targetId: 'npc_ranger', description: 'Report back to Sylva', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_spirit_charm', quantity: 1 },
      { type: 'currency', quantity: 65 },
    ],
    prerequisites: ['quest_poacher_trail'],
  },

  {
    id: 'quest_escort_ruins',
    name: 'The Lost Scholar',
    description: 'Marco is lost in the Whispering Woods and needs an escort to the Ancient Ruins.',
    giverNpcId: 'npc_traveler',
    steps: [
      { id: 'step_escort_start', type: 'interact', targetId: 'npc_traveler', description: 'Begin escorting Marco through the woods', nextStepId: 'step_avoid_wolves' },
      { id: 'step_avoid_wolves', type: 'reach', targetId: 'location_forest_exit', targetPosition: { x: 3800, y: 300 }, description: 'Safely guide Marco past the wolf territory', nextStepId: 'step_reach_ruins_escort' },
      { id: 'step_reach_ruins_escort', type: 'reach', targetId: 'region_ancient_ruins', targetPosition: { x: 4500, y: 500 }, description: 'Bring Marco to the ruins entrance', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 40 },
      { type: 'item', itemId: 'item_scholars_map', quantity: 1 },
    ],
  },

  {
    id: 'quest_lost_map',
    name: "Marco's Map",
    description: 'Marco lost his map somewhere in the Whispering Woods. Help him find it.',
    giverNpcId: 'npc_traveler',
    steps: [
      { id: 'step_backtrack', type: 'explore', targetId: 'location_map_drop', targetPosition: { x: 2800, y: 1000 }, description: 'Backtrack through the woods where Marco wandered', nextStepId: 'step_find_map' },
      { id: 'step_find_map', type: 'collect', targetId: 'item_torn_map', quantity: 1, description: "Retrieve Marco's map", nextStepId: 'step_return_marco' },
      { id: 'step_return_marco', type: 'deliver', targetId: 'npc_traveler', itemId: 'item_torn_map', description: "Return the map to Marco", nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 20 },
      { type: 'item', itemId: 'item_compass', quantity: 1 },
    ],
  },

  {
    id: 'quest_ancient_secret',
    name: 'What Lies Beneath',
    description: 'The Mysterious Wanderer has revealed something alarming about the Aerthian Ruins. Investigate the truth.',
    giverNpcId: 'npc_mysterious',
    steps: [
      { id: 'step_explore_vault', type: 'explore', targetId: 'location_ruins_lower_vault', targetPosition: { x: 4650, y: 800 }, description: 'Find the lower vault beneath the ruins', nextStepId: 'step_activate_conduit' },
      { id: 'step_activate_conduit', type: 'interact', targetId: 'object_aerthian_conduit', description: 'Examine the Aerthian energy conduit', nextStepId: 'step_report_mysterious' },
      { id: 'step_report_mysterious', type: 'talk', targetId: 'npc_mysterious', description: 'Return to the Wanderer at the Ancient Tree', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_aerthian_fragment', quantity: 1 },
      { type: 'currency', quantity: 100 },
    ],
    prerequisites: ['quest_ancient_history'],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // SOUTHERN FARMLAND QUESTS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'quest_crop_harvest',
    name: 'The Southern Harvest',
    description: 'The southern orchards need checking. Walter asks you to inspect the apple trees for Rosa.',
    giverNpcId: 'npc_walter',
    steps: [
      { id: 'step_reach_orchard', type: 'reach', targetId: 'region_southern_farmland', targetPosition: { x: 1000, y: 3500 }, description: 'Travel to the Southern Farmland orchards', nextStepId: 'step_inspect_trees' },
      { id: 'step_inspect_trees', type: 'interact', targetId: 'object_old_apple_tree', description: 'Inspect the old apple tree', nextStepId: 'step_report_rosa' },
      { id: 'step_report_rosa', type: 'talk', targetId: 'npc_farmhand_2', description: 'Report your findings to Rosa', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_apple_basket', quantity: 1 },
      { type: 'currency', quantity: 30 },
    ],
  },

  {
    id: 'quest_crop_blight',
    name: 'The Blighted Wheat',
    description: "Edith's western wheat field shows signs of blight. Investigate the cause.",
    giverNpcId: 'npc_farmer_main',
    steps: [
      { id: 'step_inspect_field', type: 'explore', targetId: 'location_west_wheat_field', targetPosition: { x: 400, y: 3200 }, description: 'Examine the blighted wheat field', nextStepId: 'step_find_tracks' },
      { id: 'step_find_tracks', type: 'interact', targetId: 'object_strange_tracks', description: 'Examine the strange tracks near the field', nextStepId: 'step_collect_sample' },
      { id: 'step_collect_sample', type: 'collect', targetId: 'item_blighted_wheat', quantity: 3, description: 'Collect blighted wheat samples', nextStepId: 'step_consult_lily' },
      { id: 'step_consult_lily', type: 'deliver', targetId: 'npc_lily', itemId: 'item_blighted_wheat', description: 'Bring the samples to Lily for analysis', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 50 },
      { type: 'item', itemId: 'item_fertilizer', quantity: 5 },
    ],
  },

  {
    id: 'quest_farm_help',
    name: 'Hands on the Farm',
    description: "Edith needs extra help during planting season.",
    giverNpcId: 'npc_farmer_main',
    steps: [
      { id: 'step_plow_field', type: 'interact', targetId: 'object_farm_field', description: 'Help plow the south field', nextStepId: 'step_plant_seeds' },
      { id: 'step_plant_seeds', type: 'interact', targetId: 'object_seed_bag', description: 'Plant the wheat seeds', nextStepId: 'step_water_crops' },
      { id: 'step_water_crops', type: 'collect', targetId: 'item_water_bucket', quantity: 5, description: 'Water the newly planted crops', nextStepId: 'step_return_edith' },
      { id: 'step_return_edith', type: 'talk', targetId: 'npc_farmer_main', description: 'Report to Edith', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 40 },
      { type: 'item', itemId: 'item_farm_hat', quantity: 1 },
    ],
  },

  {
    id: 'quest_pumpkin_delivery',
    name: "Denis's Pumpkin Run",
    description: 'Denis has a cart of pumpkins to deliver to the village market.',
    giverNpcId: 'npc_farmhand_1',
    steps: [
      { id: 'step_load_cart', type: 'interact', targetId: 'object_pumpkin_cart', description: 'Help Denis load the pumpkins', nextStepId: 'step_deliver_market' },
      { id: 'step_deliver_market', type: 'reach', targetId: 'location_village_market', targetPosition: { x: 3100, y: 2100 }, description: 'Escort the cart to the village market', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 25 },
      { type: 'item', itemId: 'item_pumpkin', quantity: 2 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ANCIENT RUINS QUESTS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'quest_artifact_recovery',
    name: 'Stones of the Vault',
    description: 'Professor Aldwyn needs three engraved stones retrieved from the ruins lower vault.',
    giverNpcId: 'npc_archaeologist',
    steps: [
      { id: 'step_pass_guard', type: 'interact', targetId: 'npc_ruins_guard', description: 'Gain access past Magnus the Guardian', nextStepId: 'step_find_stone1' },
      { id: 'step_find_stone1', type: 'collect', targetId: 'item_aerthian_stone', quantity: 3, description: 'Find the 3 engraved Aerthian stones', nextStepId: 'step_return_aldwyn' },
      { id: 'step_return_aldwyn', type: 'deliver', targetId: 'npc_archaeologist', itemId: 'item_aerthian_stone', description: 'Return the stones to Aldwyn', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 80 },
      { type: 'item', itemId: 'item_aerthian_pendant', quantity: 1 },
    ],
    prerequisites: ['quest_ancient_history'],
  },

  {
    id: 'quest_ruins_inscription',
    name: 'The Carved Words',
    description: 'Aldwyn has found inscriptions that need translation. Find someone who can read the Aerthian script.',
    giverNpcId: 'npc_archaeologist',
    steps: [
      { id: 'step_copy_inscription', type: 'interact', targetId: 'object_ruin_inscription', description: 'Copy the inscription from the ruin wall', nextStepId: 'step_find_translator' },
      { id: 'step_find_translator', type: 'talk', targetId: 'npc_mira', description: 'Show the inscription copy to Mira at the library', nextStepId: 'step_show_mysterious' },
      { id: 'step_show_mysterious', type: 'talk', targetId: 'npc_mysterious', description: 'Consult the Wanderer at the Ancient Tree', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 70 },
      { type: 'item', itemId: 'item_aerthian_lexicon', quantity: 1 },
    ],
    prerequisites: ['quest_artifact_recovery'],
  },

  {
    id: 'quest_prove_worth',
    name: 'Trial of the Sealed Gate',
    description: 'Magnus will allow entry to the ruins only if you complete the Trial of the Sealed Gate.',
    giverNpcId: 'npc_ruins_guard',
    steps: [
      { id: 'step_find_marker1', type: 'explore', targetId: 'location_marker_1', targetPosition: { x: 4400, y: 200 }, description: 'Find the first stone marker', nextStepId: 'step_find_marker2' },
      { id: 'step_find_marker2', type: 'explore', targetId: 'location_marker_2', targetPosition: { x: 5100, y: 400 }, description: 'Find the second stone marker', nextStepId: 'step_find_marker3' },
      { id: 'step_find_marker3', type: 'explore', targetId: 'location_marker_3', targetPosition: { x: 4700, y: 1200 }, description: 'Find the third stone marker', nextStepId: 'step_return_magnus' },
      { id: 'step_return_magnus', type: 'talk', targetId: 'npc_ruins_guard', description: 'Return the markers to Magnus in correct order', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_sealed_gate_key', quantity: 1 },
      { type: 'currency', quantity: 50 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // HIDDEN GROVE QUESTS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'quest_grove_blessing',
    name: "The Druid's Request",
    description: 'Elder Fenwick offers a blessing in exchange for a moonlit lotus from the lakeside.',
    giverNpcId: 'npc_druid',
    steps: [
      { id: 'step_reach_lakeside_night', type: 'reach', targetId: 'region_lakeside_hollow', targetPosition: { x: 1100, y: 2100 }, description: 'Travel to the Lakeside after midnight', nextStepId: 'step_find_lotus' },
      { id: 'step_find_lotus', type: 'collect', targetId: 'item_moonlit_lotus', quantity: 1, description: 'Gather a moonlit lotus flower', nextStepId: 'step_return_druid' },
      { id: 'step_return_druid', type: 'deliver', targetId: 'npc_druid', itemId: 'item_moonlit_lotus', description: 'Return the lotus to Elder Fenwick', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_grove_blessing', quantity: 1 },
      { type: 'currency', quantity: 45 },
    ],
  },

  {
    id: 'quest_nature_balance',
    name: 'The Balance of the Grove',
    description: 'Elder Fenwick senses an imbalance in the Hidden Grove. Investigate the source.',
    giverNpcId: 'npc_druid',
    steps: [
      { id: 'step_survey_grove', type: 'explore', targetId: 'location_grove_center', targetPosition: { x: 500, y: 600 }, description: 'Survey the center of the Hidden Grove', nextStepId: 'step_find_corruption' },
      { id: 'step_find_corruption', type: 'interact', targetId: 'object_corrupted_flower', description: 'Examine the withered flowers near the grove center', nextStepId: 'step_purify' },
      { id: 'step_purify', type: 'interact', targetId: 'object_grove_stone', description: 'Purify the grove stone', nextStepId: 'step_return_fenwick' },
      { id: 'step_return_fenwick', type: 'talk', targetId: 'npc_druid', description: 'Report to Elder Fenwick', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_nature_seed', quantity: 3 },
      { type: 'currency', quantity: 55 },
    ],
    prerequisites: ['quest_grove_blessing'],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // LAKESIDE + HIGHLAND + SHRINE + CAMP QUESTS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'quest_hermit_errand',
    name: "Cormac's Bargain",
    description: 'The lakeside hermit will share his rare potions if you bring him dried river-reeds.',
    giverNpcId: 'npc_hermit',
    steps: [
      { id: 'step_find_reeds', type: 'collect', targetId: 'item_river_reed', quantity: 10, description: 'Gather 10 dried river-reeds along the lakeside', nextStepId: 'step_deliver_cormac' },
      { id: 'step_deliver_cormac', type: 'deliver', targetId: 'npc_hermit', itemId: 'item_river_reed', description: 'Bring the reeds to Cormac', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_restoration_tonic', quantity: 2 },
      { type: 'currency', quantity: 30 },
    ],
  },

  {
    id: 'quest_lake_mystery',
    name: 'The Bottomless Lake',
    description: 'Cormac speaks of a lake with no visible bottom. Investigate its depths.',
    giverNpcId: 'npc_hermit',
    steps: [
      { id: 'step_measure_depth', type: 'interact', targetId: 'object_lake_surface', description: 'Drop a weighted line into the lake center', nextStepId: 'step_find_warm_air' },
      { id: 'step_find_warm_air', type: 'explore', targetId: 'location_lake_vent', targetPosition: { x: 900, y: 2100 }, description: 'Find the source of warm air near the new moon', nextStepId: 'step_return_cormac' },
      { id: 'step_return_cormac', type: 'talk', targetId: 'npc_hermit', description: 'Report findings to Cormac', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 60 },
      { type: 'item', itemId: 'item_lake_stone', quantity: 1 },
    ],
    prerequisites: ['quest_hermit_errand'],
  },

  {
    id: 'quest_summit_stone',
    name: 'Greymane Summit',
    description: 'Kira wants you to climb to the summit of Greymane and retrieve a stone marker.',
    giverNpcId: 'npc_mountaineer',
    steps: [
      { id: 'step_climb_first_ridge', type: 'reach', targetId: 'location_first_ridge', targetPosition: { x: 5000, y: 3000 }, description: 'Reach the first ridge of Greymane', nextStepId: 'step_climb_second_ridge' },
      { id: 'step_climb_second_ridge', type: 'reach', targetId: 'location_second_ridge', targetPosition: { x: 5200, y: 3400 }, description: 'Reach the second ridge', nextStepId: 'step_summit' },
      { id: 'step_summit', type: 'reach', targetId: 'landmark_mountain_peak', targetPosition: { x: 3800, y: 200 }, description: 'Reach the Summit of Greymane', nextStepId: 'step_get_stone' },
      { id: 'step_get_stone', type: 'collect', targetId: 'item_summit_stone', quantity: 1, description: 'Retrieve the summit stone marker', nextStepId: 'step_return_kira' },
      { id: 'step_return_kira', type: 'deliver', targetId: 'npc_mountaineer', itemId: 'item_summit_stone', description: 'Return to Kira with the marker', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_highland_gear', quantity: 1 },
      { type: 'currency', quantity: 90 },
    ],
  },

  {
    id: 'quest_highland_map',
    name: 'Charting the Trail',
    description: 'Kira wants to chart a safer route through the Highland Trail.',
    giverNpcId: 'npc_mountaineer',
    steps: [
      { id: 'step_mark_cairn1', type: 'interact', targetId: 'object_cairn_1', description: 'Place a trail marker at the first waypoint', nextStepId: 'step_mark_cairn2' },
      { id: 'step_mark_cairn2', type: 'interact', targetId: 'object_cairn_2', description: 'Place a trail marker at the second waypoint', nextStepId: 'step_mark_cairn3' },
      { id: 'step_mark_cairn3', type: 'interact', targetId: 'object_cairn_3', description: 'Place a trail marker at the third waypoint', nextStepId: 'step_return_kira_map' },
      { id: 'step_return_kira_map', type: 'talk', targetId: 'npc_mountaineer', description: 'Return to Kira with the charted path', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_highland_trail_map', quantity: 1 },
      { type: 'currency', quantity: 50 },
    ],
    prerequisites: ['quest_summit_stone'],
  },

  {
    id: 'quest_camp_mystery',
    name: 'The Abandoned Camp',
    description: 'Dax found a disturbing abandoned campsite. Investigate what happened to the missing patrol.',
    giverNpcId: 'npc_scout',
    steps: [
      { id: 'step_examine_camp', type: 'interact', targetId: 'object_abandoned_camp', description: 'Examine the camp for clues', nextStepId: 'step_follow_map' },
      { id: 'step_follow_map', type: 'explore', targetId: 'location_marked_south', targetPosition: { x: 1300, y: 4400 }, description: 'Follow the map marker south', nextStepId: 'step_discover_site' },
      { id: 'step_discover_site', type: 'interact', targetId: 'object_discovery_site', description: 'Investigate the marked location', nextStepId: 'step_return_dax' },
      { id: 'step_return_dax', type: 'talk', targetId: 'npc_scout', description: 'Report back to Dax', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 60 },
      { type: 'item', itemId: 'item_patrol_badge', quantity: 1 },
    ],
  },

  {
    id: 'quest_missing_patrol',
    name: 'Where Are They?',
    description: 'The patrol rosters at the camp list three names. One returned. Find out what happened to the other two.',
    giverNpcId: 'npc_scout',
    steps: [
      { id: 'step_investigate_ridge', type: 'explore', targetId: 'location_south_ridge', targetPosition: { x: 1500, y: 4450 }, description: 'Investigate the southern ridge', nextStepId: 'step_find_survivor' },
      { id: 'step_find_survivor', type: 'interact', targetId: 'npc_survivor', description: 'Find the survivor of the patrol', nextStepId: 'step_report_dax' },
      { id: 'step_report_dax', type: 'talk', targetId: 'npc_scout', description: 'Report to Dax', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 80 },
      { type: 'item', itemId: 'item_patrol_journal', quantity: 1 },
    ],
    prerequisites: ['quest_camp_mystery'],
  },

  {
    id: 'quest_shrine_offering',
    name: 'The Offering of Intent',
    description: 'Seraphina asks you to make an offering at the Old Shrine.',
    giverNpcId: 'npc_shrine_keeper',
    steps: [
      { id: 'step_collect_water', type: 'collect', targetId: 'item_spring_water', quantity: 1, description: 'Collect water from a pure spring', nextStepId: 'step_make_offering' },
      { id: 'step_make_offering', type: 'interact', targetId: 'object_shrine_altar', description: 'Place the offering at the shrine stone', nextStepId: 'step_return_seraphina' },
      { id: 'step_return_seraphina', type: 'talk', targetId: 'npc_shrine_keeper', description: 'Speak with Seraphina after the offering', nextStepId: null },
    ],
    rewards: [
      { type: 'item', itemId: 'item_shrine_blessing', quantity: 1 },
      { type: 'currency', quantity: 35 },
    ],
  },

  {
    id: 'quest_ancient_prophecy',
    name: 'The Announcement on Stone',
    description: "Seraphina's shrine holds the key to understanding the Aerthian prophecy. Research the inscription's full meaning.",
    giverNpcId: 'npc_shrine_keeper',
    steps: [
      { id: 'step_transcribe_shrine', type: 'interact', targetId: 'object_shrine_inscription', description: 'Transcribe the full shrine inscription', nextStepId: 'step_consult_mira_prophecy' },
      { id: 'step_consult_mira_prophecy', type: 'talk', targetId: 'npc_mira', description: 'Show the transcription to Mira', nextStepId: 'step_consult_wanderer' },
      { id: 'step_consult_wanderer', type: 'talk', targetId: 'npc_mysterious', description: 'Ask the Wanderer to interpret the prophecy', nextStepId: null },
    ],
    rewards: [
      { type: 'currency', quantity: 100 },
      { type: 'item', itemId: 'item_aerthian_prophecy_scroll', quantity: 1 },
    ],
    prerequisites: ['quest_shrine_offering', 'quest_ancient_history'],
  },
];

export function getQuestById(id: string): QuestDefinition | undefined {
  return quests.find(q => q.id === id);
}

export function getQuestsByGiver(npcId: string): QuestDefinition[] {
  return quests.filter(q => q.giverNpcId === npcId);
}

export function getQuestsByRegion(questLocationIds: string[]): QuestDefinition[] {
  return quests.filter(q => questLocationIds.includes(q.id));
}
