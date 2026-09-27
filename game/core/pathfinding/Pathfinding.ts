import type { Vector2 } from '@shared/types';
import { getTerrainAtPosition, WORLD_BOUNDS, TILE_SIZE } from '@data/world/worldMap';
import { getTerrainDefinition } from '@data/world/terrain';

export interface PathNode {
  x: number;
  y: number;
  f: number;
  g: number;
  h: number;
  parent: PathNode | null;
}

export class Pathfinding {
  private cache: Map<string, Vector2[]> = new Map();
  private maxCacheSize: number = 200;

  findPath(startWorld: Vector2, targetWorld: Vector2): Vector2[] {
    const startTile = {
      x: Math.floor((startWorld.x - WORLD_BOUNDS.x) / TILE_SIZE),
      y: Math.floor((startWorld.y - WORLD_BOUNDS.y) / TILE_SIZE),
    };
    const targetTile = {
      x: Math.floor((targetWorld.x - WORLD_BOUNDS.x) / TILE_SIZE),
      y: Math.floor((targetWorld.y - WORLD_BOUNDS.y) / TILE_SIZE),
    };

    const cacheKey = `${startTile.x},${startTile.y}_${targetTile.x},${targetTile.y}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const openList: PathNode[] = [];
    const closedSet: Set<string> = new Set();

    const startNode: PathNode = {
      x: startTile.x,
      y: startTile.y,
      f: 0,
      g: 0,
      h: this.heuristic(startTile, targetTile),
      parent: null,
    };

    openList.push(startNode);

    let iterations = 0;
    const maxIterations = 600; // Cap iterations for high performance

    while (openList.length > 0 && iterations < maxIterations) {
      iterations++;
      openList.sort((a, b) => a.f - b.f);
      const currentNode = openList.shift()!;

      if (currentNode.x === targetTile.x && currentNode.y === targetTile.y) {
        const path = this.reconstructPath(currentNode);
        this.cachePath(cacheKey, path);
        return path;
      }

      closedSet.add(`${currentNode.x},${currentNode.y}`);

      const neighbors = this.getNeighbors(currentNode);
      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (closedSet.has(key)) continue;

        const worldPos = {
          x: neighbor.x * TILE_SIZE + WORLD_BOUNDS.x + TILE_SIZE / 2,
          y: neighbor.y * TILE_SIZE + WORLD_BOUNDS.y + TILE_SIZE / 2,
        };

        const terrainType = getTerrainAtPosition(worldPos.x, worldPos.y);
        const terrainDef = getTerrainDefinition(terrainType);
        if (!terrainDef.walkable) continue;

        const gScore = currentNode.g + (1 / Math.max(0.1, terrainDef.speedModifier));
        const existingNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);

        if (!existingNode) {
          const h = this.heuristic(neighbor, targetTile);
          openList.push({
            x: neighbor.x,
            y: neighbor.y,
            g: gScore,
            h,
            f: gScore + h,
            parent: currentNode,
          });
        } else if (gScore < existingNode.g) {
          existingNode.g = gScore;
          existingNode.f = gScore + existingNode.h;
          existingNode.parent = currentNode;
        }
      }
    }

    // Direct line fallback if pathfinding budget exhausted
    const fallbackPath = [startWorld, targetWorld];
    this.cachePath(cacheKey, fallbackPath);
    return fallbackPath;
  }

  private heuristic(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Manhattan distance
  }

  private getNeighbors(node: { x: number; y: number }): { x: number; y: number }[] {
    return [
      { x: node.x + 1, y: node.y },
      { x: node.x - 1, y: node.y },
      { x: node.x, y: node.y + 1 },
      { x: node.x, y: node.y - 1 },
    ];
  }

  private reconstructPath(node: PathNode): Vector2[] {
    const path: Vector2[] = [];
    let current: PathNode | null = node;

    while (current !== null) {
      path.unshift({
        x: current.x * TILE_SIZE + WORLD_BOUNDS.x + TILE_SIZE / 2,
        y: current.y * TILE_SIZE + WORLD_BOUNDS.y + TILE_SIZE / 2,
      });
      current = current.parent;
    }

    return path;
  }

  private cachePath(key: string, path: Vector2[]): void {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, path);
  }

  clearCache(): void {
    this.cache.clear();
  }
}
