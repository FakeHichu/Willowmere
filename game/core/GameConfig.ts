import Phaser from 'phaser';
import { VillageScene } from './scenes/VillageScene';
import { CharacterCreationScene } from './scenes/CharacterCreationScene';
import { BuildingInteriorScene } from './scenes/BuildingInteriorScene';
import { OVERWORLD_WIDTH, OVERWORLD_HEIGHT, TILE_SIZE } from '@data/world';

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#f5f0e6',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [CharacterCreationScene, VillageScene, BuildingInteriorScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 400,
      height: 300
    },
    max: {
      width: 1920,
      height: 1080
    }
  },
  render: {
    pixelArt: true,
    antialias: false
  }
};

// Game constants
export { TILE_SIZE };
export const PLAYER_SPEED = 150;
export const INTERACTION_RADIUS = 50;
export const WORLD_BOUNDS = {
  x: -400,
  y: -3500,
  width: OVERWORLD_WIDTH + 800,
  height: OVERWORLD_HEIGHT + 4000
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