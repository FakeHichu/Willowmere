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
  private playerDirectionMarker!: Phaser.GameObjects.Graphics;
  private regionBoundaries!: Phaser.GameObjects.Graphics;
  private landmarkMarkers!: Phaser.GameObjects.Graphics;
  private npcMarkers!: Phaser.GameObjects.Graphics;
  private buildingMarkers!: Phaser.GameObjects.Graphics;
  private entranceMarkers!: Phaser.GameObjects.Graphics;
  private compass!: Phaser.GameObjects.Container;
  private discoveredRegions: Set<string> = new Set(['village']);
  private discoveredLandmarks: Set<string> = new Set();
  private playerPosition: Vector2 = { x: 2000, y: 1750 };
  private playerDirection: string = 'down';
  private otherPlayers: Map<string, Vector2> = new Map();
  private lastRenderTime = 0;

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

    // Background with subtle gradient effect
    this.background = this.scene.add.rectangle(0, 0, this.config.width, this.config.height, 0x0d0d1a, 0.85);
    this.background.setOrigin(0.5);

    // Decorative border
    this.border = this.scene.add.graphics();
    this.border.lineStyle(2, 0x8d6e63, 0.8);
    this.border.strokeRoundedRect(-this.config.width / 2, -this.config.height / 2, this.config.width, this.config.height, 8);
    this.border.lineStyle(1, 0xffd700, 0.3);
    this.border.strokeRoundedRect(-this.config.width / 2 + 2, -this.config.height / 2 + 2, this.config.width - 4, this.config.height - 4, 6);

    this.regionBoundaries = this.scene.add.graphics();
    this.landmarkMarkers = this.scene.add.graphics();
    this.npcMarkers = this.scene.add.graphics();
    this.buildingMarkers = this.scene.add.graphics();
    this.entranceMarkers = this.scene.add.graphics();
    this.playerMarker = this.scene.add.graphics();
    this.playerDirectionMarker = this.scene.add.graphics();

    this.container.add([
      this.background,
      this.border,
      this.regionBoundaries,
      this.landmarkMarkers,
      this.npcMarkers,
      this.buildingMarkers,
      this.entranceMarkers,
      this.playerMarker,
      this.playerDirectionMarker,
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
    
    // N/S/E/W labels
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

  private renderStaticElements(): void {
    this.regionBoundaries.clear();
    this.landmarkMarkers.clear();
    this.buildingMarkers.clear();
    this.entranceMarkers.clear();

    const scaleX = this.config.width / WORLD_BOUNDS.width;
    const scaleY = this.config.height / WORLD_BOUNDS.height;
    const centerX = 0;
    const centerY = 0;

    // Draw region boundaries with fill
    for (const region of regions) {
      if (!this.discoveredRegions.has(region.id) && region.id !== 'village') continue;

      const rx = (region.bounds.x - WORLD_BOUNDS.width / 2) * scaleX;
      const ry = (region.bounds.y - WORLD_BOUNDS.height / 2) * scaleY;
      const rw = region.bounds.width * scaleX;
      const rh = region.bounds.height * scaleY;

      // Region fill
      const regionColor = Phaser.Display.Color.HexStringToColor(region.ambientColor).color;
      this.regionBoundaries.fillStyle(regionColor, 0.15);
      this.regionBoundaries.fillRoundedRect(rx, ry, rw, rh, 2);
      
      // Region border
      this.regionBoundaries.lineStyle(1, 0x8d6e63, 0.6);
      this.regionBoundaries.strokeRoundedRect(rx, ry, rw, rh, 2);

      // Region label
      const labelX = rx + rw / 2;
      const labelY = ry + 10;
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
        const lx = (landmark.position.x - WORLD_BOUNDS.width / 2) * scaleX;
        const ly = (landmark.position.y - WORLD_BOUNDS.height / 2) * scaleY;

        const color = this.getLandmarkColor(landmark.type);
        const size = this.getLandmarkSize(landmark.type);
        
        // Draw landmark icon based on type
        this.drawLandmarkIcon(this.landmarkMarkers, lx, ly, landmark.type, color, size);
      }
    }

    // Draw buildings
    for (const obj of worldObjects) {
      if (obj.type !== 'building') continue;

      const bx = (obj.position.x - WORLD_BOUNDS.width / 2) * scaleX;
      const by = (obj.position.y - WORLD_BOUNDS.height / 2) * scaleY;

      // Building icon - small house shape
      this.buildingMarkers.fillStyle(0x8d6e63, 1);
      this.buildingMarkers.fillRect(bx - 3, by - 3, 6, 6);
      this.buildingMarkers.fillStyle(0x5d4037, 1);
      this.buildingMarkers.fillTriangle(bx, by - 5, bx - 4, by - 2, bx + 4, by - 2);
      this.buildingMarkers.lineStyle(1, 0x5d4037, 1);
      this.buildingMarkers.strokeRect(bx - 3, by - 3, 6, 6);
    }

    // Draw region entrances
    for (const entrance of regionEntrances) {
      if (!entrance.discovered) continue;

      const ex = (entrance.position.x - WORLD_BOUNDS.width / 2) * scaleX;
      const ey = (entrance.position.y - WORLD_BOUNDS.height / 2) * scaleY;

      // Entrance icon - path marker
      this.entranceMarkers.fillStyle(0x4fc3f7, 1);
      this.entranceMarkers.fillCircle(ex, ey, 3);
      this.entranceMarkers.lineStyle(1, 0xffffff, 0.8);
      this.entranceMarkers.strokeCircle(ex, ey, 3);
      
      // Entrance type indicator
      if (entrance.type === 'cave') {
        this.entranceMarkers.fillStyle(0xff9800, 1);
        this.entranceMarkers.fillTriangle(ex, ey - 4, ex - 3, ey + 1, ex + 3, ey + 1);
      } else if (entrance.type === 'bridge') {
        this.entranceMarkers.fillStyle(0x8d6e63, 1);
        this.entranceMarkers.fillRect(ex - 4, ey - 1, 8, 2);
      }
    }
  }

  private drawLandmarkIcon(graphics: Phaser.GameObjects.Graphics, x: number, y: number, type: string, color: number, size: number): void {
    graphics.fillStyle(color, 1);
    graphics.lineStyle(1, 0x000000, 0.8);

    switch (type) {
      case 'tree':
      case 'natural':
        // Tree shape
        graphics.fillTriangle(x, y - size, x - size * 0.7, y + size * 0.3, x + size * 0.7, y + size * 0.3);
        graphics.strokeTriangle(x, y - size, x - size * 0.7, y + size * 0.3, x + size * 0.7, y + size * 0.3);
        break;
      case 'water':
        // Water drop
        graphics.fillCircle(x, y, size);
        graphics.strokeCircle(x, y, size);
        break;
      case 'shrine':
        // Shrine - diamond shape
        graphics.fillRect(x - size * 0.7, y - size * 0.7, size * 1.4, size * 1.4);
        graphics.strokeRect(x - size * 0.7, y - size * 0.7, size * 1.4, size * 1.4);
        // Rotate for diamond effect via fillTriangle
        break;
      case 'ruin':
      case 'structure':
        // Square/rectangle for structures
        graphics.fillRect(x - size, y - size, size * 2, size * 2);
        graphics.strokeRect(x - size, y - size, size * 2, size * 2);
        break;
      case 'rock':
        // Irregular circle
        graphics.fillCircle(x, y, size);
        graphics.strokeCircle(x, y, size);
        break;
      case 'viewpoint':
        // Triangle pointing up
        graphics.fillTriangle(x, y - size, x - size, y + size, x + size, y + size);
        graphics.strokeTriangle(x, y - size, x - size, y + size, x + size, y + size);
        break;
      case 'hidden':
        // Star shape
        graphics.fillCircle(x, y, size);
        graphics.strokeCircle(x, y, size);
        // Small cross for hidden
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
    if (now - this.lastRenderTime < 16) return; // ~60fps cap
    this.lastRenderTime = now;

    this.playerMarker.clear();
    this.playerDirectionMarker.clear();

    const scaleX = this.config.width / WORLD_BOUNDS.width;
    const scaleY = this.config.height / WORLD_BOUNDS.height;

    const px = (this.playerPosition.x - WORLD_BOUNDS.width / 2) * scaleX;
    const py = (this.playerPosition.y - WORLD_BOUNDS.height / 2) * scaleY;

    // Player marker - arrow showing direction
    this.playerMarker.fillStyle(0xffd700, 1);
    this.playerMarker.lineStyle(2, 0x000000, 1);

    const dirAngles: Record<string, number> = {
      up: -Math.PI / 2,
      down: Math.PI / 2,
      left: Math.PI,
      right: 0,
    };
    const angle = dirAngles[this.playerDirection] || 0;

    // Draw arrow
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

    // Center dot
    this.playerMarker.fillStyle(0x000000, 1);
    this.playerMarker.fillCircle(px, py, 2);

    // Other players
    this.playerMarker.fillStyle(0x4fc3f7, 1);
    this.playerMarker.lineStyle(1, 0x000000, 0.8);
    for (const [, pos] of this.otherPlayers) {
      const ox = (pos.x - WORLD_BOUNDS.width / 2) * scaleX;
      const oy = (pos.y - WORLD_BOUNDS.height / 2) * scaleY;
      this.playerMarker.fillCircle(ox, oy, 3);
      this.playerMarker.strokeCircle(ox, oy, 3);
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

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }

  destroy(): void {
    this.container.destroy();
  }
}