import Phaser from 'phaser';
import {
  regions,
  WorldRegion,
  getRegionAtPosition,
  getRegionById,
  getConnectedRegions,
  RegionConnection,
  getEntrancePosition,
} from '@data/world';
import type { Vector2 } from '@shared/types';

export interface RegionChangeEvent {
  previousRegion: WorldRegion | null;
  currentRegion: WorldRegion | null;
  entrance?: RegionConnection;
}

export class RegionManager {
  private scene: Phaser.Scene;
  private currentRegion: WorldRegion | null = null;
  private previousRegion: WorldRegion | null = null;
  private regionNameDisplay?: Phaser.GameObjects.Container;
  private regionNameText?: Phaser.GameObjects.Text;
  private regionNameTimer?: Phaser.Time.TimerEvent;
  private emitter: Phaser.Events.EventEmitter;
  private lastCheckPosition: Vector2 = { x: -1, y: -1 };
  private checkThrottle = 100;
  private lastCheckTime = 0;

  constructor(scene: Phaser.Scene, emitter: Phaser.Events.EventEmitter) {
    this.scene = scene;
    this.emitter = emitter;
  }

  create(): void {
    this.createRegionNameDisplay();
  }

  private createRegionNameDisplay(): void {
    this.regionNameDisplay = this.scene.add.container(400, 100);
    this.regionNameDisplay.setScrollFactor(0);
    this.regionNameDisplay.setDepth(1000);
    this.regionNameDisplay.setAlpha(0);
    this.regionNameDisplay.setVisible(false);

    const bg = this.scene.add.rectangle(0, 0, 300, 60, 0x000000, 0.8);
    bg.setStrokeStyle(2, 0xffd700);

    this.regionNameText = this.scene.add.text(0, 0, '', {
      fontSize: '24px',
      color: '#ffd700',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.regionNameDisplay.add([bg, this.regionNameText]);
  }

  update(playerPosition: Vector2): void {
    const now = this.scene.time.now;
    if (now - this.lastCheckTime < this.checkThrottle) return;

    if (
      playerPosition.x === this.lastCheckPosition.x &&
      playerPosition.y === this.lastCheckPosition.y
    ) {
      return;
    }

    this.lastCheckTime = now;
    this.lastCheckPosition = { ...playerPosition };

    const newRegion = getRegionAtPosition(playerPosition);

    if (newRegion && newRegion !== this.currentRegion) {
      this.onRegionChange(newRegion);
    } else if (!newRegion && this.currentRegion) {
      this.onRegionChange(null);
    }
  }

  private onRegionChange(newRegion: WorldRegion | null): void {
    this.previousRegion = this.currentRegion;
    this.currentRegion = newRegion;

    if (newRegion) {
      this.showRegionName(newRegion);
      this.emitter.emit('region_entered', {
        previousRegion: this.previousRegion,
        currentRegion: newRegion,
      } as RegionChangeEvent);

      this.applyRegionAmbience(newRegion);
    } else {
      this.emitter.emit('region_exited', {
        previousRegion: this.previousRegion,
        currentRegion: null,
      } as RegionChangeEvent);
    }
  }

  private showRegionName(region: WorldRegion): void {
    if (!this.regionNameDisplay || !this.regionNameText) return;

    if (this.regionNameTimer) {
      this.regionNameTimer.remove();
    }

    this.regionNameText.setText(region.displayName);
    this.regionNameDisplay.setVisible(true);
    this.regionNameDisplay.setAlpha(0);

    this.scene.tweens.add({
      targets: this.regionNameDisplay,
      alpha: 1,
      y: 100,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.regionNameTimer = this.scene.time.delayedCall(3000, () => {
          this.hideRegionName();
        });
      },
    });
  }

  private hideRegionName(): void {
    if (!this.regionNameDisplay) return;

    this.scene.tweens.add({
      targets: this.regionNameDisplay,
      alpha: 0,
      y: 80,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.regionNameDisplay?.setVisible(false);
      },
    });
  }

  private applyRegionAmbience(region: WorldRegion): void {
    this.emitter.emit('region_ambience_change', {
      regionId: region.id,
      ambientColor: region.ambientColor,
      ambientLighting: region.ambientLighting,
      weatherAffinity: region.weatherAffinity,
      music: region.music,
    });
  }

  getCurrentRegion(): WorldRegion | null {
    return this.currentRegion;
  }

  getPreviousRegion(): WorldRegion | null {
    return this.previousRegion;
  }

  getRegionAtPosition(position: Vector2): WorldRegion | undefined {
    return getRegionAtPosition(position);
  }

  getConnectedRegions(): RegionConnection[] {
    if (!this.currentRegion) return [];
    return getConnectedRegions(this.currentRegion.id);
  }

  getEntranceToRegion(targetRegionId: string): RegionConnection | undefined {
    if (!this.currentRegion) return undefined;
    const connections = getConnectedRegions(this.currentRegion.id);
    return connections.find(c => c.to === targetRegionId);
  }

  getEntrancePosition(entranceId: string): Vector2 | undefined {
    return getEntrancePosition(entranceId);
  }

  isInRegion(regionId: string): boolean {
    return this.currentRegion?.id === regionId;
  }

  forceRegion(regionId: string): void {
    const region = getRegionById(regionId);
    if (region) {
      this.onRegionChange(region);
    }
  }

  getDiscoveredRegions(): string[] {
    return regions
      .filter(r => r.fogOfWar === false || r.id === 'village')
      .map(r => r.id);
  }

  discoverRegion(regionId: string): void {
    const region = getRegionById(regionId);
    if (region) {
      region.fogOfWar = false;
      this.emitter.emit('region_discovered', { regionId });
    }
  }

  destroy(): void {
    this.regionNameDisplay?.destroy();
    this.regionNameTimer?.remove();
  }
}