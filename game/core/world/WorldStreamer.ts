import type Phaser from 'phaser';
import type { Vector2 } from '@shared/types';
import { WorldChunkManager } from './WorldChunkManager';

export class WorldStreamer {
  private chunkManager: WorldChunkManager;

  constructor(_scene: Phaser.Scene) {
    this.chunkManager = new WorldChunkManager();
  }

  create(): void {
    this.chunkManager.create();
  }

  update(playerPos: Vector2): void {
    const { newlyLoaded, newlyUnloaded } = this.chunkManager.updatePlayerPosition(playerPos);

    if (newlyLoaded.length > 0 || newlyUnloaded.length > 0) {
      // Chunk streaming update hook
    }
  }

  getChunkManager(): WorldChunkManager {
    return this.chunkManager;
  }
}
