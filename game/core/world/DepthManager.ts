import Phaser from 'phaser';

export enum DepthLayer {
  BACKGROUND_TERRAIN = 0,
  GROUND_DETAILS = 10,
  PATHS_AND_ROADS = 20,
  WATER_SURFACE = 30,
  BRIDGES_AND_RAMPS = 40,
  GROUND_OBJECTS = 50,
  DYNAMIC_ENTITIES = 100, // Y-sorted dynamically: 100 + position.y
  TREE_TRUNKS_AND_STRUCTURES = 200,
  FOREGROUND_CANOPY = 500,
  WEATHER_EFFECTS = 1000,
  LIGHTING_OVERLAY = 2000,
  UI_AND_HUD = 3000,
}

export class DepthManager {
  static getEntityDepth(y: number, elevationLevel: number = 1): number {
    return DepthLayer.DYNAMIC_ENTITIES + elevationLevel * 1000 + (y / 10000);
  }

  static sortDepth(gameContainer: Phaser.GameObjects.Container, y: number, elevationLevel: number = 1): void {
    gameContainer.setDepth(this.getEntityDepth(y, elevationLevel));
  }
}
