import Phaser from 'phaser';
import type { Vector2, WeatherType, TimeOfDay } from '@shared/types';
import { getEnvironmentProfile } from '@data/world/environment';
import { getRegionAtPosition } from '@data/world/regions';
import { WorldLighting } from './WorldLighting';
import { WorldWeather } from './WorldWeather';

export class EnvironmentManager {
  private scene: Phaser.Scene;
  private lighting: WorldLighting;
  private weather: WorldWeather;
  private currentRegionId: string = 'village';

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.lighting = new WorldLighting(scene);
    this.weather = new WorldWeather(scene);
  }

  update(time: number, delta: number, playerPos: Vector2, gameTimeStr: string): void {
    const region = getRegionAtPosition(playerPos);
    if (region && region.id !== this.currentRegionId) {
      this.currentRegionId = region.id;
      const profile = getEnvironmentProfile(region.id);
      this.weather.setWeather(profile.defaultWeather);
    }

    const timeOfDay = this.getTimeOfDay(gameTimeStr);
    const profile = getEnvironmentProfile(this.currentRegionId);
    const lightingData = profile.lightingProfiles[timeOfDay];

    this.lighting.updateLighting(timeOfDay, lightingData.color);
    this.weather.update(time, delta);
  }

  private getTimeOfDay(gameTimeStr: string): TimeOfDay {
    const hours = parseInt(gameTimeStr.split(':')[0], 10) || 12;
    if (hours >= 5 && hours < 8) return 'morning';
    if (hours >= 8 && hours < 18) return 'day';
    if (hours >= 18 && hours < 21) return 'evening';
    return 'night';
  }

  getCurrentWeather(): WeatherType {
    return this.weather.getCurrentWeather();
  }
}
