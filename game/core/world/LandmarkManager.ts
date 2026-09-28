import Phaser from 'phaser';
import type { Vector2 } from '@shared/types';
import { landmarks, Landmark, LandmarkType } from '@data/world/landmarks';
import { DepthLayer } from './DepthManager';

export interface LandmarkDiscoveryNotification {
  landmarkId: string;
  name: string;
  description: string;
  discoveryMessage: string;
  type: LandmarkType;
}

export class LandmarkManager {
  private scene: Phaser.Scene;
  private emitter: Phaser.Events.EventEmitter;
  private discoveredLandmarks: Set<string> = new Set();
  private landmarkSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private discoveryNotification?: Phaser.GameObjects.Container;
  private notificationQueue: LandmarkDiscoveryNotification[] = [];
  private isShowingNotification = false;

  constructor(scene: Phaser.Scene, emitter: Phaser.Events.EventEmitter) {
    this.scene = scene;
    this.emitter = emitter;
  }

  create(): void {
    landmarks.forEach(landmark => {
      this.renderLandmark(landmark);
    });
  }

  private renderLandmark(landmark: Landmark): void {
    const container = this.scene.add.container(landmark.position.x, landmark.position.y);

    const graphics = this.scene.add.graphics();
    const color = this.getLandmarkColor(landmark.type);

    graphics.fillStyle(color, 0.85);
    graphics.lineStyle(2, 0x000000, 0.5);

    if (landmark.type === 'tree' || landmark.type === 'natural') {
      graphics.fillTriangle(
        0, -landmark.size.y / 2,
        -landmark.size.x / 2, landmark.size.y / 2,
        landmark.size.x / 2, landmark.size.y / 2
      );
      graphics.strokeTriangle(
        0, -landmark.size.y / 2,
        -landmark.size.x / 2, landmark.size.y / 2,
        landmark.size.x / 2, landmark.size.y / 2
      );
      // Trunk
      graphics.fillStyle(0x5d4037, 1);
      graphics.fillRect(-landmark.size.x * 0.1, landmark.size.y * 0.3, landmark.size.x * 0.2, landmark.size.y * 0.4);
    } else if (landmark.type === 'water') {
      graphics.fillCircle(0, 0, Math.max(landmark.size.x, landmark.size.y) / 2);
      graphics.strokeCircle(0, 0, Math.max(landmark.size.x, landmark.size.y) / 2);
    } else if (landmark.type === 'shrine') {
      graphics.fillRect(-landmark.size.x / 2, -landmark.size.y / 2, landmark.size.x, landmark.size.y);
      graphics.strokeRect(-landmark.size.x / 2, -landmark.size.y / 2, landmark.size.x, landmark.size.y);
      // Torii-like top
      graphics.lineStyle(3, color, 1);
      graphics.lineBetween(-landmark.size.x / 2 - 10, -landmark.size.y / 2 - 5, landmark.size.x / 2 + 10, -landmark.size.y / 2 - 5);
    } else if (landmark.type === 'ruin' || landmark.type === 'structure' || landmark.type === 'building') {
      graphics.fillRoundedRect(-landmark.size.x / 2, -landmark.size.y / 2, landmark.size.x, landmark.size.y, 4);
      graphics.strokeRoundedRect(-landmark.size.x / 2, -landmark.size.y / 2, landmark.size.x, landmark.size.y, 4);
    } else if (landmark.type === 'viewpoint') {
      graphics.fillTriangle(
        0, -landmark.size.y / 2,
        -landmark.size.x / 2, landmark.size.y / 2,
        landmark.size.x / 2, landmark.size.y / 2
      );
      graphics.strokeTriangle(
        0, -landmark.size.y / 2,
        -landmark.size.x / 2, landmark.size.y / 2,
        landmark.size.x / 2, landmark.size.y / 2
      );
      // Flag
      graphics.fillStyle(0xffd700, 1);
      graphics.fillRect(-2, -landmark.size.y / 2 - 8, 4, 10);
    } else {
      graphics.fillCircle(0, 0, Math.max(landmark.size.x, landmark.size.y) / 2);
      graphics.strokeCircle(0, 0, Math.max(landmark.size.x, landmark.size.y) / 2);
    }

    // Name label (only visible when discovered or close)
    const text = this.scene.add.text(0, landmark.size.y / 2 + 16, landmark.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '11px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    text.setVisible(false);
    text.setData('landmarkName', landmark.name);

    container.add([graphics, text]);
    container.setDepth(DepthLayer.TREE_TRUNKS_AND_STRUCTURES);

    this.landmarkSprites.set(landmark.id, container);
  }

  private getLandmarkColor(type: LandmarkType): number {
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

  updatePlayerPosition(playerPos: Vector2): void {
    const discoveryRadius = 180;

    landmarks.forEach(landmark => {
      if (this.discoveredLandmarks.has(landmark.id)) return;

      const dist = Math.sqrt(
        Math.pow(playerPos.x - landmark.position.x, 2) +
        Math.pow(playerPos.y - landmark.position.y, 2)
      );

      if (dist <= discoveryRadius) {
        this.discoverLandmark(landmark);
      }
    });

    // Update label visibility based on distance
    this.landmarkSprites.forEach((container, id) => {
      const landmark = landmarks.find(l => l.id === id);
      if (!landmark) return;

      const dist = Math.sqrt(
        Math.pow(playerPos.x - landmark.position.x, 2) +
        Math.pow(playerPos.y - landmark.position.y, 2)
      );

      const label = container.getAt(1) as Phaser.GameObjects.Text;
      if (label) {
        label.setVisible(this.discoveredLandmarks.has(id) || dist < 300);
      }
    });
  }

  private discoverLandmark(landmark: Landmark): void {
    this.discoveredLandmarks.add(landmark.id);
    landmark.discovered = true;

    const notification: LandmarkDiscoveryNotification = {
      landmarkId: landmark.id,
      name: landmark.name,
      description: landmark.description,
      discoveryMessage: landmark.discoveryMessage || `Discovered ${landmark.name}!`,
      type: landmark.type,
    };

    this.queueNotification(notification);

    // Visual feedback on the landmark
    const sprite = this.landmarkSprites.get(landmark.id);
    if (sprite) {
      this.playDiscoveryEffect(sprite, landmark);
    }

    // Trigger discovery banner UI event
    this.emitter.emit('landmark_discovered', notification);
  }

  private playDiscoveryEffect(container: Phaser.GameObjects.Container, landmark: Landmark): void {
    // Pulse effect
    this.scene.tweens.add({
      targets: container,
      scaleX: { from: 1, to: 1.3 },
      scaleY: { from: 1, to: 1.3 },
      duration: 300,
      yoyo: true,
      ease: 'Power2',
    });

    // Sparkle particles
    const color = this.getLandmarkColor(landmark.type);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.scene.add.circle(
        container.x + Math.cos(angle) * 30,
        container.y + Math.sin(angle) * 30,
        4,
        color,
        1
      );
      particle.setDepth(DepthLayer.FOREGROUND_CANOPY + 10);

      this.scene.tweens.add({
        targets: particle,
        x: container.x + Math.cos(angle) * 80,
        y: container.y + Math.sin(angle) * 80,
        alpha: { from: 1, to: 0 },
        scale: { from: 1, to: 0.2 },
        duration: 800,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private queueNotification(notification: LandmarkDiscoveryNotification): void {
    this.notificationQueue.push(notification);
    this.processNotificationQueue();
  }

  private processNotificationQueue(): void {
    if (this.isShowingNotification || this.notificationQueue.length === 0) return;

    const notification = this.notificationQueue.shift()!;
    this.showNotification(notification);
  }

  private showNotification(notification: LandmarkDiscoveryNotification): void {
    this.isShowingNotification = true;

    const screenWidth = this.scene.cameras.main.width;
    const container = this.scene.add.container(screenWidth / 2, 80);
    container.setScrollFactor(0);
    container.setDepth(5000);
    container.setAlpha(0);

    const iconColor = this.getLandmarkColor(notification.type);
    const iconChar = this.getLandmarkIcon(notification.type);

    const bg = this.scene.add.rectangle(0, 0, 360, 80, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(3, iconColor, 1);

    const iconText = this.scene.add.text(-160, 0, iconChar, {
      fontSize: '28px',
      color: `#${iconColor.toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5);

    const titleText = this.scene.add.text(-130, -16, '✦ Discovery ✦', {
      fontFamily: 'Georgia, serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: `#${iconColor.toString(16).padStart(6, '0')}`,
    }).setOrigin(0, 0.5);

    const nameText = this.scene.add.text(-130, 4, notification.name, {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0, 0);

    const msgText = this.scene.add.text(-130, 26, notification.description, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '10px',
      color: '#aaaaaa',
      wordWrap: { width: 280 },
    }).setOrigin(0, 0);

    container.add([bg, iconText, titleText, nameText, msgText]);

    this.scene.tweens.add({
      targets: container,
      alpha: 1,
      y: 90,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.scene.time.delayedCall(4000, () => {
          this.scene.tweens.add({
            targets: container,
            alpha: 0,
            y: 70,
            duration: 300,
            onComplete: () => {
              container.destroy();
              this.isShowingNotification = false;
              this.processNotificationQueue();
            },
          });
        });
      },
    });

    this.discoveryNotification = container;
  }

  private getLandmarkIcon(type: LandmarkType): string {
    switch (type) {
      case 'natural': return '🌿';
      case 'structure': return '🏛️';
      case 'ruin': return '🏚️';
      case 'shrine': return '🏮';
      case 'water': return '💧';
      case 'tree': return '🌳';
      case 'rock': return '🗿';
      case 'viewpoint': return '🏔️';
      case 'hidden': return '✨';
      case 'building': return '🏠';
      default: return '📍';
    }
  }

  getDiscoveredLandmarkIds(): string[] {
    return Array.from(this.discoveredLandmarks);
  }

  getLandmarks(): Landmark[] {
    return landmarks;
  }

  isDiscovered(landmarkId: string): boolean {
    return this.discoveredLandmarks.has(landmarkId);
  }

  setDiscovered(landmarkId: string, discovered: boolean = true): void {
    if (discovered) {
      this.discoveredLandmarks.add(landmarkId);
      const landmark = landmarks.find(l => l.id === landmarkId);
      if (landmark) landmark.discovered = true;
    } else {
      this.discoveredLandmarks.delete(landmarkId);
      const landmark = landmarks.find(l => l.id === landmarkId);
      if (landmark) landmark.discovered = false;
    }
  }

  destroy(): void {
    this.landmarkSprites.forEach(sprite => sprite.destroy());
    this.landmarkSprites.clear();
    this.discoveryNotification?.destroy();
    this.notificationQueue = [];
  }
}