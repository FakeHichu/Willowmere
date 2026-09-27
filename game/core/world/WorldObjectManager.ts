import Phaser from 'phaser';
import type { WorldObject, Vector2 } from '@shared/types';
import { worldObjects } from '@data/world/objects';
import { DepthManager } from './DepthManager';

export class WorldObjectManager {
  private scene: Phaser.Scene;
  private objectContainers: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    worldObjects.forEach(obj => {
      this.createWorldObject(obj);
    });
  }

  private createWorldObject(obj: WorldObject): void {
    const container = this.scene.add.container(obj.position.x, obj.position.y);

    const graphics = this.scene.add.graphics();
    let color = 0x8d6e63;
    if (obj.type === 'container') color = 0xa1887f;
    if (obj.type === 'light_source') color = 0xffb74d;
    if (obj.type === 'architecture') color = 0x607d8b;

    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(-obj.size.x / 2, -obj.size.y / 2, obj.size.x, obj.size.y, 4);

    container.add(graphics);
    DepthManager.sortDepth(container, obj.position.y, 1);

    this.objectContainers.set(obj.id, container);
  }

  updateCulling(playerPos: Vector2, cullingRadius: number = 1400): void {
    this.objectContainers.forEach((container) => {
      const dist = Math.sqrt(Math.pow(playerPos.x - container.x, 2) + Math.pow(playerPos.y - container.y, 2));
      container.setVisible(dist <= cullingRadius);
    });
  }
}
