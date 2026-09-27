import Phaser from 'phaser';
import type { PlayerState, Direction } from '@shared/types';
import { AnimationStateMachine } from './AnimationStateMachine';

export class CharacterAnimator {
  private stateMachine: AnimationStateMachine;
  private container: Phaser.GameObjects.Container;

  constructor(container: Phaser.GameObjects.Container) {
    this.container = container;
    this.stateMachine = new AnimationStateMachine();
  }

  setState(state: PlayerState, direction: Direction): void {
    this.stateMachine.setState(state, direction);
  }

  update(time: number, delta: number): void {
    const deltaSec = delta / 1000;
    this.stateMachine.update(deltaSec);

    const state = this.stateMachine.getState();
    const stateTime = this.stateMachine.getStateTime();

    // Procedural animation parameters
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
        // Roll animation: 360 rotation over dodge duration (300ms)
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
}
