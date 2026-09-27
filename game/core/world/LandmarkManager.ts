import Phaser from 'phaser';
import type { Vector2 } from '@shared/types';
import { landmarks, Landmark } from '@data/world/landmarks';

export class LandmarkManager {
  private scene: Phaser.Scene;
  private emitter: Phaser.Events.EventEmitter;
  private discoveredLandmarks: Set<string> = new Set();
  private landmarkSprites: Map<string, Phaser.GameObjects.Container> = new Map();

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
    graphics.fillStyle(0x78909c, 0.9);
    graphics.fillRoundedRect(
      -landmark.size.x / 2,
      -landmark.size.y / 2,
      landmark.size.x,
      landmark.size.y,
      8
    );

    const text = this.scene.add.text(0, 0, landmark.name, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    container.add([graphics, text]);
    container.setDepth(60);

    this.landmarkSprites.set(landmark.id, container);
  }

  updatePlayerPosition(playerPos: Vector2): void {
    const discoveryRadius = 160;

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
  }

  private discoverLandmark(landmark: Landmark): void {
    this.discoveredLandmarks.add(landmark.id);
    landmark.discovered = true;

    // Trigger discovery banner UI event
    this.emitter.emit('landmark_discovered', {
      landmarkId: landmark.id,
      name: landmark.name,
      description: landmark.description,
      discoveryMessage: landmark.discoveryMessage || `Discovered ${landmark.name}!`,
    });
  }

  getDiscoveredLandmarkIds(): string[] {
    return Array.from(this.discoveredLandmarks);
  }

  getLandmarks(): Landmark[] {
    return landmarks;
  }
}
