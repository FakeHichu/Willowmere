import type { Vector2, Direction } from '@shared/types';
import { Pathfinding } from '../pathfinding/Pathfinding';

export class NPCNavigation {
  private pathfinding: Pathfinding;
  private currentWaypoints: Vector2[] = [];
  private currentWaypointIndex: number = 0;

  constructor() {
    this.pathfinding = new Pathfinding();
  }

  setDestination(startPos: Vector2, targetPos: Vector2): void {
    this.currentWaypoints = this.pathfinding.findPath(startPos, targetPos);
    this.currentWaypointIndex = 0;
  }

  getNextMovement(currentPos: Vector2, speed: number, deltaSec: number): { position: Vector2; direction: Direction; reached: boolean } {
    if (this.currentWaypoints.length === 0 || this.currentWaypointIndex >= this.currentWaypoints.length) {
      return { position: currentPos, direction: 'down', reached: true };
    }

    const target = this.currentWaypoints[this.currentWaypointIndex];
    const dx = target.x - currentPos.x;
    const dy = target.y - currentPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 8) {
      this.currentWaypointIndex++;
      if (this.currentWaypointIndex >= this.currentWaypoints.length) {
        return { position: target, direction: 'down', reached: true };
      }
    }

    const step = speed * deltaSec;
    const dirX = dx / (dist || 1);
    const dirY = dy / (dist || 1);

    const newX = currentPos.x + dirX * step;
    const newY = currentPos.y + dirY * step;

    let direction: Direction = 'down';
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? 'right' : 'left';
    } else {
      direction = dy > 0 ? 'down' : 'up';
    }

    return {
      position: { x: newX, y: newY },
      direction,
      reached: false,
    };
  }
}
