import Phaser from 'phaser';
import type { TimeOfDay } from '@shared/types';

export interface DynamicLightSource {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: number;
  intensity: number;
}

export class WorldLighting {
  private scene: Phaser.Scene;
  private ambientOverlay: Phaser.GameObjects.Rectangle;
  private lightSources: DynamicLightSource[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.ambientOverlay = scene.add.rectangle(
      0, 0,
      scene.cameras.main.width * 4,
      scene.cameras.main.height * 4,
      0x000000, 0
    );
    this.ambientOverlay.setScrollFactor(0);
    this.ambientOverlay.setDepth(2000);
  }

  updateLighting(timeOfDay: TimeOfDay, ambientColorHex: string): void {
    const alphaMap: Record<TimeOfDay, number> = {
      morning: 0.15,
      day: 0.0,
      evening: 0.35,
      night: 0.65,
    };

    const colorNum = parseInt(ambientColorHex.replace('#', '0x'), 16) || 0x101a42;
    this.ambientOverlay.setFillStyle(colorNum, alphaMap[timeOfDay] || 0);
  }

  addLightSource(light: DynamicLightSource): void {
    this.lightSources.push(light);
  }
}
