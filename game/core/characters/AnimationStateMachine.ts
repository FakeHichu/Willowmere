import type { PlayerState, Direction } from '@shared/types';

export class AnimationStateMachine {
  private currentState: PlayerState = 'idle';
  private currentDirection: Direction = 'down';
  private stateTime: number = 0;

  setState(state: PlayerState, direction: Direction): boolean {
    if (this.currentState === state && this.currentDirection === direction) {
      return false; // No change
    }

    // Check invalid transitions if necessary (e.g. cannot sprint while sitting)
    if (this.currentState === 'sitting' && state === 'sprinting') {
      return false;
    }

    this.currentState = state;
    this.currentDirection = direction;
    this.stateTime = 0;
    return true;
  }

  update(deltaSeconds: number): void {
    this.stateTime += deltaSeconds;
  }

  getState(): PlayerState {
    return this.currentState;
  }

  getDirection(): Direction {
    return this.currentDirection;
  }

  getStateTime(): number {
    return this.stateTime;
  }
}
