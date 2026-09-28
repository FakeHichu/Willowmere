import Phaser from 'phaser';
import { regions, WorldRegion, getRegionAtPosition } from '@data/world/regions';
import { landmarks, getLandmarksByRegion } from '@data/world/landmarks';
import { regionEntrances, getRegionEntrances } from '@data/world/entrances';
import { worldObjects } from '@data/world/objects';
import { WORLD_BOUNDS } from '@game/core/GameConfig';
import type { Vector2 } from '@shared/types';

export interface MinimapConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

export class Minimap {
  private scene: Phaser.Scene;
  private config: MinimapConfig;
  private container!: Phaser.GameObjects.Container;
  private background!: Phaser.GameObjects.Rectangle;
  private border!: Phaser.GameObjects.Graphics;
  private playerMarker!: Phaser.GameObjects.Graphics;
  private regionBoundaries!: Phaser.GameObjects.Graphics;
  private landmarkMarkers!: Phaser.GameObjects.Graphics;
  private buildingMarkers!: Phaser.GameObjects.Graphics;
  private entranceMarkers!: Phaser.GameObjects.Graphics;
  private compass!: Phaser.GameObjects.Container;
  private discoveredRegions: Set<string> = new Set(['village']);
  private discoveredLandmarks: Set<string> = new Set();
  private playerPosition: Vector2 = { x: 2000, y: 1750 };
  private playerDirection: string = 'down';
  private otherPlayers: Map<string, Vector2> = new Map();
  private lastRenderTime = 0;

  // World coordinate bounds
  private worldMinX = WORLD_BOUNDS.x;
  private worldMaxX = WORLD_BOUNDS.x + WORLD_BOUNDS.width;
  private worldMinY = WORLD_BOUNDS.y;
  private worldMaxY = WORLD_BOUNDS.y + WORLD_BOUNDS.height;
  private worldWidth = WORLD_BOUNDS.width;
  private worldHeight = WORLD_BOUNDS.height;

  constructor(scene: Phaser.Scene, config?: Partial<MinimapConfig>) {
    this.scene = scene;
    this.config = {
      x: config?.x ?? (this.scene.scale.width - 190),
      y: config?.y ?? 20,
      width: config?.width ?? 180,
      height: config?.height ?? 140,
      zoom: config?.zoom ?? 0.04,
    };
  }

  create(): void {
    this.container = this.scene.add.container(this.config.x, this.config.y);
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);

    this.background = this.scene.add.rectangle(0, 0, this.config.width, this.config.height, 0x0d0d1a, 0.85);
    this.background.setOrigin(0.5);

    this.border = this.scene.add.graphics();
    this.border.lineStyle(2, 0x8d6e63, 0.8);
    this.border.strokeRoundedRect(-this.config.width / 2, -this.config.height / 2, this.config.width, this.config.height, 8);
    this.border.lineStyle(1, 0xffd700, 0.3);
    this.border.strokeRoundedRect(-this.config.width / 2 + 2, -this.config.height / 2 + 2, this.config.width - 4, this.config.height - 4, 6);

    this.regionBoundaries = this.scene.add.graphics();
    this.landmarkMarkers = this.scene.add.graphics();
    this.buildingMarkers = this.scene.add.graphics();
    this.entranceMarkers = this.scene.add.graphics();
    this.playerMarker = this.scene.add.graphics();

    this.container.add([
      this.background,
      this.border,
      this.regionBoundaries,
      this.landmarkMarkers,
      this.buildingMarkers,
      this.entranceMarkers,
      this.playerMarker,
    ]);

    this.createCompass();
    this.renderStaticElements();
  }

  private createCompass(): void {
    this.compass = this.scene.add.container(this.config.width / 2 - 35, -this.config.height / 2 + 35);
    this.compass.setScrollFactor(0);
    this.compass.setDepth(1001);

    const compassBg = this.scene.add.circle(0, 0, 28, 0x000000, 0.6);
    compassBg.setStrokeStyle(1, 0x8d6e63, 0.5);
    
    const directions = [
      { label: 'N', angle: -Math.PI / 2 },
      { label: 'E', angle: 0 },
      { label: 'S', angle: Math.PI / 2 },
      { label: 'W', angle: Math.PI },
    ];

    const compassMarkers = this.scene.add.graphics();
    
    directions.forEach(dir => {
      const x = Math.cos(dir.angle) * 22;
      const y = Math.sin(dir.angle) * 22;
      compassMarkers.fillStyle(0x8d6e63, 0.7);
      compassMarkers.fillCircle(x, y, 2);
      
      const label = this.scene.add.text(x, y + 12, dir.label, {
        fontSize: '8px',
        color: '#ffd700',
        fontFamily: 'Georgia, serif',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.compass.add(label);
    });

    this.compass.add([compassBg, compassMarkers]);
    this.container.add(this.compass);
  }

  private worldToMinimap(worldX: number, worldY: number): { x: number; y: number } {
    const scaleX = this.config.width / this.worldWidth;
    const scaleY = this.config.height / this.worldHeight;
    return {
      x: (worldX - this.worldMinX) * scaleX - this.config.width / 2,
      y: (worldY - this.worldMinY) * scaleY - this.config.height / 2,
    };
  }

  private renderStaticElements(): void {
    this.regionBoundaries.clear();
    this.landmarkMarkers.clear();
    this.buildingMarkers.clear();
    this.entranceMarkers.clear();

    // Draw region boundaries with fill
    for (const region of regions) {
      if (!this.discoveredRegions.has(region.id) && region.id !== 'village') continue;

      const pos1 = this.worldToMinimap(region.bounds.x, region.bounds.y);
      const pos2 = this.worldToMinimap(region.bounds.x + region.bounds.width, region.bounds.y + region.bounds.height);
      const rw = pos2.x - pos1.x;
      const rh = pos2.y - pos1.y;

      const regionColor = Phaser.Display.Color.HexStringToColor(region.ambientColor).color;
      this.regionBoundaries.fillStyle(regionColor, 0.15);
      this.regionBoundaries.fillRoundedRect(pos1.x, pos1.y, rw, rh, 2);
      
      this.regionBoundaries.lineStyle(1, 0x8d6e63, 0.6);
      this.regionBoundaries.strokeRoundedRect(pos1.x, pos1.y, rw, rh, 2);

      const labelX = pos1.x + rw / 2;
      const labelY = pos1.y + 10;
      const regionLabel = this.scene.add.text(labelX, labelY, region.displayName, {
        fontSize: '7px',
        color: '#ffd700',
        fontFamily: 'Georgia, serif',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5);
      this.container.add(regionLabel);
    }

    // Draw landmarks with type-specific icons
    for (const region of regions) {
      if (!this.discoveredRegions.has(region.id) && region.id !== 'village') continue;

      const regionLandmarks = getLandmarksByRegion(region.id).filter(l => l.discovered || this.discoveredLandmarks.has(l.id));
      for (const landmark of regionLandmarks) {
        const pos = this.worldToMinimap(landmark.position.x, landmark.position.y);
        const color = this.getLandmarkColor(landmark.type);
        const size = this.getLandmarkSize(landmark.type);
        this.drawLandmarkIcon(this.landmarkMarkers, pos.x, pos.y, landmark.type, color, size);
      }
    }

    // Draw buildings
    for (const obj of worldObjects) {
      if (obj.type !== 'building') continue;

      const pos = this.worldToMinimap(obj.position.x, obj.position.y);
      this.buildingMarkers.fillStyle(0x8d6e63, 1);
      this.buildingMarkers.fillRect(pos.x - 3, pos.y - 3, 6, 6);
      this.buildingMarkers.fillStyle(0x5d4037, 1);
      this.buildingMarkers.fillTriangle(pos.x, pos.y - 5, pos.x - 4, pos.y - 2, pos.x + 4, pos.y - 2);
      this.buildingMarkers.lineStyle(1, 0x5d4037, 1);
      this.buildingMarkers.strokeRect(pos.x - 3, pos.y - 3, 6, 6);
    }

    // Draw region entrances
    for (const entrance of regionEntrances) {
      if (!entrance.discovered) continue;

      const pos = this.worldToMinimap(entrance.position.x, entrance.position.y);
      this.entranceMarkers.fillStyle(0x4fc3f7, 1);
      this.entranceMarkers.fillCircle(pos.x, pos.y, 3);
      this.entranceMarkers.lineStyle(1, 0xffffff, 0.8);
      this.entranceMarkers.strokeCircle(pos.x, pos.y, 3);
      
      if (entrance.type === 'cave') {
        this.entranceMarkers.fillStyle(0xff9800, 1);
        this.entranceMarkers.fillTriangle(pos.x, pos.y - 4, pos.x - 3, pos.y + 1, pos.x + 3, pos.y + 1);
      } else if (entrance.type === 'bridge') {
        this.entranceMarkers.fillStyle(0x8d6e63, 1);
        this.entranceMarkers.fillRect(pos.x - 4, pos.y - 1, 8, 2);
      }
    }
  }

  private drawLandmarkIcon(graphics: Phaser.GameObjects.Graphics, x: number, y: number, type: string, color: number, size: number): void {
    graphics.fillStyle(color, 1);
    graphics.lineStyle(1, 0x000000, 0.8);

    switch (type) {
      case 'tree':
      case 'natural':
        graphics.fillTriangle(x, y - size, x - size * 0.7, y + size * 0.3, x + size * 0.7, y + size * 0.3);
        graphics.strokeTriangle(x, y - size, x - size * 0.7, y + size * 0.3, x + size * 0.7, y + size * 0.3);
        break;
      case 'water':
        graphics.fillCircle(x, y, size);
        graphics.strokeCircle(x, y, size);
        break;
      case 'shrine':
        graphics.fillRect(x - size * 0.7, y - size * 0.7, size * 1.4, size * 1.4);
        graphics.strokeRect(x - size * 0.7, y - size * 0.7, size * 1.4, size * 1.4);
        break;
      case 'ruin':
      case 'structure':
        graphics.fillRect(x - size, y - size, size * 2, size * 2);
        graphics.strokeRect(x - size, y - size, size * 2, size * 2);
        break;
      case 'rock':
        graphics.fillCircle(x, y, size);
        graphics.strokeCircle(x, y, size);
        break;
      case 'viewpoint':
        graphics.fillTriangle(x, y - size, x - size, y + size, x + size, y + size);
        graphics.strokeTriangle(x, y - size, x - size, y + size, x + size, y + size);
        break;
      case 'hidden':
        graphics.fillCircle(x, y, size);
        graphics.strokeCircle(x, y, size);
        graphics.lineStyle(1, 0xffffff, 1);
        graphics.lineBetween(x - size, y, x + size, y);
        graphics.lineBetween(x, y - size, x, y + size);
        break;
      default:
        graphics.fillCircle(x, y, size);
        graphics.strokeCircle(x, y, size);
    }
  }

  private getLandmarkColor(type: string): number {
    switch (type) {
      case 'natural': return 0x4caf50;
      case 'structure': return 0xffd700;
      case 'ruin': return 0x78909c;
      case 'shrine': return 0x9c27b0;
      case 'water': return 0x2196f3;
      case 'tree': return 0x8bc34a;
      case 'rock': return 0x9e9e9e;
      case 'viewpoint': return 0xff9800;
      case 'hidden': return 0xe91e63;
      case 'building': return 0x8d6e63;
      default: return 0xffffff;
    }
  }

  private getLandmarkSize(type: string): number {
    switch (type) {
      case 'tree': return 4;
      case 'structure': return 4;
      case 'ruin': return 4;
      case 'shrine': return 5;
      case 'viewpoint': return 5;
      case 'hidden': return 4;
      case 'water': return 3;
      case 'rock': return 3;
      default: return 3;
    }
  }

  update(playerPosition: Vector2, playerDirection?: string): void {
    this.playerPosition = playerPosition;
    if (playerDirection) this.playerDirection = playerDirection;
    this.updatePlayerMarker();
  }

  private updatePlayerMarker(): void {
    const now = this.scene.time.now;
    if (now - this.lastRenderTime < 16) return;
    this.lastRenderTime = now;

    this.playerMarker.clear();

    const pos = this.worldToMinimap(this.playerPosition.x, this.playerPosition.y);
    const px = pos.x;
    const py = pos.y;

    this.playerMarker.fillStyle(0xffd700, 1);
    this.playerMarker.lineStyle(2, 0x000000, 1);

    const dirAngles: Record<string, number> = {
      up: -Math.PI / 2,
      down: Math.PI / 2,
      left: Math.PI,
      right: 0,
    };
    const angle = dirAngles[this.playerDirection] || 0;

    const arrowSize = 6;
    const tipX = px + Math.cos(angle) * arrowSize;
    const tipY = py + Math.sin(angle) * arrowSize;
    const baseAngle1 = angle + Math.PI * 0.85;
    const baseAngle2 = angle - Math.PI * 0.85;
    const baseX1 = px + Math.cos(baseAngle1) * arrowSize * 0.7;
    const baseY1 = py + Math.sin(baseAngle1) * arrowSize * 0.7;
    const baseX2 = px + Math.cos(baseAngle2) * arrowSize * 0.7;
    const baseY2 = py + Math.sin(baseAngle2) * arrowSize * 0.7;

    this.playerMarker.fillTriangle(tipX, tipY, baseX1, baseY1, baseX2, baseY2);
    this.playerMarker.strokeTriangle(tipX, tipY, baseX1, baseY1, baseX2, baseY2);

    this.playerMarker.fillStyle(0x000000, 1);
    this.playerMarker.fillCircle(px, py, 2);

    this.playerMarker.fillStyle(0x4fc3f7, 1);
    this.playerMarker.lineStyle(1, 0x000000, 0.8);
    for (const [, otherPos] of this.otherPlayers) {
      const otherMinimapPos = this.worldToMinimap(otherPos.x, otherPos.y);
      this.playerMarker.fillCircle(otherMinimapPos.x, otherMinimapPos.y, 3);
      this.playerMarker.strokeCircle(otherMinimapPos.x, otherMinimapPos.y, 3);
    }
  }

  setPlayerPosition(position: Vector2): void {
    this.playerPosition = position;
  }

  setPlayerDirection(direction: string): void {
    this.playerDirection = direction;
  }

  setOtherPlayers(players: Map<string, Vector2>): void {
    this.otherPlayers = players;
  }

  discoverRegion(regionId: string): void {
    this.discoveredRegions.add(regionId);
    this.renderStaticElements();
  }

  discoverLandmark(landmarkId: string): void {
    this.discoveredLandmarks.add(landmarkId);
    this.renderStaticElements();
  }

  discoverEntrance(entranceId: string): void {
    this.renderStaticElements();
  }

  getDiscoveredRegions(): string[] {
    return Array.from(this.discoveredRegions);
  }

  setDiscoveredRegions(regionIds: string[]): void {
    this.discoveredRegions = new Set(regionIds);
    this.renderStaticElements();
  }

  setDiscoveredLandmarks(landmarkIds: string[]): void {
    this.discoveredLandmarks = new Set(landmarkIds);
    this.renderStaticElements();
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  destroy(): void {
    this.container.destroy();
  }
}