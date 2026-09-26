import type { Vector2 } from '@shared/types';

export const INTEREST_RADIUS = 250; // Pixels

export function isInInterestRange(pos1: Vector2, pos2: Vector2): boolean {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy) <= INTEREST_RADIUS;
}
