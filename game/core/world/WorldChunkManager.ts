import type { WorldChunk, Vector2 } from '@shared/types';
import { generateWorldChunks, getActiveChunks, CHUNK_SIZE, WORLD_GRID_COLS, WORLD_GRID_ROWS } from '@data/world/chunks';

export class WorldChunkManager {
  private chunks: WorldChunk[] = [];
  private activeChunks: Set<string> = new Set();
  private renderDistance: number = 1400;

  create(): void {
    this.chunks = generateWorldChunks();
  }

  updatePlayerPosition(playerPos: Vector2): { newlyLoaded: WorldChunk[]; newlyUnloaded: string[] } {
    const currentlyActive = getActiveChunks(playerPos.x, playerPos.y, this.renderDistance, this.chunks);
    const newActiveIds = new Set(currentlyActive.map(c => c.id));

    const newlyLoaded: WorldChunk[] = [];
    const newlyUnloaded: string[] = [];

    for (const chunk of currentlyActive) {
      if (!this.activeChunks.has(chunk.id)) {
        chunk.isLoaded = true;
        newlyLoaded.push(chunk);
      }
    }

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

  getChunkAtPosition(x: number, y: number): WorldChunk | undefined {
    const gridX = Math.floor((x + 400) / CHUNK_SIZE);
    const gridY = Math.floor((y + 2000) / CHUNK_SIZE);
    
    if (gridX < 0 || gridX >= WORLD_GRID_COLS || gridY < 0 || gridY >= WORLD_GRID_ROWS) {
      return undefined;
    }
    
    const index = gridY * WORLD_GRID_COLS + gridX;
    return this.chunks[index];
  }

  getChunksInRegion(regionId: string): WorldChunk[] {
    return this.chunks.filter(c => c.regionId === regionId);
  }

  setRenderDistance(distance: number): void {
    this.renderDistance = distance;
  }

  getRenderDistance(): number {
    return this.renderDistance;
  }
}