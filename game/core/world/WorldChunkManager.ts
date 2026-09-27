import type { WorldChunk, Vector2 } from '@shared/types';
import { generateWorldChunks, getActiveChunks } from '@data/world/chunks';

export class WorldChunkManager {
  private chunks: WorldChunk[] = [];
  private activeChunks: Set<string> = new Set();
  private renderDistance: number = 1400; // Pixel radius for active chunk streaming

  create(): void {
    this.chunks = generateWorldChunks();
  }

  updatePlayerPosition(playerPos: Vector2): { newlyLoaded: WorldChunk[]; newlyUnloaded: string[] } {
    const currentlyActive = getActiveChunks(playerPos.x, playerPos.y, this.renderDistance, this.chunks);
    const newActiveIds = new Set(currentlyActive.map(c => c.id));

    const newlyLoaded: WorldChunk[] = [];
    const newlyUnloaded: string[] = [];

    // Find newly loaded chunks
    for (const chunk of currentlyActive) {
      if (!this.activeChunks.has(chunk.id)) {
        chunk.isLoaded = true;
        newlyLoaded.push(chunk);
      }
    }

    // Find newly unloaded chunks
    for (const chunkId of this.activeChunks) {
      if (!newActiveIds.has(chunkId)) {
        const chunk = this.chunks.find(c => c.id === chunkId);
        if (chunk) chunk.isLoaded = false;
        newlyUnloaded.push(chunkId);
      }
    }

    this.activeChunks = newActiveIds;
    return { newlyLoaded, newlyUnloaded };
  }

  getActiveChunkIds(): string[] {
    return Array.from(this.activeChunks);
  }

  getAllChunks(): WorldChunk[] {
    return this.chunks;
  }
}
