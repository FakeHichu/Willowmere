import Phaser from 'phaser';
import type { Vector2, WeatherType, TimeOfDay } from '@shared/types';
import { getEnvironmentProfile } from '@data/world/environment';
import { getRegionAtPosition } from '@data/world/regions';

export interface LightSource {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: number;
  intensity: number;
  flicker?: boolean;
}

export interface WeatherState {
  type: WeatherType;
  intensity: number;
  particles: Phaser.GameObjects.Graphics;
  particlePool: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }>;
}

export class EnvironmentManager {
  private scene: Phaser.Scene;

  private currentRegionId: string = 'village';
  private currentWeather: WeatherType = 'clear';
  private currentTimeOfDay: TimeOfDay = 'day';

  private ambientOverlay: Phaser.GameObjects.Rectangle;
  private lightSources: LightSource[] = [];
  private lightGraphics: Phaser.GameObjects.Graphics;

  private weatherState: WeatherState | null = null;
  private maxWeatherParticles = 200;

  private fogGraphics: Phaser.GameObjects.Graphics;
  private fogIntensity = 0;
  private targetFogIntensity = 0;
  private fogColor = 0xffffff;

  private volumetricLights: Phaser.GameObjects.Graphics[] = [];

  private lastTimeUpdate = 0;
  private timeUpdateInterval = 1000;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.ambientOverlay = scene.add.rectangle(
      0, 0,
      scene.cameras.main.width * 4,
      scene.cameras.main.height * 4,
      0x000000, 0
    );
    this.ambientOverlay.setScrollFactor(0);
    this.ambientOverlay.setDepth(2000);
    this.ambientOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);

    this.lightGraphics = scene.add.graphics();
    this.lightGraphics.setScrollFactor(1);
    this.lightGraphics.setDepth(1999);

    this.fogGraphics = scene.add.graphics();
    this.fogGraphics.setScrollFactor(0);
    this.fogGraphics.setDepth(997);

    for (let i = 0; i < 5; i++) {
      const shaft = scene.add.graphics();
      shaft.setDepth(10);
      shaft.setScrollFactor(1);
      shaft.setVisible(false);
      this.volumetricLights.push(shaft);
    }

    this.initWeather('clear');
  }

  private initWeather(weather: WeatherType): void {
    const cam = this.scene.cameras.main;
    const particles = this.scene.add.graphics();
    particles.setScrollFactor(0);
    particles.setDepth(1000);

    const particlePool: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }> = [];
    for (let i = 0; i < this.maxWeatherParticles; i++) {
      particlePool.push({
        x: Phaser.Math.Between(0, cam.width),
        y: Phaser.Math.Between(0, cam.height),
        vx: 0,
        vy: 0,
        size: 2,
        alpha: 0.7,
      });
    }

    this.weatherState = {
      type: weather,
      intensity: 1,
      particles,
      particlePool,
    };
  }

  update(time: number, delta: number, playerPos: Vector2, gameTimeStr: string): void {
    const region = getRegionAtPosition(playerPos);
    if (region && region.id !== this.currentRegionId) {
      this.onRegionChange(region.id);
    }

    const newTimeOfDay = this.getTimeOfDay(gameTimeStr);
    if (newTimeOfDay !== this.currentTimeOfDay) {
      this.currentTimeOfDay = newTimeOfDay;
      this.applyLighting();
    }

    this.updateFog(delta);
    this.updateWeather(time, delta);
    this.updateLightSources();
    this.updateVolumetricLights(delta);

    this.lastTimeUpdate = time;
  }

  private onRegionChange(regionId: string): void {
    this.currentRegionId = regionId;
    const profile = getEnvironmentProfile(regionId);

    if (profile.allowedWeathers.includes(this.currentWeather) === false) {
      this.setWeather(profile.defaultWeather);
    }

    this.fogColor = Phaser.Display.Color.HexStringToColor(profile.lightingProfiles[this.currentTimeOfDay].color).color;
    this.targetFogIntensity = profile.lightingProfiles[this.currentTimeOfDay].fogDensity;

    this.scene.tweens.add({
      targets: this.ambientOverlay,
      alpha: { from: 0, to: 0.3 },
      duration: 500,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
  }

  private getTimeOfDay(gameTimeStr: string): TimeOfDay {
    const hours = parseInt(gameTimeStr.split(':')[0], 10) || 12;
    if (hours >= 5 && hours < 8) return 'morning';
    if (hours >= 8 && hours < 18) return 'day';
    if (hours >= 18 && hours < 21) return 'evening';
    return 'night';
  }

  private applyLighting(): void {
    const profile = getEnvironmentProfile(this.currentRegionId);
    const lightingData = profile.lightingProfiles[this.currentTimeOfDay];

    const alphaMap: Record<TimeOfDay, number> = {
      morning: 0.15,
      day: 0.0,
      evening: 0.35,
      night: 0.65,
    };

    const colorNum = Phaser.Display.Color.HexStringToColor(lightingData.color).color;
    this.ambientOverlay.setFillStyle(colorNum, alphaMap[this.currentTimeOfDay] || 0);

    this.fogColor = colorNum;
    this.targetFogIntensity = lightingData.fogDensity;
  }

  private updateFog(delta: number): void {
    this.fogIntensity = Phaser.Math.Linear(this.fogIntensity, this.targetFogIntensity, 0.01 * (delta / 16));

    if (this.fogIntensity > 0.01) {
      this.fogGraphics.clear();
      const cam = this.scene.cameras.main;
      const fogColor = Phaser.Display.Color.IntegerToColor(this.fogColor);

      this.fogGraphics.fillStyle(this.fogColor, this.fogIntensity * 0.6);
      this.fogGraphics.fillRect(0, 0, cam.width, cam.height);

      const t = this.scene.time.now * 0.0005;
      for (let i = 0; i < 6; i++) {
        const x = (Math.sin(t + i * 0.8) * 0.5 + 0.5) * cam.width;
        const y = (Math.cos(t * 0.7 + i * 1.2) * 0.5 + 0.5) * cam.height;
        const radius = 100 + Math.sin(t + i) * 40;
        this.fogGraphics.fillStyle(this.fogColor, this.fogIntensity * 0.15);
        this.fogGraphics.fillCircle(x, y, radius);
      }
    } else {
      this.fogGraphics.clear();
    }
  }

  private updateWeather(time: number, delta: number): void {
    if (!this.weatherState || this.currentWeather === 'clear') {
      this.weatherState?.particles.clear();
      return;
    }

    const cam = this.scene.cameras.main;
    const deltaSec = delta / 1000;

    this.weatherState.particles.clear();

    if (this.currentWeather === 'rain' || this.currentWeather === 'storm') {
      this.weatherState.particles.lineStyle(1.5, 0x81d4fa, 0.6);

      this.weatherState.particlePool.forEach(p => {
        p.y += 650 * deltaSec;
        p.x += 120 * deltaSec;

        if (p.y > cam.height) {
          p.y = 0;
          p.x = Phaser.Math.Between(0, cam.width);
        }

        this.weatherState!.particles.lineBetween(p.x, p.y, p.x + 4, p.y + 12);
      });
    } else if (this.currentWeather === 'snow') {
      this.weatherState.particles.fillStyle(0xffffff, 0.8);

      this.weatherState.particlePool.forEach(p => {
        p.y += 90 * deltaSec;
        p.x += Math.sin(time * 0.003 + p.y) * 40 * deltaSec;

        if (p.y > cam.height) {
          p.y = 0;
          p.x = Phaser.Math.Between(0, cam.width);
        }

        this.weatherState!.particles.fillCircle(p.x, p.y, 2.5);
      });
    } else if (this.currentWeather === 'fog') {
      this.weatherState.particles.fillStyle(0xcfd8dc, 0.25);
      this.weatherState.particles.fillRect(0, 0, cam.width, cam.height);
    }
  }

  private updateLightSources(): void {
    this.lightGraphics.clear();

    if (this.lightSources.length === 0) return;

    const cam = this.scene.cameras.main;

    for (const light of this.lightSources) {
      const screenX = light.x - cam.scrollX;
      const screenY = light.y - cam.scrollY;

      if (screenX < -light.radius || screenX > cam.width + light.radius ||
          screenY < -light.radius || screenY > cam.height + light.radius) {
        continue;
      }

      const segments = 10;
      for (let i = segments; i > 0; i--) {
        const progress = i / segments;
        const radius = light.radius * progress;
        const alpha = light.intensity * (1 - progress) * (1 - progress);
        this.lightGraphics.fillStyle(light.color, alpha);
        this.lightGraphics.fillCircle(screenX, screenY, radius);
      }
    }
  }

  private updateVolumetricLights(delta: number): void {
    for (const shaft of this.volumetricLights) {
      if (!shaft.visible) continue;

      shaft.alpha -= delta * 0.0003;
      shaft.scaleX += delta * 0.00005;

      if (shaft.alpha <= 0) {
        shaft.setVisible(false);
      }
    }
  }

  setWeather(weather: WeatherType): void {
    if (this.currentWeather === weather) return;

    const profile = getEnvironmentProfile(this.currentRegionId);
    if (!profile.allowedWeathers.includes(weather)) {
      console.warn(`[EnvironmentManager] Weather ${weather} not allowed in region ${this.currentRegionId}`);
      return;
    }

    this.currentWeather = weather;

    if (weather !== 'clear') {
      this.initWeather(weather);
    }
  }

  getCurrentWeather(): WeatherType {
    return this.currentWeather;
  }

  getCurrentTimeOfDay(): TimeOfDay {
    return this.currentTimeOfDay;
  }

  getCurrentRegion(): string {
    return this.currentRegionId;
  }

  addLightSource(light: LightSource): void {
    this.lightSources.push(light);
  }

  removeLightSource(id: string): void {
    this.lightSources = this.lightSources.filter(l => l.id !== id);
  }

  updateLightSource(id: string, updates: Partial<LightSource>): void {
    const light = this.lightSources.find(l => l.id === id);
    if (light) Object.assign(light, updates);
  }

  createLightShaft(x: number, y: number, angle: number, length: number, color: number = 0xffffee, intensity: number = 0.3): void {
    const shaft = this.volumetricLights.find(s => !s.visible);
    if (!shaft) return;

    shaft.clear();
    shaft.setVisible(true);
    shaft.setPosition(x, y);
    shaft.setRotation(angle);
    shaft.setAlpha(intensity);
    shaft.setScale(1, 1);

    const segments = 10;
    const segmentLength = length / segments;
    const colorObj = Phaser.Display.Color.IntegerToColor(color);

    for (let i = 0; i < segments; i++) {
      const progress = i / segments;
      const segmentAlpha = intensity * (1 - progress) * (1 - progress);
      const segmentX = i * segmentLength;

      shaft.fillStyle(color, segmentAlpha);
      shaft.fillRect(segmentX, -20, segmentLength + 2, 40);
    }

    this.scene.tweens.add({
      targets: shaft,
      alpha: { from: intensity, to: 0 },
      scaleX: { from: 1, to: 1.2 },
      duration: 3000,
      ease: 'Sine.easeOut',
      onComplete: () => shaft.setVisible(false),
    });
  }

  createGodRays(sourceX: number, sourceY: number, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const length = 500 + Math.random() * 300;
      this.createLightShaft(sourceX, sourceY, angle, length, 0xfff8e1, 0.15);
    }
  }

  flash(color: number = 0xffffff, duration: number = 250): void {
    this.scene.cameras.main.flash(duration, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
  }

  fadeOut(color: number = 0x000000, duration: number = 500): Promise<void> {
    return new Promise(resolve => {
      this.scene.cameras.main.fadeOut(duration, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
      this.scene.cameras.main.once('camerafadeoutcomplete', resolve);
    });
  }

  fadeIn(color: number = 0x000000, duration: number = 500): Promise<void> {
    return new Promise(resolve => {
      this.scene.cameras.main.fadeIn(duration, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
      this.scene.cameras.main.once('camerafadeincomplete', resolve);
    });
  }

  destroy(): void {
    this.ambientOverlay?.destroy();
    this.lightGraphics?.destroy();
    this.fogGraphics?.destroy();
    this.weatherState?.particles?.destroy();
    this.volumetricLights.forEach(g => g.destroy());
  }
}