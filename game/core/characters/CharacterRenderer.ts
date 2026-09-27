import Phaser from 'phaser';
import type { CharacterCustomization, Direction, PlayerState } from '@shared/types';
import { CharacterShadow } from './CharacterShadow';
import { CharacterEquipment } from './CharacterEquipment';
import { CharacterAnimator } from './CharacterAnimator';

export class CharacterRenderer {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private shadow: CharacterShadow;
  private equipment: CharacterEquipment;
  private animator: CharacterAnimator;
  private bodyGraphics: Phaser.GameObjects.Graphics;
  private nameText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, customization: CharacterCustomization, name: string = '') {
    this.scene = scene;
    this.container = scene.add.container(x, y);

    this.shadow = new CharacterShadow(scene, this.container);
    this.equipment = new CharacterEquipment(customization);
    this.animator = new CharacterAnimator(this.container);

    this.bodyGraphics = scene.add.graphics();
    this.container.add(this.bodyGraphics);

    this.nameText = scene.add.text(0, -32, name, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.container.add(this.nameText);

    this.renderCharacter('down');
  }

  renderCharacter(direction: Direction): void {
    this.bodyGraphics.clear();
    const layers = this.equipment.getEquipmentLayers();

    const skinLayer = layers.find(l => l.layerName === 'skin');
    const topLayer = layers.find(l => l.layerName === 'top');
    const bottomLayer = layers.find(l => l.layerName === 'bottom');
    const shoesLayer = layers.find(l => l.layerName === 'shoes');
    const hairLayer = layers.find(l => l.layerName === 'hair');
    const accessoryLayer = layers.find(l => l.layerName === 'accessory');

    // 1. Legs / Shoes
    this.bodyGraphics.fillStyle(shoesLayer?.color || 0x333333, 1);
    this.bodyGraphics.fillRect(-8, 8, 6, 8);
    this.bodyGraphics.fillRect(2, 8, 6, 8);

    // 2. Pants / Bottom
    this.bodyGraphics.fillStyle(bottomLayer?.color || 0x1565c0, 1);
    this.bodyGraphics.fillRect(-8, 2, 6, 8);
    this.bodyGraphics.fillRect(2, 2, 6, 8);

    // 3. Torso / Top
    this.bodyGraphics.fillStyle(topLayer?.color || 0xc62828, 1);
    this.bodyGraphics.fillRoundedRect(-10, -10, 20, 14, 3);

    // 4. Head / Skin
    this.bodyGraphics.fillStyle(skinLayer?.color || 0xe0ac69, 1);
    this.bodyGraphics.fillCircle(0, -18, 10);

    // 5. Hair Layer
    this.bodyGraphics.fillStyle(hairLayer?.color || 0x3e2723, 1);
    if (direction === 'up') {
      this.bodyGraphics.fillCircle(0, -20, 11);
    } else {
      this.bodyGraphics.fillTriangle(-11, -22, 11, -22, 0, -28);
      this.bodyGraphics.fillRect(-10, -26, 20, 6);
    }

    // 6. Eyes (if facing down/left/right)
    if (direction !== 'up') {
      this.bodyGraphics.fillStyle(0x212121, 1);
      if (direction === 'left') {
        this.bodyGraphics.fillRect(-6, -19, 2, 3);
      } else if (direction === 'right') {
        this.bodyGraphics.fillRect(4, -19, 2, 3);
      } else {
        this.bodyGraphics.fillRect(-4, -19, 2, 3);
        this.bodyGraphics.fillRect(2, -19, 2, 3);
      }
    }

    // 7. Accessory (if any)
    if (accessoryLayer && accessoryLayer.style !== 'none') {
      this.bodyGraphics.fillStyle(accessoryLayer.color, 1);
      this.bodyGraphics.fillRect(-12, -26, 24, 3); // Feather/Hat brim
    }
  }

  update(time: number, delta: number, state: PlayerState, direction: Direction): void {
    this.animator.setState(state, direction);
    this.animator.update(time, delta);
    this.renderCharacter(direction);
  }

  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  destroy(): void {
    this.shadow.destroy();
    this.container.destroy();
  }
}
