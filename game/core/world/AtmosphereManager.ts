import Phaser from 'phaser';
import { getCurrentWeather } from '@backend/weather/weatherSystem';
import { getGameTime } from '@backend/time/clock';

export interface AtmosphereConfig {
  enableFog: boolean;
  enableWeatherParticles: boolean;
  enableLighting: boolean;
  enableVolumetricLighting: boolean;
}

export class AtmosphereManager {
  private scene: Phaser.Scene;
  private config: AtmosphereConfig;
  
  // Fog
  private fogLayer?: Phaser.GameObjects.Rectangle;
  private fogGraphics?: Phaser.GameObjects.Graphics;
  private fogIntensity = 0;
  private targetFogIntensity = 0;
  
  // Weather particles
  private rainEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private snowEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private leafEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private mistEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  
  // Lighting
  private lightingOverlay?: Phaser.GameObjects.Rectangle;
  private volumetricLights: Phaser.GameObjects.Graphics[] = [];
  private lightShafts: Phaser.GameObjects.Graphics[] = [];
  
  // Day/night
  private dayNightCycleTimer?: Phaser.Time.TimerEvent;
  private currentHour = 12;
  private currentMinute = 0;
  
  // Region-based atmosphere
  private currentRegion = 'village';
  private regionAtmospheres: Record<string, RegionAtmosphere> = {};

  constructor(scene: Phaser.Scene, config?: Partial<AtmosphereConfig>) {
    this.scene = scene;
    this.config = {
      enableFog: config?.enableFog ?? true,
      enableWeatherParticles: config?.enableWeatherParticles ?? true,
      enableLighting: config?.enableLighting ?? true,
      enableVolumetricLighting: config?.enableVolumetricLighting ?? true,
    };
    
    this.initializeRegionAtmospheres();
  }

  private initializeRegionAtmospheres(): void {
    this.regionAtmospheres = {
      village: {
        fogDensity: 0.1,
        fogColor: 0xe8f5e9,
        ambientLight: 0xf5f0e6,
        particleTypes: ['leaves'],
        musicMood: 'peaceful',
      },
      riverside: {
        fogDensity: 0.3,
        fogColor: 0xe3f2fd,
        ambientLight: 0xe3f2fd,
        particleTypes: ['mist', 'water'],
        musicMood: 'serene',
      },
      whispering_woods: {
        fogDensity: 0.5,
        fogColor: 0x2e3a2e,
        ambientLight: 0x1b5e20,
        particleTypes: ['mist', 'fireflies', 'spores'],
        musicMood: 'mysterious',
      },
      northern_wilds: {
        fogDensity: 0.4,
        fogColor: 0x37474f,
        ambientLight: 0x263238,
        particleTypes: ['snow', 'wind'],
        musicMood: 'harsh',
      },
      ancient_ruins: {
        fogDensity: 0.35,
        fogColor: 0x263238,
        ambientLight: 0x37474f,
        particleTypes: ['dust', 'embers'],
        musicMood: 'ancient',
      },
      highland_trail: {
        fogDensity: 0.45,
        fogColor: 0x263238,
        ambientLight: 0x1a2a2a,
        particleTypes: ['wind', 'snow', 'clouds'],
        musicMood: 'epic',
      },
      old_shrine: {
        fogDensity: 0.25,
        fogColor: 0x4a148c,
        ambientLight: 0x311b92,
        particleTypes: ['magic', 'light', 'embers'],
        musicMood: 'sacred',
      },
      southern_grove: {
        fogDensity: 0.2,
        fogColor: 0x1b5e20,
        ambientLight: 0x2e7d32,
        particleTypes: ['fireflies', 'petals', 'magic'],
        musicMood: 'magical',
      },
      farmland: {
        fogDensity: 0.15,
        fogColor: 0xf1f8e9,
        ambientLight: 0xf1f8e9,
        particleTypes: ['dust', 'pollen'],
        musicMood: 'pastoral',
      },
      hidden_cavern: {
        fogDensity: 0.6,
        fogColor: 0x0d0d0d,
        ambientLight: 0x1a1a1a,
        particleTypes: ['drips', 'crystals', 'mist'],
        musicMood: 'deep',
      },
    };
  }

  create(): void {
    this.createFogSystem();
    this.createWeatherParticles();
    this.createLightingSystem();
    this.createVolumetricLighting();
    this.startDayNightCycle();
  }

  private createFogSystem(): void {
    if (!this.config.enableFog) return;

    // Main fog layer
    this.fogLayer = this.scene.add.rectangle(
      0, 0, 
      this.scene.scale.width, 
      this.scene.scale.height, 
      0xffffff, 0
    );
    this.fogLayer.setOrigin(0, 0);
    this.fogLayer.setScrollFactor(0);
    this.fogLayer.setDepth(998);
    this.fogLayer.setBlendMode(Phaser.BlendModes.OVERLAY);

    // Animated fog graphics for variation
    this.fogGraphics = this.scene.add.graphics();
    this.fogGraphics.setScrollFactor(0);
    this.fogGraphics.setDepth(997);

    // Fog animation
    this.scene.tweens.add({
      targets: this,
      fogIntensity: { from: 0.1, to: 0.4 },
      duration: 15000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createWeatherParticles(): void {
    if (!this.config.enableWeatherParticles) return;

    // Rain emitter
    this.rainEmitter = this.scene.add.particles(0, 0, '__DEFAULT', {
      x: { min: -100, max: this.scene.scale.width + 100 },
      y: -50,
      lifespan: { min: 800, max: 1200 },
      speedY: { min: 600, max: 900 },
      speedX: { min: -100, max: 100 },
      scale: { start: 0.15, end: 0 },
      alpha: { start: 0.5, end: 0 },
      tint: 0xaaaaee,
      quantity: 0,
      frequency: 30,
      blendMode: 'ADD',
      emitting: false,
    });
    this.rainEmitter.setDepth(1001);

    // Mist emitter (for foggy areas)
    this.mistEmitter = this.scene.add.particles(0, 0, '__DEFAULT', {
      x: { min: 0, max: this.scene.scale.width },
      y: { min: 0, max: this.scene.scale.height },
      lifespan: { min: 3000, max: 6000 },
      speedY: { min: -10, max: 10 },
      speedX: { min: -20, max: 20 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.15, end: 0 },
      tint: 0xffffff,
      quantity: 0,
      frequency: 200,
      blendMode: 'NORMAL',
      emitting: false,
    });
    this.mistEmitter.setDepth(999);

    // Firefly emitter (magical areas)
    this.leafEmitter = this.scene.add.particles(0, 0, '__DEFAULT', {
      x: { min: 0, max: this.scene.scale.width },
      y: { min: 0, max: this.scene.scale.height },
      lifespan: { min: 4000, max: 8000 },
      speedY: { min: -30, max: 30 },
      speedX: { min: -50, max: 50 },
      scale: { start: 0.08, end: 0.15 },
      alpha: { start: 0, end: 0.8, ease: 'Sine.easeInOut' },
      tint: 0xffffaa,
      quantity: 0,
      frequency: 500,
      blendMode: 'ADD',
      emitting: false,
    });
    this.leafEmitter.setDepth(995);

    // Snow emitter
    this.snowEmitter = this.scene.add.particles(0, 0, '__DEFAULT', {
      x: { min: -50, max: this.scene.scale.width + 50 },
      y: -50,
      lifespan: { min: 4000, max: 8000 },
      speedY: { min: 80, max: 180 },
      speedX: { min: -40, max: 40 },
      scale: { start: 0.1, end: 0 },
      alpha: { start: 0.7, end: 0 },
      tint: 0xffffff,
      quantity: 0,
      frequency: 60,
      blendMode: 'NORMAL',
      emitting: false,
      rotate: { min: -180, max: 180 },
    });
    this.snowEmitter.setDepth(1002);
  }

  private createLightingSystem(): void {
    if (!this.config.enableLighting) return;

    this.lightingOverlay = this.scene.add.rectangle(
      0, 0,
      this.scene.scale.width,
      this.scene.scale.height,
      0x000000, 0
    );
    this.lightingOverlay.setOrigin(0, 0);
    this.lightingOverlay.setScrollFactor(0);
    this.lightingOverlay.setDepth(999);
    this.lightingOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
  }

  private createVolumetricLighting(): void {
    if (!this.config.enableVolumetricLighting) return;

    // Create light shaft graphics
    for (let i = 0; i < 5; i++) {
      const shaft = this.scene.add.graphics();
      shaft.setDepth(10);
      shaft.setScrollFactor(1);
      shaft.setVisible(false);
      this.lightShafts.push(shaft);
    }
  }

  private startDayNightCycle(): void {
    // Update every minute (game time)
    this.dayNightCycleTimer = this.scene.time.addEvent({
      delay: 1000,
      callback: this.updateDayNightCycle,
      callbackScope: this,
      loop: true,
    });
  }

  private updateDayNightCycle(): void {
    const gameTime = getGameTime();
    this.currentHour = gameTime.hour;
    this.currentMinute = gameTime.minute;

    this.updateLighting();
    this.updateFog();
    this.updateWeatherParticles();
  }

  private updateLighting(): void {
    if (!this.lightingOverlay) return;

    const hour = this.currentHour;
    const minute = this.currentMinute;
    const totalMinutes = hour * 60 + minute;

    let targetAlpha = 0;
    let overlayColor = 0x000000;

    const regionAtmos = this.regionAtmospheres[this.currentRegion] || this.regionAtmospheres.village;
    const baseAmbient = regionAtmos.ambientLight;

    // Dawn (5-7)
    if (hour >= 5 && hour < 7) {
      const progress = (totalMinutes - 5 * 60) / (2 * 60);
      targetAlpha = Phaser.Math.Clamp(0.5 - progress * 0.4, 0.1, 0.5);
      overlayColor = Phaser.Display.Color.HexStringToColor('#1a1a2e').color;
    }
    // Day (7-17)
    else if (hour >= 7 && hour < 17) {
      targetAlpha = 0;
      // Subtle warm tint during day
      if (hour >= 7 && hour < 10) {
        targetAlpha = 0.05;
        overlayColor = Phaser.Display.Color.HexStringToColor('#fff8e1').color;
      } else if (hour >= 15 && hour < 17) {
        targetAlpha = 0.1;
        overlayColor = Phaser.Display.Color.HexStringToColor('#ffe0b2').color;
      }
    }
    // Dusk (17-19)
    else if (hour >= 17 && hour < 19) {
      const progress = (totalMinutes - 17 * 60) / (2 * 60);
      targetAlpha = Phaser.Math.Clamp(progress * 0.5, 0, 0.5);
      overlayColor = Phaser.Display.Color.HexStringToColor('#3e2723').color;
    }
    // Evening (19-22)
    else if (hour >= 19 && hour < 22) {
      const progress = (totalMinutes - 19 * 60) / (3 * 60);
      targetAlpha = Phaser.Math.Clamp(0.5 + progress * 0.35, 0.5, 0.85);
      overlayColor = Phaser.Display.Color.HexStringToColor('#1a1a2e').color;
    }
    // Night (22-5)
    else {
      targetAlpha = 0.85;
      overlayColor = Phaser.Display.Color.HexStringToColor('#0a0a1a').color;
    }

    // Apply region-specific ambient lighting
    const regionColor = Phaser.Display.Color.HexStringToColor('#' + baseAmbient.toString(16).padStart(6, '0')).color;
    
    this.lightingOverlay!.setFillStyle(overlayColor, targetAlpha);

    // Add subtle region color tint during day
    if (hour >= 7 && hour < 17) {
      this.lightingOverlay!.setFillStyle(regionColor, 0.03);
    }
  }

  private updateFog(): void {
    if (!this.fogLayer || !this.fogGraphics) return;

    const regionAtmos = this.regionAtmospheres[this.currentRegion] || this.regionAtmospheres.village;
    const hour = this.currentHour;

    // Calculate target fog intensity based on region and time
    let baseFog = regionAtmos.fogDensity;

    // More fog at night and dawn/dusk
    if (this.currentHour >= 20 || this.currentHour < 6) {
      baseFog = Math.min(1, baseFog + 0.3);
    } else if ((this.currentHour >= 5 && this.currentHour < 7) || (this.currentHour >= 18 && this.currentHour < 20)) {
      baseFog = Math.min(1, baseFog + 0.2);
    }

    this.targetFogIntensity = baseFog;

    // Smooth transition
    this.fogIntensity = Phaser.Math.Linear(this.fogIntensity, this.targetFogIntensity, 0.01);

    // Apply fog
    const fogColor = Phaser.Display.Color.HexStringToColor('#' + regionAtmos.fogColor.toString(16).padStart(6, '0')).color;
    this.fogLayer!.setFillStyle(fogColor, this.fogIntensity * 0.6);

    // Animated fog variation
    this.fogGraphics!.clear();
    const time = this.scene.time.now * 0.0005;
    for (let i = 0; i < 8; i++) {
      const x = (Math.sin(time + i * 0.8) * 0.5 + 0.5) * this.scene.scale.width;
      const y = (Math.cos(time * 0.7 + i * 1.2) * 0.5 + 0.5) * this.scene.scale.height;
      const radius = 80 + Math.sin(time + i) * 30;
      this.fogGraphics!.fillStyle(fogColor, this.fogIntensity * 0.15);
      this.fogGraphics!.fillCircle(x, y, radius);
    }
  }

  private updateWeatherParticles(): void {
    const weather = getCurrentWeather();
    const regionAtmos = this.regionAtmospheres[this.currentRegion] || this.regionAtmospheres.village;

    // Rain
    if (this.rainEmitter) {
      if (weather.type === 'rain' || weather.type === 'heavy_rain') {
        const intensity = weather.type === 'heavy_rain' ? 2 : 1;
        this.rainEmitter.setQuantity(intensity * 5);
        this.rainEmitter.setFrequency(weather.type === 'heavy_rain' ? 20 : 40);
        this.rainEmitter.resume();
        
        // Position emitter above camera
        const cam = this.scene.cameras.main;
        const emitZone = new Phaser.Geom.Rectangle(
          cam.scrollX - 100,
          cam.scrollY - 100,
          cam.width + 200,
          50
        );
        this.rainEmitter.setEmitZone(emitZone as any);
      } else {
        this.rainEmitter.pause();
      }
    }

    // Mist/Fog
    if (this.mistEmitter) {
      const isFoggy = weather.type === 'fog' || this.currentRegion === 'whispering_woods' || this.currentRegion === 'hidden_cavern';
      if (isFoggy) {
        this.mistEmitter.setQuantity(1);
        this.mistEmitter.setFrequency(300);
        this.mistEmitter.resume();
      } else {
        this.mistEmitter.pause();
      }
    }

    // Fireflies/leaves (magical areas)
    if (this.leafEmitter) {
      const isMagical = ['whispering_woods', 'southern_grove', 'old_shrine'].includes(this.currentRegion);
      if (isMagical && this.currentHour >= 19 || this.currentHour < 5) {
        this.leafEmitter.setQuantity(1);
        this.leafEmitter.setFrequency(800);
        this.leafEmitter.resume();
      } else {
        this.leafEmitter.pause();
      }
    }

    // Snow
    if (this.snowEmitter) {
      // Snow based on region, not weather type (since weather system doesn't have snow)
      const isSnowyRegion = ['northern_wilds', 'highland_trail', 'old_shrine'].includes(this.currentRegion);
      if (isSnowyRegion) {
        this.snowEmitter.setQuantity(1);
        this.snowEmitter.setFrequency(60);
        this.snowEmitter.resume();
      } else {
        this.snowEmitter.pause();
      }
    }
  }

  // Public methods
  setRegion(regionId: string): void {
    this.currentRegion = regionId;
    
    // Trigger region transition effects
    this.scene.tweens.add({
      targets: this.lightingOverlay,
      alpha: { from: 0, to: 0.3 },
      duration: 500,
      yoyo: true,
      ease: 'Sine.easeInOut',
    });
  }

  setWeather(weatherType: string): void {
    // Trigger weather change effects
    if (weatherType === 'rain' || weatherType === 'heavy_rain') {
      this.rainEmitter?.resume();
      this.scene.cameras.main.shake(50, 0.01);
    }
  }

  // Volumetric light shafts (using multiple rects for gradient effect)
  createLightShaft(x: number, y: number, angle: number, length: number, color: number = 0xffffee, intensity: number = 0.3): void {
    const shaft = this.lightShafts.find(s => !s.visible);
    if (!shaft) return;

    shaft.clear();
    shaft.setVisible(true);
    shaft.setPosition(x, y);
    shaft.setRotation(angle);

    // Simulate gradient with multiple rectangles fading out
    const segments = 10;
    const segmentLength = length / segments;
    const colorObj = Phaser.Display.Color.IntegerToColor(color);
    
    for (let i = 0; i < segments; i++) {
      const progress = i / segments;
      const segmentAlpha = intensity * (1 - progress) * (1 - progress); // Quadratic fade
      const segmentX = i * segmentLength;
      
      shaft.fillStyle(color, segmentAlpha);
      shaft.fillRect(segmentX, -20, segmentLength + 2, 40);
    }

    // Animate
    this.scene.tweens.add({
      targets: shaft,
      alpha: { from: 1, to: 0 },
      scaleX: { from: 1, to: 1.2 },
      duration: 3000,
      ease: 'Sine.easeOut',
      onComplete: () => shaft.setVisible(false),
    });
  }

  // Screen space god rays
  createGodRays(sourceX: number, sourceY: number, count: number = 8): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const length = 500 + Math.random() * 300;
      this.createLightShaft(sourceX, sourceY, angle, length, 0xfff8e1, 0.15);
    }
  }

  // Weather transition effects
  transitionWeather(fromType: string, toType: string, duration: number = 3000): void {
    // Fade out current weather
    this.scene.tweens.add({
      targets: this.rainEmitter,
      alpha: { from: 1, to: 0 },
      duration: duration / 2,
      onComplete: () => {
        this.updateWeatherParticles();
        this.scene.tweens.add({
          targets: this.rainEmitter,
          alpha: { from: 0, to: 1 },
          duration: duration / 2,
        });
      },
    });
  }

  getCurrentRegionAtmosphere(): RegionAtmosphere {
    return this.regionAtmospheres[this.currentRegion] || this.regionAtmospheres.village;
  }

  destroy(): void {
    this.dayNightCycleTimer?.remove();
    this.fogLayer?.destroy();
    this.fogGraphics?.destroy();
    this.rainEmitter?.destroy();
    this.snowEmitter?.destroy();
    this.leafEmitter?.destroy();
    this.mistEmitter?.destroy();
    this.lightingOverlay?.destroy();
    this.volumetricLights.forEach(g => g.destroy());
    this.lightShafts.forEach(g => g.destroy());
  }
}

interface RegionAtmosphere {
  fogDensity: number;
  fogColor: number;
  ambientLight: number;
  particleTypes: string[];
  musicMood: string;
}