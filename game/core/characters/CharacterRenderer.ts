import Phaser from 'phaser';
import type { CharacterCustomization, Direction, PlayerState } from '@shared/types';
import { CharacterShadow } from './CharacterShadow';
import { CharacterEquipment } from './CharacterEquipment';
import { CharacterAnimator } from './CharacterAnimator';
import { AnimationStateMachine } from './AnimationStateMachine';

export class CharacterRenderer {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private shadow: CharacterShadow;
  private equipment: CharacterEquipment;
  private animator: CharacterAnimator;
  private stateMachine: AnimationStateMachine;
  private nameText: Phaser.GameObjects.Text;

  // Layered body parts for proper depth sorting
  private legsContainer: Phaser.GameObjects.Container;
  private torsoContainer: Phaser.GameObjects.Container;
  private headContainer: Phaser.GameObjects.Container;
  private hairContainer: Phaser.GameObjects.Container;
  private accessoryContainer: Phaser.GameObjects.Container;

  private currentDirection: Direction = 'down';
  private currentState: PlayerState = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number, customization: CharacterCustomization, name: string = '') {
    this.scene = scene;
    this.container = scene.add.container(x, y);

    this.shadow = new CharacterShadow(scene, this.container);
    this.equipment = new CharacterEquipment(customization);
    this.stateMachine = new AnimationStateMachine();
    
    // Create layered containers for body parts (rendered in order)
    this.legsContainer = scene.add.container(0, 0);
    this.torsoContainer = scene.add.container(0, 0);
    this.headContainer = scene.add.container(0, 0);
    this.hairContainer = scene.add.container(0, 0);
    this.accessoryContainer = scene.add.container(0, 0);

    // Add to main container in render order (bottom to top)
    this.container.add([this.legsContainer, this.torsoContainer, this.headContainer, this.hairContainer, this.accessoryContainer]);

    this.animator = new CharacterAnimator(this.container, null as unknown as Phaser.GameObjects.Graphics);

    this.nameText = scene.add.text(0, -32, name, {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '11px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.container.add(this.nameText);

    // Set initial depths for layers
    this.setLayerDepths(y);
    this.renderCharacter('down');
  }

  private setLayerDepths(y: number): void {
    // Base depth from Y position for Y-sorting
    // Use very high base to ensure character is above terrain (0-2), environment (up to ~1000), lighting (2000)
    const baseDepth = 5000 + Math.floor(y / 10);
    
    // Set main container depth (most important - must be above terrain at depth 0-2)
    this.container.setDepth(baseDepth);
    
    // Child containers sort within main container
    this.legsContainer.setDepth(baseDepth);
    this.torsoContainer.setDepth(baseDepth + 1);
    this.headContainer.setDepth(baseDepth + 2);
    this.hairContainer.setDepth(baseDepth + 3);
    this.accessoryContainer.setDepth(baseDepth + 4);
  }

  private updateLayerDepths(y: number): void {
    const baseDepth = 5000 + Math.floor(y / 10);
    
    // Update main container depth
    this.container.setDepth(baseDepth);
    
    // Update child containers
    this.legsContainer.setDepth(baseDepth);
    this.torsoContainer.setDepth(baseDepth + 1);
    this.headContainer.setDepth(baseDepth + 2);
    this.hairContainer.setDepth(baseDepth + 3);
    this.accessoryContainer.setDepth(baseDepth + 4);
  }

  renderCharacter(direction: Direction): void {
    this.currentDirection = direction;
    
    // Clear all layer graphics
    this.legsContainer.removeAll(true);
    this.torsoContainer.removeAll(true);
    this.headContainer.removeAll(true);
    this.hairContainer.removeAll(true);
    this.accessoryContainer.removeAll(true);

    const layers = this.equipment.getEquipmentLayers();
    const skinLayer = layers.find(l => l.layerName === 'skin');
    const topLayer = layers.find(l => l.layerName === 'top');
    const bottomLayer = layers.find(l => l.layerName === 'bottom');
    const shoesLayer = layers.find(l => l.layerName === 'shoes');
    const hairLayer = layers.find(l => l.layerName === 'hair');
    const accessoryLayer = layers.find(l => l.layerName === 'accessory');

    // 1. LEGS / SHOES (bottom layer)
    const shoesGraphics = this.scene.add.graphics();
    shoesGraphics.fillStyle(shoesLayer?.color || 0x333333, 1);
    shoesGraphics.fillRect(-8, 8, 6, 8);   // Left leg
    shoesGraphics.fillRect(2, 8, 6, 8);    // Right leg
    this.legsContainer.add(shoesGraphics);

    // 2. PANTS / BOTTOM
    const pantsGraphics = this.scene.add.graphics();
    pantsGraphics.fillStyle(bottomLayer?.color || 0x1565c0, 1);
    pantsGraphics.fillRect(-8, 2, 6, 8);   // Left leg
    pantsGraphics.fillRect(2, 2, 6, 8);    // Right leg
    this.legsContainer.add(pantsGraphics);

    // 3. TORSO / TOP
    const torsoGraphics = this.scene.add.graphics();
    torsoGraphics.fillStyle(topLayer?.color || 0xc62828, 1);
    torsoGraphics.fillRoundedRect(-10, -10, 20, 14, 3);
    this.torsoContainer.add(torsoGraphics);

    // 4. HEAD / SKIN
    const headGraphics = this.scene.add.graphics();
    headGraphics.fillStyle(skinLayer?.color || 0xe0ac69, 1);
    headGraphics.fillCircle(0, -18, 10);
    this.headContainer.add(headGraphics);

    // 5. EYES (on head layer)
    if (direction !== 'up') {
      const eyesGraphics = this.scene.add.graphics();
      eyesGraphics.fillStyle(0x212121, 1);
      if (direction === 'left') {
        eyesGraphics.fillRect(-6, -19, 2, 3);
      } else if (direction === 'right') {
        eyesGraphics.fillRect(4, -19, 2, 3);
      } else {
        eyesGraphics.fillRect(-4, -19, 2, 3);
        eyesGraphics.fillRect(2, -19, 2, 3);
      }
      this.headContainer.add(eyesGraphics);
    }

    // 6. HAIR LAYER (above head)
    const hairGraphics = this.scene.add.graphics();
    hairGraphics.fillStyle(hairLayer?.color || 0x3e2723, 1);
    if (direction === 'up') {
      hairGraphics.fillCircle(0, -20, 11);
    } else {
      hairGraphics.fillTriangle(-11, -22, 11, -22, 0, -28);
      hairGraphics.fillRect(-10, -26, 20, 6);
    }
    this.hairContainer.add(hairGraphics);

    // 7. ACCESSORY (top layer)
    if (accessoryLayer && accessoryLayer.style !== 'none') {
      const accessoryGraphics = this.scene.add.graphics();
      accessoryGraphics.fillStyle(accessoryLayer.color, 1);
      accessoryGraphics.fillRect(-12, -26, 24, 3);
      this.accessoryContainer.add(accessoryGraphics);
    }
  }

  update(time: number, delta: number, state: PlayerState, direction: Direction): void {
    this.currentState = state;
    this.currentDirection = direction;
    this.stateMachine.setState(state, direction);
    this.animator.setState(state, direction);
    this.animator.update(time, delta);

    // Update layer depths based on Y position for proper Y-sorting
    this.updateLayerDepths(this.container.y);

    if (!this.animator.getUseSpriteSheets()) {
      this.renderCharacter(direction);
    }
  }

  getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
    this.updateLayerDepths(y);
  }

  setSpriteSheet(config: { key: string; frameWidth: number; frameHeight: number; animations: Record<string, Record<string, { frame: string | number; duration: number }[]>> }): void {
    this.animator.setSpriteSheet(config);
    // Hide procedural layers when using sprite sheets
    this.legsContainer.setVisible(false);
    this.torsoContainer.setVisible(false);
    this.headContainer.setVisible(false);
    this.hairContainer.setVisible(false);
    this.accessoryContainer.setVisible(false);
  }

  getCurrentDirection(): Direction {
    return this.currentDirection;
  }

  getCurrentState(): PlayerState {
    return this.currentState;
  }

  destroy(): void {
    this.shadow.destroy();
    this.animator.destroy();
    this.container.destroy();
  }
}