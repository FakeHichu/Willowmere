import type { NPCBehaviorState, WeatherType, Vector2 } from '@shared/types';

export class NPCBehavior {
  static evaluateBehavior(
    scheduledState: NPCBehaviorState,
    currentWeather: WeatherType,
    playerPos?: Vector2,
    npcPos?: Vector2
  ): NPCBehaviorState {
    // Rain/Storm reaction: NPCs seek shelter or rest
    if ((currentWeather === 'storm' || currentWeather === 'rain') && scheduledState === 'walking') {
      return 'resting';
    }

    // Proximity greeting
    if (playerPos && npcPos) {
      const dist = Math.sqrt(Math.pow(playerPos.x - npcPos.x, 2) + Math.pow(playerPos.y - npcPos.y, 2));
      if (dist < 40 && scheduledState === 'idle') {
        return 'talking';
      }
    }

    return scheduledState;
  }
}
