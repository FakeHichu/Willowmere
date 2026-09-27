import Phaser from 'phaser';

export interface AudioConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
}

export interface MusicTrack {
  key: string;
  mood: string;
  regions: string[];
  timeOfDay?: ('dawn' | 'day' | 'dusk' | 'night')[];
  intensity: number;
}

export interface AmbientZone {
  id: string;
  bounds: Phaser.Geom.Rectangle;
  ambientSound: string;
  volume: number;
  fadeTime: number;
}

export interface SoundEffect {
  key: string;
  volume: number;
  pitch: number;
  loop: boolean;
}

export class AudioManager {
  private scene: Phaser.Scene;
  private config: AudioConfig;
  
  // Music
  private currentMusic?: Phaser.Sound.BaseSound;
  private musicTracks: Map<string, MusicTrack> = new Map();
  private currentMood = 'peaceful';
  private musicCrossfadeTime = 3000;
  
  // Ambient zones
  private ambientZones: AmbientZone[] = [];
  private activeAmbientSounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private currentZoneId: string | null = null;
  
  // Sound effects pool
  private sfxPool: Map<string, Phaser.Sound.BaseSound[]> = new Map();
  private maxPoolSize = 5;
  
  // Dynamic music
  private currentIntensity = 0;
  private targetIntensity = 0;

  constructor(scene: Phaser.Scene, config?: Partial<AudioConfig>) {
    this.scene = scene;
    this.config = {
      masterVolume: config?.masterVolume ?? 0.7,
      musicVolume: config?.musicVolume ?? 0.5,
      sfxVolume: config?.sfxVolume ?? 0.7,
      ambientVolume: config?.ambientVolume ?? 0.4,
    };
    
    this.initializeMusicTracks();
    this.initializeAmbientZones();
  }

  private initializeMusicTracks(): void {
    const tracks: MusicTrack[] = [
      { key: 'music_peaceful', mood: 'peaceful', regions: ['village', 'farmland'], timeOfDay: ['dawn', 'day'], intensity: 0.3 },
      { key: 'music_serene', mood: 'serene', regions: ['riverside', 'southern_grove'], timeOfDay: ['dawn', 'day', 'dusk'], intensity: 0.4 },
      { key: 'music_mysterious', mood: 'mysterious', regions: ['whispering_woods', 'hidden_cavern'], timeOfDay: ['day', 'dusk', 'night'], intensity: 0.5 },
      { key: 'music_harsh', mood: 'harsh', regions: ['northern_wilds', 'highland_trail'], timeOfDay: ['day', 'dusk', 'night'], intensity: 0.6 },
      { key: 'music_ancient', mood: 'ancient', regions: ['ancient_ruins'], timeOfDay: ['day', 'dusk', 'night'], intensity: 0.5 },
      { key: 'music_sacred', mood: 'sacred', regions: ['old_shrine'], timeOfDay: ['dawn', 'day', 'dusk', 'night'], intensity: 0.4 },
      { key: 'music_magical', mood: 'magical', regions: ['southern_grove'], timeOfDay: ['dusk', 'night'], intensity: 0.5 },
      { key: 'music_pastoral', mood: 'pastoral', regions: ['farmland'], timeOfDay: ['dawn', 'day'], intensity: 0.3 },
      { key: 'music_deep', mood: 'deep', regions: ['hidden_cavern'], timeOfDay: ['dawn', 'day', 'dusk', 'night'], intensity: 0.6 },
    ];

    tracks.forEach(t => this.musicTracks.set(t.mood, t));
  }

  private initializeAmbientZones(): void {
    this.ambientZones = [
      { id: 'village_ambient', bounds: new Phaser.Geom.Rectangle(1200, 1000, 1600, 1400), ambientSound: 'amb_village', volume: 0.3, fadeTime: 2000 },
      { id: 'forest_ambient', bounds: new Phaser.Geom.Rectangle(1000, -600, 2000, 1800), ambientSound: 'amb_forest', volume: 0.4, fadeTime: 3000 },
      { id: 'river_ambient', bounds: new Phaser.Geom.Rectangle(2800, 1200, 1400, 1600), ambientSound: 'amb_river', volume: 0.5, fadeTime: 2000 },
      { id: 'cave_ambient', bounds: new Phaser.Geom.Rectangle(800, -400, 1000, 1000), ambientSound: 'amb_cave', volume: 0.3, fadeTime: 2000 },
      { id: 'mountain_ambient', bounds: new Phaser.Geom.Rectangle(-200, -2000, 1200, 2000), ambientSound: 'amb_mountain', volume: 0.4, fadeTime: 3000 },
      { id: 'ruins_ambient', bounds: new Phaser.Geom.Rectangle(3000, -600, 1600, 1400), ambientSound: 'amb_ruins', volume: 0.35, fadeTime: 2000 },
    ];
  }

  create(): void {
    this.scene.sound.volume = this.config.masterVolume;
    this.startDynamicMusic();
    
    this.scene.time.addEvent({
      delay: 1000,
      callback: this.updateAmbientZones,
      callbackScope: this,
      loop: true,
    });
  }

  private startDynamicMusic(): void {
    this.playMoodMusic('peaceful');
  }

  private playMoodMusic(mood: string, crossfade: boolean = true): void {
    const track = this.musicTracks.get(mood);
    if (!track) return;

    if (this.currentMusic && crossfade) {
      this.scene.tweens.add({
        targets: this.currentMusic,
        volume: 0,
        duration: this.musicCrossfadeTime,
        onComplete: () => {
          this.currentMusic?.stop();
          this.startNewMusic(track);
        },
      });
    } else if (this.currentMusic) {
      this.currentMusic.stop();
      this.startNewMusic(track);
    } else {
      this.startNewMusic(track);
    }

    this.currentMood = mood;
  }

  private startNewMusic(track: MusicTrack): void {
    if (this.scene.cache.audio.has(track.key)) {
      this.currentMusic = this.scene.sound.add(track.key, {
        volume: this.config.musicVolume * track.intensity,
        loop: true,
      });
      this.currentMusic.play();
    }
  }

  private updateAmbientZones(): void {
    // Get player from scene registry or game object
    const player = (this.scene as any).player;
    if (!player) return;
    
    const playerX = player.x;
    const playerY = player.y;
    
    let newZoneId: string | null = null;
    for (const zone of this.ambientZones) {
      if (Phaser.Geom.Rectangle.Contains(zone.bounds, playerX, playerY)) {
        newZoneId = zone.id;
        break;
      }
    }
    
    if (newZoneId !== this.currentZoneId) {
      this.transitionToZone(newZoneId);
      this.currentZoneId = newZoneId;
    }
  }

  private transitionToZone(zoneId: string | null): void {
    this.activeAmbientSounds.forEach((sound, id) => {
      const zone = this.ambientZones.find(z => z.id === id);
      if (zone) {
        this.scene.tweens.add({
          targets: sound,
          volume: 0,
          duration: zone.fadeTime,
          onComplete: () => {
            sound.stop();
            this.activeAmbientSounds.delete(id);
          },
        });
      }
    });
    
    if (zoneId) {
      const zone = this.ambientZones.find(z => z.id === zoneId);
      if (zone && this.scene.cache.audio.has(zone.ambientSound)) {
        const sound = this.scene.sound.add(zone.ambientSound, {
          volume: 0,
          loop: true,
        });
        sound.play();
        this.activeAmbientSounds.set(zoneId, sound);
        
        this.scene.tweens.add({
          targets: sound,
          volume: this.config.ambientVolume * zone.volume,
          duration: zone.fadeTime,
        });
      }
    }
  }

  // Public methods for gameplay sounds
  playSFX(key: string, options: Partial<{ volume: number; pitch: number; loop: boolean }> = {}): void {
    const volume = (options.volume ?? 1) * this.config.sfxVolume;
    const pitch = options.pitch ?? 1;
    const loop = options.loop ?? false;
    
    if (!this.sfxPool.has(key)) {
      this.sfxPool.set(key, []);
    }
    
    const pool = this.sfxPool.get(key)!;
    let sound = pool.find(s => !s.isPlaying);
    
    if (!sound && pool.length < 5) {
      if (this.scene.cache.audio.has(key)) {
        sound = this.scene.sound.add(key, { volume, detune: (pitch - 1) * 1200, loop });
        pool.push(sound);
      }
    }
    
    if (sound) {
      (sound as any).setVolume?.(volume);
      (sound as any).setRate?.(pitch);
      sound.play();
    }
  }

  update(delta: number): void {
    this.currentIntensity = Phaser.Math.Linear(this.currentIntensity, this.targetIntensity, 0.02);
    
    if (this.currentMusic) {
      (this.currentMusic as any).setVolume?.(this.config.musicVolume * this.currentIntensity);
    }
  }

  enterCombat(): void {
    this.playMoodMusic('harsh');
    this.targetIntensity = 0.8;
  }

  exitCombat(): void {
    const player = (this.scene as any).player;
    const region = this.getRegionForPosition(player?.x ?? 0, player?.y ?? 0);
    const track = Array.from(this.musicTracks.values()).find(t => t.regions.includes(region)) || this.musicTracks.get('peaceful')!;
    this.playMoodMusic(track.mood);
    this.targetIntensity = track.intensity;
  }

  private getRegionForPosition(x: number, y: number): string {
    if (x > 2800) return 'riverside';
    if (x < 1200) return 'farmland';
    if (y < -600) return 'whispering_woods';
    if (y < -2200) return 'northern_wilds';
    if (y > 2400) return 'southern_grove';
    return 'village';
  }

  setVolume(type: 'master' | 'music' | 'sfx' | 'ambient', value: number): void {
    const clamped = Phaser.Math.Clamp(value, 0, 1);
    
    if (type === 'master') {
      this.config.masterVolume = clamped;
      this.scene.sound.volume = clamped;
    } else if (type === 'music') {
      this.config.musicVolume = clamped;
      if (this.currentMusic) {
        (this.currentMusic as any).setVolume?.(this.config.musicVolume * this.targetIntensity);
      }
    } else if (type === 'sfx') {
      this.config.sfxVolume = clamped;
    } else if (type === 'ambient') {
      this.config.ambientVolume = clamped;
    }
  }

  destroy(): void {
    this.currentMusic?.stop();
    this.activeAmbientSounds.forEach(s => s.stop());
    this.activeAmbientSounds.clear();
    this.sfxPool.forEach(pool => pool.forEach(s => s.destroy()));
    this.sfxPool.clear();
  }
}