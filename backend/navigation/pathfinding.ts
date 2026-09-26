import type { Vector2 } from '@shared/types';
import { checkWorldCollision } from '../movement/movementEngine';

const GRID_SIZE = 32;

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

export function findPath(startPos: Vector2, targetPos: Vector2): Vector2[] {
  const startX = Math.round(startPos.x / GRID_SIZE);
  const startY = Math.round(startPos.y / GRID_SIZE);
  const targetX = Math.round(targetPos.x / GRID_SIZE);
  const targetY = Math.round(targetPos.y / GRID_SIZE);

  if (startX === targetX && startY === targetY) {
    return [{ x: targetPos.x, y: targetPos.y }];
  }

  const openList: Node[] = [];
  const closedSet = new Set<string>();

  const startNode: Node = {
    x: startX,
    y: startY,
    g: 0,
    h: heuristic(startX, startY, targetX, targetY),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;

  openList.push(startNode);

  let iterations = 0;
  const MAX_ITERATIONS = 300;

  while (openList.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++;

    // Get node with lowest f
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;

    if (current.x === targetX && current.y === targetY) {
      // Reconstruct path
      const path: Vector2[] = [];
      let temp: Node | null = current;
      while (temp) {
        path.unshift({ x: temp.x * GRID_SIZE, y: temp.y * GRID_SIZE });
        temp = temp.parent;
      }
      return path;
    }

    closedSet.add(`${current.x},${current.y}`);

    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(key)) continue;

      const worldPos = { x: neighbor.x * GRID_SIZE, y: neighbor.y * GRID_SIZE };
      if (checkWorldCollision(worldPos)) continue;

      const gScore = current.g + 1;
      const existingNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);

      if (!existingNode) {
        const hScore = heuristic(neighbor.x, neighbor.y, targetX, targetY);
        const newNode: Node = {
          x: neighbor.x,
          y: neighbor.y,
          g: gScore,
          h: hScore,
          f: gScore + hScore,
          parent: current,
        };
        openList.push(newNode);
      } else if (gScore < existingNode.g) {
        existingNode.g = gScore;
        existingNode.f = gScore + existingNode.h;
        existingNode.parent = current;
      }
    }
  }

  // Fallback to straight line target if pathfinding is blocked or exceeds max iterations
  return [{ x: targetPos.x, y: targetPos.y }];
}

function heuristic(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
