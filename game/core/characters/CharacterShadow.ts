import Phaser from 'phaser';

export class CharacterShadow {
  private graphics: Phaser.GameObjects.Graphics;
  private parentContainer: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, parentContainer: Phaser.GameObjects.Container) {
    this.parentContainer = parentContainer;
    this.graphics = scene.add.graphics();
    this.parentContainer.addAt(this.graphics, 0); // Always render shadow behind character body
    this.updateShadow(1.0, 0);
  }

  updateShadow(scale: number = 1.0, offsetY: number = 0, opacity: number = 0.35): void {
    this.graphics.clear();
    this.graphics.fillStyle(0x000000, opacity);
    
    // Draw oval drop shadow
    const width = 28 * scale;
    const height = 12 * scale;
    this.graphics.fillEllipse(0, 16 + offsetY, width, height);
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
