import Phaser from 'phaser';
import { regions, WorldRegion } from '@data/world/regions';
import { landmarks, getLandmarksByRegion } from '@data/world/landmarks';
import { regionEntrances, RegionEntrance } from '@data/world/entrances';
import { worldObjects } from '@data/world/objects';
import { npcs } from '@data/npcs';
import { WORLD_BOUNDS } from '@game/core/GameConfig';
import type { Vector2, QuestDefinition, NPCDefinition } from '@shared/types';

export interface WorldMapConfig {
  width: number;
  height: number;
}

export class WorldMapUI {
  private scene: Phaser.Scene;
  private config: WorldMapConfig;
  private container!: Phaser.GameObjects.Container;
  private background!: Phaser.GameObjects.Rectangle;
  private mapGraphics!: Phaser.GameObjects.Graphics;
  private markerGraphics!: Phaser.GameObjects.Graphics;
  private labelContainer!: Phaser.GameObjects.Container;
  private isVisible = false;
  private discoveredRegions: Set<string> = new Set(['village']);
  private discoveredLandmarks: Set<string> = new Set();
  private activeQuests: QuestDefinition[] = [];
  private playerPosition: Vector2 = { x: 2000, y: 1750 };
  private otherPlayers: Map<string, Vector2> = new Map();
  private currentZoom = 1;
  private mapOffset = { x: 0, y: 0 };
  private isDragging = false;
  private dragStart = { x: 0, y: 0 };
  private mapKey!: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, config?: Partial<WorldMapConfig>) {
    this.scene = scene;
    this.config = {
      width: config?.width ?? Math.min(800, this.scene.scale.width - 40),
      height: config?.height ?? Math.min(600, this.scene.scale.height - 40),
    };
  }

  create(): void {
    this.mapKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.M);

    this.container = this.scene.add.container(this.scene.scale.width / 2, this.scene.scale.height / 2);
    this.container.setScrollFactor(0);
    this.container.setDepth(2000);
    this.container.setVisible(false);

    this.background = this.scene.add.rectangle(0, 0, this.config.width, this.config.height, 0x1a1a2e, 0.95);
    this.background.setStrokeStyle(3, 0x8d6e63);
    this.background.setOrigin(0.5);
    this.background.setInteractive();

    this.mapGraphics = this.scene.add.graphics();
    this.markerGraphics = this.scene.add.graphics();
    this.labelContainer = this.scene.add.container(0, 0);

    this.container.add([this.background, this.mapGraphics, this.markerGraphics, this.labelContainer]);

    this.setupInput();
    this.renderMap();
  }

  private setupInput(): void {
    this.background.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStart = {
        x: pointer.x - this.mapOffset.x,
        y: pointer.y - this.mapOffset.y,
      };
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.mapOffset.x = pointer.x - this.dragStart.x;
        this.mapOffset.y = pointer.y - this.dragStart.y;
        this.clampMapOffset();
        this.renderMap();
      }
    });

    this.scene.input.on('pointerup', () => {
      this.isDragging = false;
    });

    this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, _dx: number, dy: number) => {
      if (!this.isVisible) return;
      const zoomFactor = dy > 0 ? 0.9 : 1.1;
      this.currentZoom = Phaser.Math.Clamp(this.currentZoom * zoomFactor, 0.5, 3);
      this.renderMap();
    });

    this.scene.input.keyboard!.on('keydown-M', () => {
      this.toggle();
    });

    this.scene.input.keyboard!.on('keydown-ESC', () => {
      if (this.isVisible) this.hide();
    });
  }

  private clampMapOffset(): void {
    const mapWidth = WORLD_BOUNDS.width * this.currentZoom * 0.1;
    const mapHeight = WORLD_BOUNDS.height * this.currentZoom * 0.1;

    this.mapOffset.x = Phaser.Math.Clamp(this.mapOffset.x, -mapWidth / 2, mapWidth / 2);
    this.mapOffset.y = Phaser.Math.Clamp(this.mapOffset.y, -mapHeight / 2, mapHeight / 2);
  }

  private renderMap(): void {
    this.mapGraphics.clear();
    this.markerGraphics.clear();
    this.labelContainer.removeAll(true);

    const scale = 0.1 * this.currentZoom;
    const centerX = this.mapOffset.x;
    const centerY = this.mapOffset.y;

    this.drawRegionBoundaries(scale, centerX, centerY);
    this.drawRoads(scale, centerX, centerY);
    this.drawLandmarks(scale, centerX, centerY);
    this.drawBuildings(scale, centerX, centerY);
    this.drawEntrances(scale, centerX, centerY);
    this.drawQuestMarkers(scale, centerX, centerY);
    this.drawPlayerMarker(scale, centerX, centerY);
    this.drawOtherPlayers(scale, centerX, centerY);
  }

  private drawRegionBoundaries(scale: number, cx: number, cy: number): void {
    for (const region of regions) {
      if (!this.discoveredRegions.has(region.id) && region.id !== 'village') continue;

      const rx = (region.bounds.x - WORLD_BOUNDS.width / 2) * scale + cx;
      const ry = (region.bounds.y - WORLD_BOUNDS.height / 2) * scale + cy;
      const rw = region.bounds.width * scale;
      const rh = region.bounds.height * scale;

      const discovered = this.discoveredRegions.has(region.id);
      const alpha = discovered ? 0.3 : 0.1;

      this.mapGraphics.fillStyle(this.parseColor(region.ambientColor), alpha);
      this.mapGraphics.fillRect(rx, ry, rw, rh);

      this.mapGraphics.lineStyle(2, discovered ? 0x8d6e63 : 0x555555, 0.8);
      this.mapGraphics.strokeRect(rx, ry, rw, rh);

      const label = this.scene.add.text(rx + rw / 2, ry + 15, region.displayName, {
        fontSize: `${Math.max(10, 14 * this.currentZoom)}px`,
        color: discovered ? '#ffd700' : '#666666',
        fontFamily: 'Georgia, serif',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.labelContainer.add(label);
    }
  }

  private drawRoads(scale: number, cx: number, cy: number): void {
    this.mapGraphics.lineStyle(3, 0x8d6e63, 0.8);

    for (const entrance of regionEntrances) {
      if (!entrance.discovered && entrance.fromRegion !== 'village') continue;

      const fromRegion = regions.find(r => r.id === entrance.fromRegion);
      const toRegion = regions.find(r => r.id === entrance.toRegion);
      if (!fromRegion || !toRegion) continue;

      const fx = (fromRegion.bounds.x + fromRegion.bounds.width / 2 - WORLD_BOUNDS.width / 2) * scale + cx;
      const fy = (fromRegion.bounds.y + fromRegion.bounds.height / 2 - WORLD_BOUNDS.height / 2) * scale + cy;
      const tx = (toRegion.bounds.x + toRegion.bounds.width / 2 - WORLD_BOUNDS.width / 2) * scale + cx;
      const ty = (toRegion.bounds.y + toRegion.bounds.height / 2 - WORLD_BOUNDS.height / 2) * scale + cy;

      this.mapGraphics.beginPath();
      this.mapGraphics.moveTo(fx, fy);
      this.mapGraphics.lineTo(tx, ty);
      this.mapGraphics.strokePath();
    }
  }

  private drawLandmarks(scale: number, cx: number, cy: number): void {
    for (const region of regions) {
      if (!this.discoveredRegions.has(region.id) && region.id !== 'village') continue;

      const regionLandmarks = getLandmarksByRegion(region.id);
      for (const landmark of regionLandmarks) {
        const discovered = landmark.discovered || this.discoveredLandmarks.has(landmark.id);
        if (!discovered && landmark.type !== 'building') continue;

        const lx = (landmark.position.x - WORLD_BOUNDS.width / 2) * scale + cx;
        const ly = (landmark.position.y - WORLD_BOUNDS.height / 2) * scale + cy;

        const color = this.getLandmarkColor(landmark.type);
        this.markerGraphics.fillStyle(color, 1);
        this.markerGraphics.fillCircle(lx, ly, 5 * this.currentZoom);
        this.markerGraphics.lineStyle(1, 0x000000, 1);
        this.markerGraphics.strokeCircle(lx, ly, 5 * this.currentZoom);

        if (this.currentZoom > 1.2) {
          const label = this.scene.add.text(lx, ly - 15, landmark.name, {
            fontSize: `${Math.max(8, 10 * this.currentZoom)}px`,
            color: '#ffffff',
            fontFamily: 'Georgia, serif',
            backgroundColor: '#000000aa',
            padding: { x: 3, y: 1 },
          }).setOrigin(0.5);
          this.labelContainer.add(label);
        }
      }
    }
  }

  private drawBuildings(scale: number, cx: number, cy: number): void {
    for (const obj of worldObjects) {
      if (obj.type !== 'building') continue;

      const bx = (obj.position.x - WORLD_BOUNDS.width / 2) * scale + cx;
      const by = (obj.position.y - WORLD_BOUNDS.height / 2) * scale + cy;
      const bw = obj.size.x * scale;
      const bh = obj.size.y * scale;

      this.markerGraphics.fillStyle(0x8d6e63, 1);
      this.markerGraphics.fillRect(bx - bw / 2, by - bh / 2, bw, bh);
      this.markerGraphics.lineStyle(1, 0x5d4037, 1);
      this.markerGraphics.strokeRect(bx - bw / 2, by - bh / 2, bw, bh);
    }
  }

  private drawEntrances(scale: number, cx: number, cy: number): void {
    for (const entrance of regionEntrances) {
      if (!entrance.discovered) continue;

      const ex = (entrance.position.x - WORLD_BOUNDS.width / 2) * scale + cx;
      const ey = (entrance.position.y - WORLD_BOUNDS.height / 2) * scale + cy;

      this.markerGraphics.fillStyle(0x4fc3f7, 1);
      this.markerGraphics.fillCircle(ex, ey, 4 * this.currentZoom);
      this.markerGraphics.lineStyle(1, 0x000000, 1);
      this.markerGraphics.strokeCircle(ex, ey, 4 * this.currentZoom);
    }
  }

  private drawQuestMarkers(scale: number, cx: number, cy: number): void {
    for (const quest of this.activeQuests) {
      for (const step of quest.steps) {
        if (step.type === 'reach' && step.targetPosition) {
          const qx = (step.targetPosition.x - WORLD_BOUNDS.width / 2) * scale + cx;
          const qy = (step.targetPosition.y - WORLD_BOUNDS.height / 2) * scale + cy;

          this.markerGraphics.fillStyle(0xe91e63, 1);
          this.markerGraphics.fillCircle(qx, qy, 6 * this.currentZoom);
          this.markerGraphics.lineStyle(2, 0xffffff, 1);
          this.markerGraphics.strokeCircle(qx, qy, 6 * this.currentZoom);

          const pulse = this.scene.tweens.add({
            targets: this.markerGraphics,
            alpha: { from: 1, to: 0.5 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
          });
        }
      }
    }
  }

  private drawPlayerMarker(scale: number, cx: number, cy: number): void {
    const px = (this.playerPosition.x - WORLD_BOUNDS.width / 2) * scale + cx;
    const py = (this.playerPosition.y - WORLD_BOUNDS.height / 2) * scale + cy;

    this.markerGraphics.fillStyle(0xffd700, 1);
    this.markerGraphics.fillCircle(px, py, 6 * this.currentZoom);
    this.markerGraphics.lineStyle(2, 0x000000, 1);
    this.markerGraphics.strokeCircle(px, py, 6 * this.currentZoom);

    this.markerGraphics.fillStyle(0x000000, 1);
    this.markerGraphics.fillCircle(px, py, 2 * this.currentZoom);
  }

  private drawOtherPlayers(scale: number, cx: number, cy: number): void {
    this.markerGraphics.fillStyle(0x4fc3f7, 1);
    for (const [, pos] of this.otherPlayers) {
      const ox = (pos.x - WORLD_BOUNDS.width / 2) * scale + cx;
      const oy = (pos.y - WORLD_BOUNDS.height / 2) * scale + cy;
      this.markerGraphics.fillCircle(ox, oy, 4 * this.currentZoom);
      this.markerGraphics.lineStyle(1, 0x000000, 1);
      this.markerGraphics.strokeCircle(ox, oy, 4 * this.currentZoom);
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

  private parseColor(colorStr: string): number {
    return parseInt(colorStr.replace('#', '0x'));
  }

  update(playerPosition: Vector2): void {
    this.playerPosition = playerPosition;
    if (this.isVisible) {
      this.renderMap();
    }
  }

  setOtherPlayers(players: Map<string, Vector2>): void {
    this.otherPlayers = players;
    if (this.isVisible) {
      this.renderMap();
    }
  }

  setActiveQuests(quests: QuestDefinition[]): void {
    this.activeQuests = quests;
    if (this.isVisible) {
      this.renderMap();
    }
  }

  discoverRegion(regionId: string): void {
    this.discoveredRegions.add(regionId);
    if (this.isVisible) this.renderMap();
  }

  discoverLandmark(landmarkId: string): void {
    this.discoveredLandmarks.add(landmarkId);
    if (this.isVisible) this.renderMap();
  }

  setDiscoveredRegions(regionIds: string[]): void {
    this.discoveredRegions = new Set(regionIds);
    if (this.isVisible) this.renderMap();
  }

  setDiscoveredLandmarks(landmarkIds: string[]): void {
    this.discoveredLandmarks = new Set(landmarkIds);
    if (this.isVisible) this.renderMap();
  }

  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  show(): void {
    this.isVisible = true;
    this.container.setVisible(true);
    this.currentZoom = 1;
    this.mapOffset = { x: 0, y: 0 };
    this.renderMap();
    this.scene.input.keyboard!.enabled = false;
  }

  hide(): void {
    this.isVisible = false;
    this.container.setVisible(false);
    this.scene.input.keyboard!.enabled = true;
  }

  isOpen(): boolean {
    return this.isVisible;
  }

  destroy(): void {
    this.container.destroy();
  }
}