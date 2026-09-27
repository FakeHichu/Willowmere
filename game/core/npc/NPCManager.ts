import Phaser from 'phaser';
import type { NPCDefinition, Vector2, WeatherType } from '@shared/types';
import { npcs as defaultNPCs } from '@data/npcs';
import { NPCController } from './NPCController';

export class NPCManager {
  private scene: Phaser.Scene;
  private controllers: Map<string, NPCController> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(npcDefinitions: NPCDefinition[] = defaultNPCs): void {
    npcDefinitions.forEach(def => {
      const controller = new NPCController(this.scene, def);
      this.controllers.set(def.id, controller);
    });
  }

  update(time: number, delta: number, gameTimeStr: string, currentWeather: WeatherType, playerPos: Vector2): void {
    const activeRadius = 1200; // Spatial culling range for simulation

    this.controllers.forEach(controller => {
      const npcPos = controller.getPosition();
      const dist = Math.sqrt(Math.pow(playerPos.x - npcPos.x, 2) + Math.pow(playerPos.y - npcPos.y, 2));

      if (dist <= activeRadius) {
        controller.update(time, delta, gameTimeStr, currentWeather, playerPos);
      }
    });
  }

  getNPCController(id: string): NPCController | undefined {
    return this.controllers.get(id);
  }

  getAllControllers(): NPCController[] {
    return Array.from(this.controllers.values());
  }

  destroy(): void {
    this.controllers.forEach(c => c.destroy());
    this.controllers.clear();
  }
}
