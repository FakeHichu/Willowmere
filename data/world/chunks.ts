import type { WorldChunk } from '@shared/types';
import { regions, getRegionAtPosition } from './regions';
import { landmarks } from './landmarks';
import { worldObjects } from './objects';
import { npcs } from '@data/npcs';

export const CHUNK_SIZE = 600;
export const WORLD_TOTAL_WIDTH = 6000;
export const WORLD_TOTAL_HEIGHT = 4800;
export const WORLD_GRID_COLS = Math.ceil(WORLD_TOTAL_WIDTH / CHUNK_SIZE);
export const WORLD_GRID_ROWS = Math.ceil(WORLD_TOTAL_HEIGHT / CHUNK_SIZE);

export function generateWorldChunks(): WorldChunk[] {
  const chunks: WorldChunk[] = [];

  for (let gridY = 0; gridY < WORLD_GRID_ROWS; gridY++) {
    for (let gridX = 0; gridX < WORLD_GRID_COLS; gridX++) {
      const minX = gridX * CHUNK_SIZE - 400; // Account for negative coordinate offsets in world bounds
      const minY = gridY * CHUNK_SIZE - 2000;
      const bounds = {
        x: minX,
        y: minY,
        width: CHUNK_SIZE,
        height: CHUNK_SIZE,
      };

      const centerX = minX + CHUNK_SIZE / 2;
      const centerY = minY + CHUNK_SIZE / 2;

      const region = getRegionAtPosition({ x: centerX, y: centerY }) || regions[0];

      // Find landmarks inside chunk bounds
      const chunkLandmarkIds = landmarks
        .filter(l => l.position.x >= bounds.x && l.position.x < bounds.x + bounds.width &&
                     l.position.y >= bounds.y && l.position.y < bounds.y + bounds.height)
        .map(l => l.id);

      // Find objects inside chunk bounds
      const chunkObjectIds = worldObjects
        .filter(o => o.position.x >= bounds.x && o.position.x < bounds.x + bounds.width &&
                     o.position.y >= bounds.y && o.position.y < bounds.y + bounds.height)
        .map(o => o.id);

      // Find NPCs inside chunk bounds
      const chunkNpcIds = npcs
        .filter(n => n.position.x >= bounds.x && n.position.x < bounds.x + bounds.width &&
                     n.position.y >= bounds.y && n.position.y < bounds.y + bounds.height)
        .map(n => n.id);

      chunks.push({
        id: `chunk_${gridX}_${gridY}`,
        gridX,
        gridY,
        bounds,
        regionId: region.id,
        landmarkIds: chunkLandmarkIds,
        objectIds: chunkObjectIds,
        npcIds: chunkNpcIds,
        isLoaded: false,
      });
    }
  }

  return chunks;
}

export function getChunkForPosition(x: number, y: number, chunks: WorldChunk[]): WorldChunk | undefined {
  return chunks.find(chunk =>
    x >= chunk.bounds.x && x < chunk.bounds.x + chunk.bounds.width &&
    y >= chunk.bounds.y && y < chunk.bounds.y + chunk.bounds.height
  );
}

export { WorldChunk };

export function getActiveChunks(playerX: number, playerY: number, renderDistance: number, chunks: WorldChunk[]): WorldChunk[] {
  return chunks.filter(chunk => {
    const dx = chunk.bounds.x + chunk.bounds.width / 2 - playerX;
    const dy = chunk.bounds.y + chunk.bounds.height / 2 - playerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist <= renderDistance;
  });
}
