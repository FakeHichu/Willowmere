import Phaser from 'phaser';
import { VillageScene } from './scenes/VillageScene';
import { CharacterCreationScene } from './scenes/CharacterCreationScene';

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
  scene: [CharacterCreationScene, VillageScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 400,
      height: 300
    },
    max: {
      width: 1600,
      height: 1200
    }
  },
  render: {
    pixelArt: true,
    antialias: false
  }
};

// Game constants
export const TILE_SIZE = 32;
export const PLAYER_SPEED = 150;
export const INTERACTION_RADIUS = 50;
export const WORLD_BOUNDS = {
  width: 1200,
  height: 900
};
