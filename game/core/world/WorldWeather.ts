import Phaser from 'phaser';
import type { WeatherType } from '@shared/types';

export class WorldWeather {
  private scene: Phaser.Scene;
  private currentWeather: WeatherType = 'clear';
  private particlesGraphics: Phaser.GameObjects.Graphics;
  private weatherParticles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha: number }> = [];
  private maxParticles: number = 180;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.particlesGraphics = scene.add.graphics();
    this.particlesGraphics.setScrollFactor(0);
    this.particlesGraphics.setDepth(1000);
    this.initParticlePool();
  }

  private initParticlePool(): void {
    const cam = this.scene.cameras.main;
    for (let i = 0; i < this.maxParticles; i++) {
      this.weatherParticles.push({
        x: Phaser.Math.Between(0, cam.width),
        y: Phaser.Math.Between(0, cam.height),
        vx: 0,
        vy: 0,
        size: 2,
        alpha: 0.7,
      });
    }
  }

  setWeather(weather: WeatherType): void {
    if (this.currentWeather === weather) return;
    this.currentWeather = weather;
  }

  update(time: number, delta: number): void {
    if (this.currentWeather === 'clear') {
      this.particlesGraphics.clear();
      return;
    }

    const cam = this.scene.cameras.main;
    const deltaSec = delta / 1000;

    this.particlesGraphics.clear();

    if (this.currentWeather === 'rain' || this.currentWeather === 'storm') {
      this.particlesGraphics.lineStyle(1.5, 0x81d4fa, 0.6);

      this.weatherParticles.forEach(p => {
        p.y += 650 * deltaSec;
        p.x += 120 * deltaSec;

        if (p.y > cam.height) {
          p.y = 0;
          p.x = Phaser.Math.Between(0, cam.width);
        }

        this.particlesGraphics.lineBetween(p.x, p.y, p.x + 4, p.y + 12);
      });
    } else if (this.currentWeather === 'snow') {
      this.particlesGraphics.fillStyle(0xffffff, 0.8);

      this.weatherParticles.forEach(p => {
        p.y += 90 * deltaSec;
        p.x += Math.sin(time * 0.003 + p.y) * 40 * deltaSec;

        if (p.y > cam.height) {
          p.y = 0;
          p.x = Phaser.Math.Between(0, cam.width);
        }

        this.particlesGraphics.fillCircle(p.x, p.y, 2.5);
      });
    } else if (this.currentWeather === 'fog') {
      this.particlesGraphics.fillStyle(0xcfd8dc, 0.25);
      this.particlesGraphics.fillRect(0, 0, cam.width, cam.height);
    }
  }

  getCurrentWeather(): WeatherType {
    return this.currentWeather;
  }
}
