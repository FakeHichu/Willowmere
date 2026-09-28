import Phaser from 'phaser';
import { getRegionAtPosition } from '@data/world/regions';
import { getLandmarksAtPosition } from '@data/world/landmarks';

export interface CameraConfig {
  lerp: { x: number; y: number };
  deadzone: Phaser.Geom.Rectangle | null;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  shakeIntensity: number;
  shakeDuration: number;
  lookAhead: { x: number; y: number };
  bounds: Phaser.Geom.Rectangle;
}

interface CameraTarget extends Phaser.GameObjects.GameObject {
  x: number;
  y: number;
}

export interface CinematicEvent {
  type: 'region_discovery' | 'landmark_reveal' | 'area_transition' | 'custom';
  target?: CameraTarget;
  position?: { x: number; y: number };
  zoom?: number;
  duration?: number;
  holdDuration?: number;
  onComplete?: () => void;
}

export class DynamicCamera {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private target: CameraTarget | null = null;
  private config: CameraConfig;

  private currentZoom = 1.5;
  private targetZoom = 1.5;
  private shakeTime = 0;
  private shakeOffset = { x: 0, y: 0 };
  private isShaking = false;

  private cinematicMode = false;
  private cinematicTarget: CameraTarget | null = null;
  private cinematicDuration = 0;
  private cinematicTimer = 0;
  private cinematicHoldTimer = 0;
  private cinematicOnComplete?: () => void;

  private lastTargetPos = { x: 0, y: 0 };
  private velocity = { x: 0, y: 0 };

  private positionLerp = 0.1;
  private zoomLerp = 0.08;

  private currentRegionId: string | null = null;
  private discoveredLandmarks: Set<string> = new Set();
  private lastLandmarkCheck = 0;

  constructor(scene: Phaser.Scene, config?: Partial<CameraConfig>) {
    this.scene = scene;
    this.camera = scene.cameras.main;

    this.config = {
      lerp: { x: 0.1, y: 0.1 },
      deadzone: new Phaser.Geom.Rectangle(-50, -50, 100, 100),
      zoom: 1.5,
      minZoom: 0.8,
      maxZoom: 3.0,
      shakeIntensity: 0,
      shakeDuration: 0,
      lookAhead: { x: 100, y: 80 },
      bounds: new Phaser.Geom.Rectangle(-400, -3500, 6800, 8000),
      ...config
    };
  }

  setTarget(target: CameraTarget): void {
    this.target = target;
    this.lastTargetPos = { x: target.x, y: target.y };
    this.camera.startFollow(target, true, this.config.lerp.x, this.config.lerp.y);
    if (this.config.deadzone) {
      this.camera.setDeadzone(this.config.deadzone.width, this.config.deadzone.height);
    }
    this.camera.setBounds(
      this.config.bounds.x,
      this.config.bounds.y,
      this.config.bounds.width,
      this.config.bounds.height
    );
    this.camera.setZoom(this.currentZoom);
  }

  update(delta: number, playerVelocity?: { x: number; y: number }, playerSpeed?: number): void {
    if (!this.target) return;

    if (playerVelocity) {
      this.velocity.x = Phaser.Math.Linear(this.velocity.x, playerVelocity.x, 0.15);
      this.velocity.y = Phaser.Math.Linear(this.velocity.y, playerVelocity.y, 0.15);
    }

    this.currentZoom = Phaser.Math.Linear(this.currentZoom, this.targetZoom, this.zoomLerp);
    this.camera.setZoom(this.currentZoom);

    if (this.target && (Math.abs(this.velocity.x) > 10 || Math.abs(this.velocity.y) > 10)) {
      const lookAheadX = Math.sign(this.velocity.x) * Math.min(Math.abs(this.velocity.x) * 0.3, this.config.lookAhead.x);
      const lookAheadY = Math.sign(this.velocity.y) * Math.min(Math.abs(this.velocity.y) * 0.3, this.config.lookAhead.y);

      const centerX = this.target.x + lookAheadX;
      const centerY = this.target.y + lookAheadY;

      this.camera.centerOn(centerX, centerY);
    }

    if (this.isShaking) {
      this.shakeTime -= delta;
      if (this.shakeTime <= 0) {
        this.isShaking = false;
        this.shakeOffset = { x: 0, y: 0 };
        this.camera.setPosition(0, 0);
      } else {
        const progress = 1 - this.shakeTime / this.config.shakeDuration;
        const intensity = this.config.shakeIntensity * (1 - progress * 0.5);
        this.shakeOffset.x = (Math.random() - 0.5) * intensity;
        this.shakeOffset.y = (Math.random() - 0.5) * intensity;
        this.camera.setPosition(this.shakeOffset.x, this.shakeOffset.y);
      }
    }

    if (this.cinematicMode && this.cinematicTarget) {
      this.updateCinematic(delta);
    }

    this.checkRegionDiscovery();
    this.checkLandmarkReveal();

    this.lastTargetPos = { x: this.target.x, y: this.target.y };
  }

  private updateCinematic(delta: number): void {
    if (!this.cinematicTarget) return;

    this.cinematicTimer -= delta;

    if (this.cinematicHoldTimer > 0) {
      this.cinematicHoldTimer -= delta;
      return;
    }

    const t = 1 - this.cinematicTimer / this.cinematicDuration;
    const easedT = this.easeInOutCubic(t);

    const targetX = this.cinematicTarget.x;
    const targetY = this.cinematicTarget.y;

    this.camera.centerOn(
      Phaser.Math.Linear(this.camera.midPoint.x, targetX, easedT),
      Phaser.Math.Linear(this.camera.midPoint.y, targetY, easedT)
    );

    if (this.cinematicTimer <= 0) {
      this.endCinematic();
    }
  }

  private checkRegionDiscovery(): void {
    if (!this.target) return;
    const region = getRegionAtPosition(this.target);
    if (region && region.id !== this.currentRegionId) {
      const wasNewRegion = this.currentRegionId !== null;
      this.currentRegionId = region.id;

      if (wasNewRegion && region.fogOfWar) {
        this.triggerCinematicEvent({
          type: 'region_discovery',
          position: { x: this.target!.x, y: this.target!.y },
          zoom: 1.2,
          duration: 1500,
          holdDuration: 1000,
        });
      }
    }
  }

  private checkLandmarkReveal(): void {
    if (!this.target) return;

    const now = this.scene.time.now;
    if (now - this.lastLandmarkCheck < 1000) return;
    this.lastLandmarkCheck = now;

    const nearbyLandmarks = getLandmarksAtPosition(this.target, 400);
    for (const landmark of nearbyLandmarks) {
      if (!this.discoveredLandmarks.has(landmark.id) && landmark.discovered) {
        this.discoveredLandmarks.add(landmark.id);
        this.triggerCinematicEvent({
          type: 'landmark_reveal',
          target: { x: landmark.position.x, y: landmark.position.y } as CameraTarget,
          zoom: 1.0,
          duration: 2000,
          holdDuration: 1500,
        });
        break;
      }
    }
  }

  triggerCinematicEvent(event: CinematicEvent): void {
    if (this.cinematicMode) return;

    this.cinematicMode = true;
    this.camera.stopFollow();

    let targetX: number;
    let targetY: number;
    const targetZoom = event.zoom ?? this.config.zoom;
    const duration = event.duration ?? 2000;
    const holdDuration = event.holdDuration ?? 0;

    if (event.target) {
      targetX = event.target.x;
      targetY = event.target.y;
    } else if (event.position) {
      targetX = event.position.x;
      targetY = event.position.y;
    } else if (this.target) {
      targetX = this.target.x;
      targetY = this.target.y;
    } else {
      this.cinematicMode = false;
      return;
    }

    this.cinematicTarget = { x: targetX, y: targetY } as CameraTarget;
    this.cinematicDuration = duration;
    this.cinematicTimer = duration;
    this.cinematicHoldTimer = holdDuration;
    this.cinematicOnComplete = event.onComplete;

    this.setZoom(targetZoom, true);
  }

  private endCinematic(): void {
    this.cinematicMode = false;
    this.cinematicTarget = null;

    if (this.cinematicOnComplete) {
      const callback = this.cinematicOnComplete;
      this.cinematicOnComplete = undefined;
      callback();
    }

    if (this.target) {
      this.camera.startFollow(this.target, true, this.config.lerp.x, this.config.lerp.y);
    }
    this.resetZoom();
  }

  shake(intensity: number = 10, duration: number = 300): void {
    this.config.shakeIntensity = intensity;
    this.config.shakeDuration = duration;
    this.shakeTime = duration;
    this.isShaking = true;
  }

  setZoom(zoom: number, smooth: boolean = true): void {
    this.targetZoom = Phaser.Math.Clamp(zoom, this.config.minZoom, this.config.maxZoom);
    if (!smooth) {
      this.currentZoom = this.targetZoom;
      this.camera.setZoom(this.currentZoom);
    }
  }

  zoomIn(amount: number = 0.2): void {
    this.setZoom(this.targetZoom + amount);
  }

  zoomOut(amount: number = 0.2): void {
    this.setZoom(this.targetZoom - amount);
  }

  resetZoom(): void {
    this.setZoom(this.config.zoom);
  }

  startCinematic(target: CameraTarget, duration: number = 2000): void {
    this.triggerCinematicEvent({ type: 'custom', target, duration });
  }

  endCinematicMode(): void {
    this.endCinematic();
  }

  flash(color: number = 0xffffff, duration: number = 250): void {
    this.camera.flash(duration, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
  }

  fadeOut(color: number = 0x000000, duration: number = 500): Promise<void> {
    return new Promise(resolve => {
      this.camera.fadeOut(duration, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
      this.camera.once('camerafadeoutcomplete', resolve);
    });
  }

  fadeIn(color: number = 0x000000, duration: number = 500): Promise<void> {
    return new Promise(resolve => {
      this.camera.fadeIn(duration, (color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff);
      this.camera.once('camerafadeincomplete', resolve);
    });
  }

  focusOn(x: number, y: number, duration: number = 1000, zoom?: number): Promise<void> {
    return new Promise(resolve => {
      const wasFollowing = (this.camera as unknown as { _follow?: unknown })._follow ? true : false;
      if (wasFollowing) this.camera.stopFollow();

      if (zoom) this.setZoom(zoom, true);

      this.camera.pan(x, y, duration, 'Sine.easeInOut', true, (_cam: unknown, progress: number) => {
        if (progress >= 1) {
          if (wasFollowing && this.target) {
            this.camera.startFollow(this.target, true, this.config.lerp.x, this.config.lerp.y);
          }
          if (zoom) this.resetZoom();
          resolve();
        }
      });
    });
  }

  setFollowLerp(x: number, y: number): void {
    this.config.lerp.x = x;
    this.config.lerp.y = y;
    if (this.target) {
      this.camera.startFollow(this.target, true, x, y);
    }
  }

  getWorldView(): Phaser.Geom.Rectangle {
    return this.camera.getBounds();
  }

  isVisible(x: number, y: number, margin: number = 50): boolean {
    const bounds = this.getWorldView();
    return x >= bounds.x - margin &&
      x <= bounds.x + bounds.width + margin &&
      y >= bounds.y - margin &&
      y <= bounds.y + bounds.height + margin;
  }

  getCurrentZoom(): number {
    return this.currentZoom;
  }

  getTargetZoom(): number {
    return this.targetZoom;
  }

  isCinematicMode(): boolean {
    return this.cinematicMode;
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  destroy(): void {
    this.camera.stopFollow();
  }
}