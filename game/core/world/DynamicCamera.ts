import Phaser from 'phaser';

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

export class DynamicCamera {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private target: CameraTarget | null = null;
  private config: CameraConfig;
  
  // Camera state
  private currentZoom = 1.5;
  private targetZoom = 1.5;
  private shakeTime = 0;
  private shakeOffset = { x: 0, y: 0 };
  private isShaking = false;
  
  // Cinematic
  private cinematicMode = false;
  private cinematicTarget: CameraTarget | null = null;
  private cinematicDuration = 0;
  private cinematicTimer = 0;
  
  // Look-ahead
  private lastTargetPos = { x: 0, y: 0 };
  private velocity = { x: 0, y: 0 };
  
  // Smoothing
  private positionLerp = 0.1;
  private zoomLerp = 0.08;

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
      lookAhead: { x: 80, y: 60 },
      bounds: new Phaser.Geom.Rectangle(0, 0, 5000, 4000),
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

    // Calculate velocity for look-ahead
    if (playerVelocity) {
      this.velocity.x = Phaser.Math.Linear(this.velocity.x, playerVelocity.x, 0.15);
      this.velocity.y = Phaser.Math.Linear(this.velocity.y, playerVelocity.y, 0.15);
    }

    // Smooth zoom
    this.currentZoom = Phaser.Math.Linear(this.currentZoom, this.targetZoom, this.zoomLerp);
    this.camera.setZoom(this.currentZoom);

    // Apply look-ahead offset based on velocity
    if (this.target && (Math.abs(this.velocity.x) > 10 || Math.abs(this.velocity.y) > 10)) {
      const lookAheadX = Math.sign(this.velocity.x) * Math.min(Math.abs(this.velocity.x) * 0.3, this.config.lookAhead.x);
      const lookAheadY = Math.sign(this.velocity.y) * Math.min(Math.abs(this.velocity.y) * 0.3, this.config.lookAhead.y);
      
      const centerX = this.target.x + lookAheadX;
      const centerY = this.target.y + lookAheadY;
      
      // Smoothly move camera center
      this.camera.centerOn(centerX, centerY);
    }

    // Handle screen shake
    if (this.isShaking) {
      this.shakeTime -= delta;
      if (this.shakeTime <= 0) {
        this.isShaking = false;
        this.shakeOffset = { x: 0, y: 0 };
        this.camera.setPosition(0, 0);
      } else {
        const progress = 1 - this.shakeTime / this.config.shakeDuration;
        const intensity = this.config.shakeIntensity * (1 - progress);
        this.shakeOffset.x = (Math.random() - 0.5) * intensity;
        this.shakeOffset.y = (Math.random() - 0.5) * intensity;
        this.camera.setPosition(this.shakeOffset.x, this.shakeOffset.y);
      }
    }

    // Cinematic mode
    if (this.cinematicMode && this.cinematicTarget) {
      this.cinematicTimer -= delta;
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

    this.lastTargetPos = { x: this.target.x, y: this.target.y };
  }

  // Screen shake
  shake(intensity: number = 10, duration: number = 300): void {
    this.config.shakeIntensity = intensity;
    this.config.shakeDuration = duration;
    this.shakeTime = duration;
    this.isShaking = true;
  }

  // Zoom control
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

  // Cinematic camera
  startCinematic(target: CameraTarget, duration: number = 2000): void {
    this.cinematicMode = true;
    this.cinematicTarget = target;
    this.cinematicDuration = duration;
    this.cinematicTimer = duration;
    this.camera.stopFollow();
  }

  endCinematic(): void {
    this.cinematicMode = false;
    this.cinematicTarget = null;
    if (this.target) {
      this.camera.startFollow(this.target, true, this.config.lerp.x, this.config.lerp.y);
    }
  }

  // Camera effects
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

  // Focus on point temporarily
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

  // Follow with custom lerp
  setFollowLerp(x: number, y: number): void {
    this.config.lerp.x = x;
    this.config.lerp.y = y;
    if (this.target) {
      this.camera.startFollow(this.target, true, x, y);
    }
  }

  // Get camera world bounds
  getWorldView(): Phaser.Geom.Rectangle {
    return this.camera.getBounds();
  }

  // Check if point is visible
  isVisible(x: number, y: number, margin: number = 50): boolean {
    const bounds = this.getWorldView();
    return x >= bounds.x - margin && 
           x <= bounds.x + bounds.width + margin &&
           y >= bounds.y - margin && 
           y <= bounds.y + bounds.height + margin;
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  destroy(): void {
    this.camera.stopFollow();
  }
}