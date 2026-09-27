import Phaser from 'phaser';
import {
  collisionObjects,
  checkCollision,
  checkCollisionAt,
  isPositionWalkable,
  findValidPositionNear,
  getNearbyCollisionObjects,
  getCollisionObjectsInRegion,
  CollisionObject,
  BoundingBox,
  PLAYER_COLLISION_SIZE,
  Size,
} from '@data/world';
import { WorldRegion, getRegionAtPosition } from '@data/world/regions';
import type { Vector2 } from '@shared/types';
import type { TerrainType } from '@data/world/terrain';

export interface CollisionResult {
  collides: boolean;
  blockingObject?: CollisionObject;
  correctedPosition?: Vector2;
}

export class WorldCollision {
  private scene: Phaser.Scene;
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private showDebug = false;
  private currentRegion: WorldRegion | null = null;
  private regionCollisionObjects: CollisionObject[] = [];
  private lastRegionCheck = { x: -1, y: -1 };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    this.debugGraphics = this.scene.add.graphics();
    this.debugGraphics.setDepth(9999);
    this.debugGraphics.setVisible(false);
  }

  update(playerPosition: Vector2): void {
    const region = getRegionAtPosition(playerPosition);

    if (region !== this.currentRegion) {
      this.currentRegion = region ?? null;
      if (region) {
        this.regionCollisionObjects = getCollisionObjectsInRegion(region.id);
      } else {
        this.regionCollisionObjects = collisionObjects;
      }
    }
  }

  checkCollision(
    position: Vector2,
    size: Size = PLAYER_COLLISION_SIZE
  ): CollisionResult {
    const checkObjects = this.regionCollisionObjects.length > 0
      ? this.regionCollisionObjects
      : collisionObjects;

    const result = checkCollision(position, size, checkObjects);

    if (result.collides && result.blockingObject) {
      const corrected = this.resolveCollision(
        position,
        size,
        result.blockingObject
      );
      return {
        collides: true,
        blockingObject: result.blockingObject,
        correctedPosition: corrected,
      };
    }

    return { collides: false };
  }

  checkCollisionAt(
    x: number,
    y: number,
    size: Size = PLAYER_COLLISION_SIZE
  ): CollisionResult {
    return this.checkCollision({ x, y }, size);
  }

  private resolveCollision(
    position: Vector2,
    size: Size,
    blockingObject: CollisionObject
  ): Vector2 {
    const obj = blockingObject;
    const objLeft = obj.position.x;
    const objRight = obj.position.x + obj.size.width;
    const objTop = obj.position.y;
    const objBottom = obj.position.y + obj.size.height;

    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;

    const playerLeft = position.x - halfWidth;
    const playerRight = position.x + halfWidth;
    const playerTop = position.y - halfHeight;
    const playerBottom = position.y + halfHeight;

    const overlapLeft = playerRight - objLeft;
    const overlapRight = objRight - playerLeft;
    const overlapTop = playerBottom - objTop;
    const overlapBottom = objBottom - playerTop;

    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);

    let newX = position.x;
    let newY = position.y;

    if (minOverlapX < minOverlapY) {
      if (overlapLeft < overlapRight) {
        newX = objLeft - halfWidth - 1;
      } else {
        newX = objRight + halfWidth + 1;
      }
    } else {
      if (overlapTop < overlapBottom) {
        newY = objTop - halfHeight - 1;
      } else {
        newY = objBottom + halfHeight + 1;
      }
    }

    return { x: newX, y: newY };
  }

  isWalkable(
    position: Vector2,
    terrainType: TerrainType = 'grass'
  ): boolean {
    return isPositionWalkable(position, terrainType, this.regionCollisionObjects);
  }

  findSafePositionNear(
    targetPosition: Vector2,
    radius: number = 50,
    terrainType: TerrainType = 'grass'
  ): Vector2 | null {
    return findValidPositionNear(targetPosition, radius, terrainType, this.regionCollisionObjects);
  }

  getNearbyObjects(position: Vector2, radius: number): CollisionObject[] {
    return getNearbyCollisionObjects(position, radius);
  }

  getRegionCollisions(regionId: string): CollisionObject[] {
    return getCollisionObjectsInRegion(regionId);
  }

  enableDebug(enabled: boolean): void {
    this.showDebug = enabled;
    this.debugGraphics?.setVisible(enabled);
  }

  renderDebug(): void {
    if (!this.showDebug || !this.debugGraphics) return;

    this.debugGraphics.clear();

    this.debugGraphics.lineStyle(2, 0xff0000, 0.8);

    for (const obj of this.regionCollisionObjects) {
      this.debugGraphics.strokeRect(
        obj.position.x,
        obj.position.y,
        obj.size.width,
        obj.size.height
      );
    }

    this.debugGraphics.lineStyle(2, 0x00ff00, 0.5);
    const playerBox: BoundingBox = {
      x: 0, y: 0,
      width: PLAYER_COLLISION_SIZE.width,
      height: PLAYER_COLLISION_SIZE.height,
    };
  }

  destroy(): void {
    this.debugGraphics?.destroy();
  }
}