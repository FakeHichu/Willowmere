import type Phaser from 'phaser';
import type { Vector2, WorldChunk } from '@shared/types';
import { WorldRenderer, ChunkLayerData } from './WorldRenderer';

export interface StreamingUpdateResult {
  loadedChunks: WorldChunk[];
  unloadedChunks: WorldChunk[];
  tilemapsLoaded: ChunkLayerData[];
  tilemapsUnloaded: string[];
}

export class WorldStreamer {
  private scene: Phaser.Scene;
  private worldRenderer: WorldRenderer | null = null;
  private lastPlayerPos: Vector2 = { x: -9999, y: -9999 };
  private updateThrottle = 500;
  private lastUpdateTime = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  setWorldRenderer(renderer: WorldRenderer): void {
    this.worldRenderer = renderer;
  }

  create(): void {
  }

  update(playerPos: Vector2): StreamingUpdateResult {
    const now = this.scene.time.now;
    if (now - this.lastUpdateTime < this.updateThrottle) {
      return { loadedChunks: [], unloadedChunks: [], tilemapsLoaded: [], tilemapsUnloaded: [] };
    }

    const dx = playerPos.x - this.lastPlayerPos.x;
    const dy = playerPos.y - this.lastPlayerPos.y;
    if (Math.sqrt(dx * dx + dy * dy) < 100) {
      return { loadedChunks: [], unloadedChunks: [], tilemapsLoaded: [], tilemapsUnloaded: [] };
    }

    this.lastUpdateTime = now;
    this.lastPlayerPos = { ...playerPos };

    let tilemapsLoaded: ChunkLayerData[] = [];
    let tilemapsUnloaded: string[] = [];

    if (this.worldRenderer) {
      this.worldRenderer.updateCameraView(this.scene.cameras.main);
      // WorldRenderer manages its own chunks internally now
    }

    return {
      loadedChunks: [],
      unloadedChunks: [],
      tilemapsLoaded,
      tilemapsUnloaded,
    };
  }

  getLoadedChunks(): WorldChunk[] {
    return [];
  }
}