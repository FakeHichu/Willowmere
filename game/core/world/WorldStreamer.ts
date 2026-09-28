import type Phaser from 'phaser';
import type { Vector2, WorldChunk } from '@shared/types';
import { WorldChunkManager } from './WorldChunkManager';
import { WorldRenderer, ChunkTilemapData } from './WorldRenderer';

export interface StreamingUpdateResult {
  loadedChunks: WorldChunk[];
  unloadedChunks: WorldChunk[];
  tilemapsLoaded: ChunkTilemapData[];
  tilemapsUnloaded: string[];
}

export class WorldStreamer {
  private scene: Phaser.Scene;
  private chunkManager: WorldChunkManager;
  private worldRenderer: WorldRenderer | null = null;
  private lastPlayerPos: Vector2 = { x: -9999, y: -9999 };
  private updateThrottle = 500;
  private lastUpdateTime = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.chunkManager = new WorldChunkManager();
  }

  setWorldRenderer(renderer: WorldRenderer): void {
    this.worldRenderer = renderer;
  }

  create(): void {
    this.chunkManager.create();
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

    const { newlyLoaded, newlyUnloaded } = this.chunkManager.updatePlayerPosition(playerPos);

    let tilemapsLoaded: ChunkTilemapData[] = [];
    let tilemapsUnloaded: string[] = [];

    if (this.worldRenderer) {
      this.worldRenderer.updateCameraView(this.scene.cameras.main);
      tilemapsLoaded = newlyLoaded.map(c => this.worldRenderer!.getChunkTilemapData(c.id)).filter(Boolean) as ChunkTilemapData[];
      tilemapsUnloaded = newlyUnloaded;
    }

    return {
      loadedChunks: newlyLoaded,
      unloadedChunks: newlyUnloaded.map(id => this.chunkManager.getAllChunks().find(c => c.id === id)!).filter(Boolean),
      tilemapsLoaded,
      tilemapsUnloaded,
    };
  }

  getChunkManager(): WorldChunkManager {
    return this.chunkManager;
  }

  getLoadedChunks(): WorldChunk[] {
    return this.chunkManager.getAllChunks().filter(c => c.isLoaded);
  }
}