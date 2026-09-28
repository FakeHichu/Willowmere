import Phaser from 'phaser';
import type { PlayerState, Direction } from '@shared/types';
import { AnimationStateMachine } from './AnimationStateMachine';

export interface AnimationFrame {
  frame: string | number;
  duration: number;
}

export interface AnimationDefinition {
  [state: string]: {
    [direction: string]: AnimationFrame[];
  };
}

export interface SpriteSheetConfig {
  key: string;
  frameWidth: number;
  frameHeight: number;
  animations: AnimationDefinition;
}

export class CharacterAnimator {
  private stateMachine: AnimationStateMachine;
  private container: Phaser.GameObjects.Container;
  private sprite: Phaser.GameObjects.Sprite | null = null;
  private useSpriteSheets = false;
  private currentSpriteSheet: SpriteSheetConfig | null = null;
  private bodyGraphics: Phaser.GameObjects.Graphics | null = null;
  private proceduralFallback = true;

  private lastState: PlayerState = 'idle';
  private lastDirection: Direction = 'down';

  constructor(container: Phaser.GameObjects.Container, bodyGraphics: Phaser.GameObjects.Graphics | null) {
    this.container = container;
    this.bodyGraphics = bodyGraphics;
    this.stateMachine = new AnimationStateMachine();
  }

  setSpriteSheet(config: SpriteSheetConfig): void {
    this.currentSpriteSheet = config;
    this.useSpriteSheets = true;

    if (!this.sprite) {
      this.sprite = this.container.scene.add.sprite(0, 0, config.key);
      this.container.addAt(this.sprite, 1);
      this.sprite.setVisible(true);
    } else {
      this.sprite.setTexture(config.key);
    }

    this.createAnimations(config);
    if (this.bodyGraphics) {
      this.bodyGraphics.setVisible(false);
    }
  }

  private createAnimations(config: SpriteSheetConfig): void {
    const animManager = this.container.scene.anims;

    for (const [state, directions] of Object.entries(config.animations)) {
      for (const [direction, frames] of Object.entries(directions)) {
        const animKey = `char_${state}_${direction}`;
        
        if (animManager.exists(animKey)) {
          animManager.remove(animKey);
        }

        animManager.create({
          key: animKey,
          frames: frames.map(f => 
            typeof f.frame === 'number' 
              ? { frame: f.frame, key: config.key }
              : { frame: f.frame, key: config.key }
          ),
          frameRate: frames.length > 0 ? 1000 / frames[0].duration : 10,
          repeat: state === 'idle' ? -1 : 0,
        });
      }
    }
  }

  setState(state: PlayerState, direction: Direction): void {
    this.stateMachine.setState(state, direction);
  }

  update(time: number, delta: number): void {
    const deltaSec = delta / 1000;
    this.stateMachine.update(deltaSec);

    const state = this.stateMachine.getState();
    const direction = this.stateMachine.getDirection();
    const stateTime = this.stateMachine.getStateTime();

    if (state !== this.lastState || direction !== this.lastDirection) {
      this.playAnimation(state, direction);
      this.lastState = state;
      this.lastDirection = direction;
    }

    if (this.useSpriteSheets && this.sprite) {
      this.updateSpriteTransform(state, stateTime);
    } else {
      this.updateProceduralAnimation(state, stateTime, time);
    }
  }

  private playAnimation(state: PlayerState, direction: Direction): void {
    if (!this.useSpriteSheets || !this.sprite || !this.currentSpriteSheet) return;

    const animKey = `char_${state}_${direction}`;
    if (this.container.scene.anims.exists(animKey)) {
      this.sprite.play(animKey);
    } else {
      const fallbackKey = `char_idle_${direction}`;
      if (this.container.scene.anims.exists(fallbackKey)) {
        this.sprite.play(fallbackKey);
      }
    }
  }

  private updateSpriteTransform(state: PlayerState, stateTime: number): void {
    if (!this.sprite) return;

    switch (state) {
      case 'dodging': {
        const rollProgress = Math.min(1.0, stateTime / 0.3);
        this.sprite.setAngle(rollProgress * 360);
        this.sprite.setScale(0.85, 0.85);
        break;
      }
      case 'sitting': {
        this.sprite.setAngle(0);
        this.sprite.setScale(1.0, 0.75);
        this.sprite.setY(8);
        break;
      }
      case 'interacting': {
        const pulse = Math.sin(stateTime * 8) * 0.05;
        this.sprite.setScale(1.0 + pulse, 1.0 + pulse);
        break;
      }
      default: {
        this.sprite.setAngle(0);
        this.sprite.setScale(1.0, 1.0);
        this.sprite.setY(0);
      }
    }
  }

  private updateProceduralAnimation(state: PlayerState, stateTime: number, time: number): void {
    if (this.bodyGraphics) {
      this.bodyGraphics.clear();
    }

    switch (state) {
      case 'idle': {
        const bob = Math.sin(time * 0.004) * 1.5;
        this.container.y += (bob - (this.container.getData('lastBob') || 0));
        this.container.setData('lastBob', bob);
        this.container.setAngle(0);
        this.container.setScale(1.0, 1.0);
        break;
      }
      case 'walking': {
        const step = Math.sin(time * 0.012) * 3;
        const tilt = Math.sin(time * 0.012) * 3;
        this.container.setAngle(tilt);
        this.container.setScale(1.0 + Math.abs(step) * 0.01, 1.0 - Math.abs(step) * 0.01);
        break;
      }
      case 'sprinting': {
        const step = Math.sin(time * 0.02) * 5;
        const tilt = Math.sin(time * 0.02) * 8;
        this.container.setAngle(tilt);
        this.container.setScale(1.05, 0.95);
        break;
      }
      case 'dodging': {
        const rollProgress = Math.min(1.0, stateTime / 0.3);
        this.container.setAngle(rollProgress * 360);
        this.container.setScale(0.85, 0.85);
        break;
      }
      case 'sitting': {
        this.container.setAngle(0);
        this.container.setScale(1.0, 0.8);
        break;
      }
      case 'interacting': {
        const pulse = Math.sin(time * 0.015) * 0.08;
        this.container.setScale(1.0 + pulse, 1.0 + pulse);
        break;
      }
    }
  }

  getState(): PlayerState {
    return this.stateMachine.getState();
  }

  getDirection(): Direction {
    return this.stateMachine.getDirection();
  }

  getStateTime(): number {
    return this.stateMachine.getStateTime();
  }

  getUseSpriteSheets(): boolean {
    return this.useSpriteSheets;
  }

  destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
    if (this.bodyGraphics) {
      this.bodyGraphics.setVisible(true);
    }
    this.useSpriteSheets = false;
    this.currentSpriteSheet = null;
  }
}