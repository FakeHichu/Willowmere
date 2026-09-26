import type { Vector2, Direction, PlayerState } from '@shared/types';
import { worldObjects, villageMap } from '@data/world/objects';

export const PLAYER_SPEED = 160; // Pixels per second
export const MAX_STEP_TIME = 0.1; // 100ms max delta per movement tick
export const PLAYER_SIZE = { width: 24, height: 24 };

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Check if a bounding box collides with any non-passable world objects or map boundaries.
 */
export function checkWorldCollision(pos: Vector2): boolean {
  // Map boundary check
  if (
    pos.x < 32 ||
    pos.x > villageMap.width - 32 ||
    pos.y < 32 ||
    pos.y > villageMap.height - 32
  ) {
    return true;
  }

  const playerRect: Rect = {
    x: pos.x - PLAYER_SIZE.width / 2,
    y: pos.y - PLAYER_SIZE.height / 2,
    width: PLAYER_SIZE.width,
    height: PLAYER_SIZE.height,
  };

  // Check collision against world objects
  for (const obj of worldObjects) {
    if (!obj.collision) continue;

    const objRect: Rect = {
      x: obj.position.x,
      y: obj.position.y,
      width: obj.size.x,
      height: obj.size.y,
    };

    if (rectsIntersect(playerRect, objRect)) {
      return true;
    }
  }

  return false;
}

function rectsIntersect(r1: Rect, r2: Rect): boolean {
  return !(
    r2.x >= r1.x + r1.width ||
    r2.x + r2.width <= r1.x ||
    r2.y >= r1.y + r1.height ||
    r2.y + r2.height <= r1.y
  );
}

/**
 * Calculate next authoritative position given input direction and delta time.
 */
export function calculateAuthoritativeMove(
  currentPos: Vector2,
  direction: Direction,
  isMoving: boolean,
  deltaSeconds: number
): { position: Vector2; state: PlayerState } {
  if (!isMoving) {
    return { position: currentPos, state: 'idle' };
  }

  const clampedDelta = Math.min(deltaSeconds, MAX_STEP_TIME);
  const distance = PLAYER_SPEED * clampedDelta;

  let dx = 0;
  let dy = 0;

  switch (direction) {
    case 'up':
      dy = -distance;
      break;
    case 'down':
      dy = distance;
      break;
    case 'left':
      dx = -distance;
      break;
    case 'right':
      dx = distance;
      break;
  }

  // Try X move
  let nextX = currentPos.x + dx;
  let nextY = currentPos.y;
  if (checkWorldCollision({ x: nextX, y: nextY })) {
    nextX = currentPos.x;
  }

  // Try Y move
  nextY = currentPos.y + dy;
  if (checkWorldCollision({ x: nextX, y: nextY })) {
    nextY = currentPos.y;
  }

  return {
    position: { x: nextX, y: nextY },
    state: nextX !== currentPos.x || nextY !== currentPos.y ? 'walking' : 'idle',
  };
}
