import Phaser from 'phaser';
import type { Vector2 } from '@shared/types';
import { getTerrainAtPosition } from '@data/world/worldMap';
import { terrainDefinitions, TerrainType, TILE_SIZE } from '@data/world/terrain';
import { DepthManager, DepthLayer } from './DepthManager';

export interface WaterBody {
  id: string;
  type: 'river' | 'lake' | 'ocean';
  bounds: { x: number; y: number; width: number; height: number };
  tiles: WaterTile[];
  flowDirection?: { x: number; y: number };
}

export interface WaterTile {
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  depth: number;
  isShore: boolean;
  shoreDirection?: number;
}

export class WaterManager {
  private scene: Phaser.Scene;
  private waterGraphics: Phaser.GameObjects.Graphics;
  private waterBodies: WaterBody[] = [];
  private rippleParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private flowAnimationTime = 0;
  private shoreGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.waterGraphics = scene.add.graphics();
    this.waterGraphics.setDepth(DepthLayer.WATER_SURFACE);
    this.waterGraphics.setScrollFactor(1);

    this.shoreGraphics = scene.add.graphics();
    this.shoreGraphics.setDepth(DepthLayer.WATER_SURFACE + 5);
    this.shoreGraphics.setScrollFactor(1);

    this.createRippleParticles();
  }

  private createRippleParticles(): void {
    const textureKey = 'water_ripple';
    if (!this.scene.textures.exists(textureKey)) {
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xffffff, 0.3);
      graphics.fillCircle(8, 8, 8);
      graphics.generateTexture(textureKey, 16, 16);
      graphics.destroy();
    }

    this.rippleParticles = this.scene.add.particles(0, 0, textureKey, {
      x: 0,
      y: 0,
      lifespan: { min: 800, max: 1500 },
      speed: { min: 10, max: 30 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.4, end: 0 },
      blendMode: 'ADD',
      emitting: false,
      quantity: 1,
      frequency: 200,
    });
    this.rippleParticles.setDepth(DepthLayer.WATER_SURFACE + 10);
    this.rippleParticles.setScrollFactor(1);
  }

  scanWaterBodies(regionBounds: { x: number; y: number; width: number; height: number }): WaterBody[] {
    const waterTiles: WaterTile[] = [];
    const tileSize = TILE_SIZE;

    for (let y = regionBounds.y; y < regionBounds.y + regionBounds.height; y += tileSize) {
      for (let x = regionBounds.x; x < regionBounds.x + regionBounds.width; x += tileSize) {
        const terrain = getTerrainAtPosition(x + tileSize / 2, y + tileSize / 2);
        if (terrain === 'shallow_water' || terrain === 'deep_water' || terrain === 'river') {
          const depth = terrain === 'deep_water' ? 2 : terrain === 'river' ? 1 : 0;
          const isShore = this.isShoreTile(x + tileSize / 2, y + tileSize / 2);
          const shoreDir = isShore ? this.getShoreDirection(x + tileSize / 2, y + tileSize / 2) : undefined;

          waterTiles.push({
            x: Math.floor(x / tileSize),
            y: Math.floor(y / tileSize),
            worldX: x + tileSize / 2,
            worldY: y + tileSize / 2,
            depth,
            isShore,
            shoreDirection: shoreDir,
          });
        }
      }
    }

    return this.groupWaterTiles(waterTiles);
  }

  private isShoreTile(worldX: number, worldY: number): boolean {
    const neighbors = [
      { dx: 0, dy: -TILE_SIZE },
      { dx: 0, dy: TILE_SIZE },
      { dx: -TILE_SIZE, dy: 0 },
      { dx: TILE_SIZE, dy: 0 },
    ];

    const currentTerrain = getTerrainAtPosition(worldX, worldY);
    const isWater = ['shallow_water', 'deep_water', 'river'].includes(currentTerrain);

    if (!isWater) return false;

    for (const n of neighbors) {
      const neighborTerrain = getTerrainAtPosition(worldX + n.dx, worldY + n.dy);
      if (!['shallow_water', 'deep_water', 'river'].includes(neighborTerrain)) {
        return true;
      }
    }
    return false;
  }

  private getShoreDirection(worldX: number, worldY: number): number {
    const neighbors = [
      { dx: 0, dy: -TILE_SIZE, dir: -Math.PI / 2 },
      { dx: 0, dy: TILE_SIZE, dir: Math.PI / 2 },
      { dx: -TILE_SIZE, dy: 0, dir: Math.PI },
      { dx: TILE_SIZE, dy: 0, dir: 0 },
    ];

    let dirX = 0;
    let dirY = 0;

    for (const n of neighbors) {
      const neighborTerrain = getTerrainAtPosition(worldX + n.dx, worldY + n.dy);
      if (!['shallow_water', 'deep_water', 'river'].includes(neighborTerrain)) {
        dirX += Math.cos(n.dir);
        dirY += Math.sin(n.dir);
      }
    }

    return Math.atan2(dirY, dirX);
  }

  private groupWaterTiles(tiles: WaterTile[]): WaterBody[] {
    const visited = new Set<string>();
    const bodies: WaterBody[] = [];

    for (const tile of tiles) {
      const key = `${tile.x},${tile.y}`;
      if (visited.has(key)) continue;

      const bodyTiles: WaterTile[] = [];
      const queue = [tile];
      visited.add(key);

      while (queue.length > 0) {
        const current = queue.pop()!;
        bodyTiles.push(current);

        const neighbors = [
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 },
        ];

        for (const n of neighbors) {
          const neighborKey = `${current.x + n.dx},${current.y + n.dy}`;
          if (visited.has(neighborKey)) continue;

          const neighbor = tiles.find(t => t.x === current.x + n.dx && t.y === current.y + n.dy);
          if (neighbor) {
            visited.add(neighborKey);
            queue.push(neighbor);
          }
        }
      }

      if (bodyTiles.length > 0) {
        const minX = Math.min(...bodyTiles.map(t => t.worldX));
        const maxX = Math.max(...bodyTiles.map(t => t.worldX));
        const minY = Math.min(...bodyTiles.map(t => t.worldY));
        const maxY = Math.max(...bodyTiles.map(t => t.worldY));

        const isRiver = bodyTiles.some(t => getTerrainAtPosition(t.worldX, t.worldY) === 'river');

        bodies.push({
          id: `water_${bodies.length}`,
          type: isRiver ? 'river' : 'lake',
          bounds: { x: minX - TILE_SIZE, y: minY - TILE_SIZE, width: maxX - minX + TILE_SIZE * 2, height: maxY - minY + TILE_SIZE * 2 },
          tiles: bodyTiles,
          flowDirection: isRiver ? this.calculateFlowDirection(bodyTiles) : undefined,
        });
      }
    }

    this.waterBodies = bodies;
    return bodies;
  }

  private calculateFlowDirection(tiles: WaterTile[]): { x: number; y: number } {
    let totalX = 0;
    let totalY = 0;
    let count = 0;

    for (const tile of tiles) {
      if (tile.shoreDirection !== undefined) {
        totalX += Math.cos(tile.shoreDirection);
        totalY += Math.sin(tile.shoreDirection);
        count++;
      }
    }

    if (count === 0) return { x: 1, y: 0 };

    const len = Math.sqrt(totalX * totalX + totalY * totalY);
    return { x: totalX / len, y: totalY / len };
  }

  update(delta: number, camera: Phaser.Cameras.Scene2D.Camera): void {
    this.flowAnimationTime += delta * 0.001;

    this.waterGraphics.clear();
    this.shoreGraphics.clear();

    const camBounds = camera.getBounds();
    const expandedBounds = new Phaser.Geom.Rectangle(
      camBounds.x - TILE_SIZE * 2,
      camBounds.y - TILE_SIZE * 2,
      camBounds.width + TILE_SIZE * 4,
      camBounds.height + TILE_SIZE * 4
    );

    for (const body of this.waterBodies) {
      const bodyBounds = new Phaser.Geom.Rectangle(body.bounds.x, body.bounds.y, body.bounds.width, body.bounds.height);
      if (!Phaser.Geom.Rectangle.Overlaps(bodyBounds, expandedBounds)) continue;
      this.renderWaterBody(body);
    }

    if (this.rippleParticles) {
      // Particle emitter position update handled by particle system internally
    }
  }

  private renderWaterBody(body: WaterBody): void {
    const baseColor = body.type === 'river' ? 0x0288d1 : 0x1565c0;
    const shallowColor = body.type === 'river' ? 0x4fc3f7 : 0x4fc3f7;

    for (const tile of body.tiles) {
      const screenX = tile.worldX;
      const screenY = tile.worldY;

      const depthAlpha = 0.4 + tile.depth * 0.2;
      const waveOffset = Math.sin(this.flowAnimationTime * 3 + tile.worldX * 0.01 + tile.worldY * 0.01) * 2;

      if (tile.depth === 0) {
        this.waterGraphics.fillStyle(shallowColor, depthAlpha);
      } else {
        this.waterGraphics.fillStyle(baseColor, depthAlpha);
      }

      this.waterGraphics.fillRect(
        screenX - TILE_SIZE / 2 + waveOffset * 0.5,
        screenY - TILE_SIZE / 2,
        TILE_SIZE,
        TILE_SIZE
      );

      if (tile.isShore && tile.shoreDirection !== undefined) {
        this.renderShoreTransition(tile, body.type);
      }

      if (body.type === 'river' && body.flowDirection) {
        this.renderFlowArrow(tile, body.flowDirection);
      }
    }
  }

  private renderShoreTransition(tile: WaterTile, waterType: string): void {
    if (!tile.shoreDirection) return;

    const shoreColor = terrainDefinitions.sand.color;
    const angle = tile.shoreDirection;

    this.shoreGraphics.fillStyle(shoreColor, 0.6);

    const perpAngle = angle + Math.PI / 2;
    const length = TILE_SIZE * 0.7;
    const width = 4;

    const cx = tile.worldX;
    const cy = tile.worldY;

    this.shoreGraphics.beginPath();
    this.shoreGraphics.moveTo(
      cx + Math.cos(perpAngle) * length / 2,
      cy + Math.sin(perpAngle) * length / 2
    );
    this.shoreGraphics.lineTo(
      cx + Math.cos(angle) * width + Math.cos(perpAngle) * length / 2,
      cy + Math.sin(angle) * width + Math.sin(perpAngle) * length / 2
    );
    this.shoreGraphics.lineTo(
      cx + Math.cos(angle) * width - Math.cos(perpAngle) * length / 2,
      cy + Math.sin(angle) * width - Math.sin(perpAngle) * length / 2
    );
    this.shoreGraphics.lineTo(
      cx - Math.cos(perpAngle) * length / 2,
      cy - Math.sin(perpAngle) * length / 2
    );
    this.shoreGraphics.closePath();
    this.shoreGraphics.fillPath();
  }

  private renderFlowArrow(tile: WaterTile, flow: { x: number; y: number }): void {
    const arrowLength = 8;
    const arrowWidth = 4;
    const angle = Math.atan2(flow.y, flow.x);

    this.waterGraphics.fillStyle(0x81d4fa, 0.5);

    const cx = tile.worldX;
    const cy = tile.worldY;

    const offset = (this.flowAnimationTime * 100) % TILE_SIZE;
    const drawX = cx + Math.cos(angle) * offset;
    const drawY = cy + Math.sin(angle) * offset;

    this.waterGraphics.beginPath();
    this.waterGraphics.moveTo(
      drawX + Math.cos(angle) * arrowLength,
      drawY + Math.sin(angle) * arrowLength
    );
    this.waterGraphics.lineTo(
      drawX + Math.cos(angle - Math.PI * 0.7) * arrowWidth,
      drawY + Math.sin(angle - Math.PI * 0.7) * arrowWidth
    );
    this.waterGraphics.lineTo(
      drawX + Math.cos(angle + Math.PI * 0.7) * arrowWidth,
      drawY + Math.sin(angle + Math.PI * 0.7) * arrowWidth
    );
    this.waterGraphics.closePath();
    this.waterGraphics.fillPath();
  }

  updateWaterBodies(newBodies: WaterBody[]): void {
    this.waterBodies = newBodies;
  }

  getWaterBodies(): WaterBody[] {
    return this.waterBodies;
  }

  destroy(): void {
    this.waterGraphics.destroy();
    this.shoreGraphics.destroy();
    this.rippleParticles?.destroy();
  }
}