// Server-side game constants (no Phaser dependency)
// This file can be safely imported in Node.js backend

export const TILE_SIZE = 32;
export const PLAYER_SPEED = 150;
export const INTERACTION_RADIUS = 50;
export const OVERWORLD_WIDTH = 5000;
export const OVERWORLD_HEIGHT = 4000;

export const WORLD_BOUNDS = {
  width: OVERWORLD_WIDTH,
  height: OVERWORLD_HEIGHT
};

export const MAPS = {
  overworld: { 
    width: OVERWORLD_WIDTH, 
    height: OVERWORLD_HEIGHT, 
    spawnPoint: { x: 2000, y: 1750 } 
  },
  // Legacy map support for building interiors
  village: { width: 400, height: 400, spawnPoint: { x: 200, y: 300 } },
  town_hall: { width: 400, height: 400, spawnPoint: { x: 200, y: 300 } },
  general_store: { width: 400, height: 400, spawnPoint: { x: 200, y: 300 } },
  blacksmith: { width: 400, height: 400, spawnPoint: { x: 200, y: 300 } },
  inn: { width: 400, height: 400, spawnPoint: { x: 200, y: 300 } },
  library: { width: 400, height: 400, spawnPoint: { x: 200, y: 300 } },
  stables: { width: 400, height: 400, spawnPoint: { x: 200, y: 300 } },
  farm_house: { width: 400, height: 400, spawnPoint: { x: 200, y: 300 } },
  barn: { width: 400, height: 400, spawnPoint: { x: 200, y: 300 } },
  player_house: { width: 400, height: 400, spawnPoint: { x: 200, y: 300 } },
  abandoned_cabin: { width: 400, height: 400, spawnPoint: { x: 200, y: 300 } },
  ruins_chamber: { width: 400, height: 400, spawnPoint: { x: 200, y: 300 } },
  shepherd_hut: { width: 400, height: 400, spawnPoint: { x: 200, y: 300 } },
  shrine_building: { width: 400, height: 400, spawnPoint: { x: 200, y: 300 } },
  cavern_interior: { width: 400, height: 400, spawnPoint: { x: 200, y: 300 } },
};