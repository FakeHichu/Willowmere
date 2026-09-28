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

  private worldMinX = WORLD_BOUNDS.x;
  private worldMaxX = WORLD_BOUNDS.x + WORLD_BOUNDS.width;
  private worldMinY = WORLD_BOUNDS.y;
  private worldMaxY = WORLD_BOUNDS.y + WORLD_BOUNDS.height;
  private worldWidth = WORLD_BOUNDS.width;
  private worldHeight = WORLD_BOUNDS.height;

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
    const mapWidth = this.worldWidth * this.currentZoom * 0.1;
    const mapHeight = this.worldHeight * this.currentZoom * 0.1;

    this.mapOffset.x = Phaser.Math.Clamp(this.mapOffset.x, -mapWidth / 2, mapWidth / 2);
    this.mapOffset.y = Phaser.Math.Clamp(this.mapOffset.y, -mapHeight / 2, mapHeight / 2);
  }

  private worldToMap(worldX: number, worldY: number): { x: number; y: number } {
    const scale = 0.1 * this.currentZoom;
    return {
      x: (worldX - this.worldMinX) * scale + this.mapOffset.x,
      y: (worldY - this.worldMinY) * scale + this.mapOffset.y,
    };
  }

  private renderMap(): void {
    this.mapGraphics.clear();
    this.markerGraphics.clear();
    this.labelContainer.removeAll(true);

    this.drawRegionBoundaries();
    this.drawRoads();
    this.drawLandmarks();
    this.drawBuildings();
    this.drawEntrances();
    this.drawQuestMarkers();
    this.drawPlayerMarker();
    this.drawOtherPlayers();
  }

  private drawRegionBoundaries(): void {
    for (const region of regions) {
      if (!this.discoveredRegions.has(region.id) && region.id !== 'village') continue;

      const pos1 = this.worldToMap(region.bounds.x, region.bounds.y);
      const pos2 = this.worldToMap(region.bounds.x + region.bounds.width, region.bounds.y + region.bounds.height);
      const rw = pos2.x - pos1.x;
      const rh = pos2.y - pos1.y;

      const discovered = this.discoveredRegions.has(region.id);
      const alpha = discovered ? 0.3 : 0.1;

      this.mapGraphics.fillStyle(this.parseColor(region.ambientColor), alpha);
      this.mapGraphics.fillRect(pos1.x, pos1.y, rw, rh);

      this.mapGraphics.lineStyle(2, discovered ? 0x8d6e63 : 0x555555, 0.8);
      this.mapGraphics.strokeRect(pos1.x, pos1.y, rw, rh);

      const label = this.scene.add.text(pos1.x + rw / 2, pos1.y + 15, region.displayName, {
        fontSize: `${Math.max(10, 14 * this.currentZoom)}px`,
        color: discovered ? '#ffd700' : '#666666',
        fontFamily: 'Georgia, serif',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      this.labelContainer.add(label);
    }
  }

  private drawRoads(): void {
    this.mapGraphics.lineStyle(3, 0x8d6e63, 0.8);

    for (const entrance of regionEntrances) {
      if (!entrance.discovered && entrance.fromRegion !== 'village') continue;

      const fromRegion = regions.find(r => r.id === entrance.fromRegion);
      const toRegion = regions.find(r => r.id === entrance.toRegion);
      if (!fromRegion || !toRegion) continue;

      const fromCenter = this.worldToMap(
        fromRegion.bounds.x + fromRegion.bounds.width / 2,
        fromRegion.bounds.y + fromRegion.bounds.height / 2
      );
      const toCenter = this.worldToMap(
        toRegion.bounds.x + toRegion.bounds.width / 2,
        toRegion.bounds.y + toRegion.bounds.height / 2
      );

      this.mapGraphics.beginPath();
      this.mapGraphics.moveTo(fromCenter.x, fromCenter.y);
      this.mapGraphics.lineTo(toCenter.x, toCenter.y);
      this.mapGraphics.strokePath();
    }
  }

  private drawLandmarks(): void {
    for (const region of regions) {
      if (!this.discoveredRegions.has(region.id) && region.id !== 'village') continue;

      const regionLandmarks = getLandmarksByRegion(region.id);
      for (const landmark of regionLandmarks) {
        const discovered = landmark.discovered || this.discoveredLandmarks.has(landmark.id);
        if (!discovered && landmark.type !== 'building') continue;

        const pos = this.worldToMap(landmark.position.x, landmark.position.y);

        const color = this.getLandmarkColor(landmark.type);
        this.markerGraphics.fillStyle(color, 1);
        this.markerGraphics.fillCircle(pos.x, pos.y, 5 * this.currentZoom);
        this.markerGraphics.lineStyle(1, 0x000000, 1);
        this.markerGraphics.strokeCircle(pos.x, pos.y, 5 * this.currentZoom);

        if (this.currentZoom > 1.2) {
          const label = this.scene.add.text(pos.x, pos.y - 15, landmark.name, {
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

  private drawBuildings(): void {
    for (const obj of worldObjects) {
      if (obj.type !== 'building') continue;

      const pos1 = this.worldToMap(obj.position.x, obj.position.y);
      const pos2 = this.worldToMap(obj.position.x + obj.size.x, obj.position.y + obj.size.y);
      const bw = pos2.x - pos1.x;
      const bh = pos2.y - pos1.y;

      this.markerGraphics.fillStyle(0x8d6e63, 1);
      this.markerGraphics.fillRect(pos1.x - bw / 2, pos1.y - bh / 2, bw, bh);
      this.markerGraphics.lineStyle(1, 0x5d4037, 1);
      this.markerGraphics.strokeRect(pos1.x - bw / 2, pos1.y - bh / 2, bw, bh);
    }
  }

  private drawEntrances(): void {
    for (const entrance of regionEntrances) {
      if (!entrance.discovered) continue;

      const pos = this.worldToMap(entrance.position.x, entrance.position.y);

      this.markerGraphics.fillStyle(0x4fc3f7, 1);
      this.markerGraphics.fillCircle(pos.x, pos.y, 4 * this.currentZoom);
      this.markerGraphics.lineStyle(1, 0x000000, 1);
      this.markerGraphics.strokeCircle(pos.x, pos.y, 4 * this.currentZoom);
    }
  }

  private drawQuestMarkers(): void {
    for (const quest of this.activeQuests) {
      for (const step of quest.steps) {
        if (step.type === 'reach' && step.targetPosition) {
          const pos = this.worldToMap(step.targetPosition.x, step.targetPosition.y);

          this.markerGraphics.fillStyle(0xe91e63, 1);
          this.markerGraphics.fillCircle(pos.x, pos.y, 6 * this.currentZoom);
          this.markerGraphics.lineStyle(2, 0xffffff, 1);
          this.markerGraphics.strokeCircle(pos.x, pos.y, 6 * this.currentZoom);
        }
      }
    }
  }

  private drawPlayerMarker(): void {
    const pos = this.worldToMap(this.playerPosition.x, this.playerPosition.y);

    this.markerGraphics.fillStyle(0xffd700, 1);
    this.markerGraphics.fillCircle(pos.x, pos.y, 6 * this.currentZoom);
    this.markerGraphics.lineStyle(2, 0x000000, 1);
    this.markerGraphics.strokeCircle(pos.x, pos.y, 6 * this.currentZoom);

    this.markerGraphics.fillStyle(0x000000, 1);
    this.markerGraphics.fillCircle(pos.x, pos.y, 2 * this.currentZoom);
  }

  private drawOtherPlayers(): void {
    this.markerGraphics.fillStyle(0x4fc3f7, 1);
    for (const [, pos] of this.otherPlayers) {
      const mapPos = this.worldToMap(pos.x, pos.y);
      this.markerGraphics.fillCircle(mapPos.x, mapPos.y, 4 * this.currentZoom);
      this.markerGraphics.lineStyle(1, 0x000000, 1);
      this.markerGraphics.strokeCircle(mapPos.x, mapPos.y, 4 * this.currentZoom);
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