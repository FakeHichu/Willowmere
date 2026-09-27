import Phaser from 'phaser';
import type { CharacterCustomization, PlayerState, Direction, Vector2, NetworkPlayer } from '@shared/types';
import { WORLD_BOUNDS, PLAYER_SPEED, INTERACTION_RADIUS } from '../GameConfig';
import { getGameTime } from '@backend/time/clock';
import { npcs, getNpcsAtPosition } from '@data/npcs';
import {
  WorldRenderer,
  RegionManager,
  WorldCollision,
  WorldInteractionManager,
  Minimap,
  WorldMapUI,
  RegionChangeEvent,
  AtmosphereManager,
  AudioManager,
} from '../world';
import { DynamicCamera } from '../world/DynamicCamera';

interface PlayerSprite extends Phaser.GameObjects.Container {
  body: Phaser.Physics.Arcade.Body;
}

interface NPCSprite extends Phaser.GameObjects.Container {
  npcId: string;
  body: Phaser.Physics.Arcade.Body;
}

interface InterpolatedPlayer extends NetworkPlayer {
  sprite?: Phaser.GameObjects.Container;
  renderPosition: Vector2;
  targetPosition: Vector2;
  lastUpdate: number;
  isOnline: boolean;
}

export class VillageScene extends Phaser.Scene {
  private player!: PlayerSprite;
  private playerState: PlayerState = 'idle';
  private direction: Direction = 'down';
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private interactionKey!: Phaser.Input.Keyboard.Key;
  private playerCustomization: CharacterCustomization;
  private otherPlayers: Map<string, InterpolatedPlayer> = new Map();
  private npcSprites: NPCSprite[] = [];
  private emitter?: Phaser.Events.EventEmitter;

  

  private predictedPosition: Vector2 = { x: 0, y: 0 };
  private lastServerPosition: Vector2 = { x: 0, y: 0 };
  private movementBuffer: Array<{ position: Vector2; direction: Direction; state: PlayerState; timestamp: number }> = [];

  private worldRenderer!: WorldRenderer;
  private regionManager!: RegionManager;
  private worldCollision!: WorldCollision;
  private interactionManager!: WorldInteractionManager;
  private minimap!: Minimap;
  private worldMapUI!: WorldMapUI;
  private dynamicCamera!: DynamicCamera;
  private atmosphereManager!: AtmosphereManager;
  private audioManager!: AudioManager;
  private hudElements!: {
    playerPanel: Phaser.GameObjects.Container;
    clockPanel: Phaser.GameObjects.Container;
    coordPanel: Phaser.GameObjects.Container;
    playerNameText: Phaser.GameObjects.Text;
    clockText: Phaser.GameObjects.Text;
    regionText: Phaser.GameObjects.Text;
    coordText: Phaser.GameObjects.Text;
  };

  // Advanced movement
  private sprintKey!: Phaser.Input.Keyboard.Key;
  private dodgeKey!: Phaser.Input.Keyboard.Key;
  private isSprinting = false;
  private isDodging = false;
  private dodgeCooldown = 0;
  private lastDodgeTime = 0;
  private dodgeDirection: Direction = 'down';

  constructor() {
    super({ key: 'VillageScene' });
    this.playerCustomization = {} as CharacterCustomization;
  }

  init(data: { customization: CharacterCustomization; emitter?: Phaser.Events.EventEmitter; playerId?: string; username?: string }) {
    this.playerCustomization = data.customization || this.game.registry.get('customization') || {} as CharacterCustomization;
    
    // Redirect to character creation if no customization data
    if (!this.playerCustomization.skinTone) {
      this.scene.start('CharacterCreationScene');
      return;
    }
    
    // Get emitter from data or from game registry (set in preBoot)
    this.emitter = data.emitter || this.game.registry.get('emitter');
  }

  async create() {
    this.physics.world.setBounds(0, 0, WORLD_BOUNDS.width, WORLD_BOUNDS.height);

    this.worldRenderer = new WorldRenderer(this);
    await this.worldRenderer.create();

    this.regionManager = new RegionManager(this, this.emitter!);
    this.regionManager.create();

    this.worldCollision = new WorldCollision(this);
    this.worldCollision.create();

    this.interactionManager = new WorldInteractionManager(this, this.emitter!);
    this.interactionManager.create();

    this.minimap = new Minimap(this);
    this.minimap.create();

    this.worldMapUI = new WorldMapUI(this);
    this.worldMapUI.create();

    this.atmosphereManager = new AtmosphereManager(this);
    this.atmosphereManager.create();

    this.createNPCs();
this.createPlayer();
    this.setupCamera();
    this.setupControls();
    this.createUI();
    // AtmosphereManager handles lighting/day-night now
    // this.startDayNightVisuals();
    this.audioManager = new AudioManager(this);
    this.audioManager.create();
    this.setupNetworkListeners();
    this.syncDiscoveredState();
  }

  private syncDiscoveredState(): void {
    const discoveredRegions = this.regionManager.getDiscoveredRegions();
    this.minimap.setDiscoveredRegions(discoveredRegions);
    this.worldMapUI.setDiscoveredRegions(discoveredRegions);
  }

  private createNPCs() {
    npcs.forEach(npcData => {
      const container = this.add.container(npcData.position.x, npcData.position.y) as NPCSprite;
      container.npcId = npcData.id;

      const colors: Record<string, number> = {
        'npc_arthur': 0x4caf50,
        'npc_elara': 0xffc107,
        'npc_bram': 0xff5722,
        'npc_lily': 0x9c27b0,
        'npc_finn': 0x2196f3,
        'npc_mira': 0x9c27b0,
        'npc_tom': 0x795548,
        'npc_nora': 0x00bcd4,
        'npc_walter': 0x8d6e63,
        'npc_sasha': 0xff9800,
      };

      const bodyColor = colors[npcData.id] || 0x9e9e9e;

      const body = this.add.rectangle(0, 0, 24, 32, bodyColor);
      const head = this.add.circle(0, -20, 12, 0xffd7ba);
      const nameText = this.add.text(0, -40, npcData.name, {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 4, y: 2 }
      }).setOrigin(0.5);

      container.add([body, head, nameText]);

      this.physics.add.existing(container);
      container.body.setSize(24, 32);
      container.body.setOffset(-12, -16);
      (container.body as Phaser.Physics.Arcade.Body).setImmovable(true);

      this.npcSprites.push(container);

      this.tweens.add({
        targets: container,
        y: npcData.position.y - 2,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  private createPlayer() {
    const spawnPoint = { x: 2000, y: 1750 };

    this.player = this.add.container(spawnPoint.x, spawnPoint.y) as PlayerSprite;

    this.predictedPosition = { ...spawnPoint };
    this.lastServerPosition = { ...spawnPoint };

    this.updatePlayerAppearance();

    this.physics.add.existing(this.player);
    this.player.body.setSize(24, 32);
    this.player.body.setOffset(-12, -16);
    this.player.body.setCollideWorldBounds(true);

    this.npcSprites.forEach(npc => {
      this.physics.add.collider(this.player, npc);
    });
  }

  private updatePlayerAppearance() {
    this.player.removeAll(true);

    const skinTones: Record<string, number> = {
      'skin_01': 0xffe4d0, 'skin_02': 0xf5d0b5, 'skin_03': 0xe8c4a2,
      'skin_04': 0xd4a574, 'skin_05': 0xc4956a, 'skin_06': 0xa67c52,
      'skin_07': 0x8b5a2b, 'skin_08': 0x6b4423, 'skin_09': 0x4a3021,
      'skin_10': 0x3d261a
    };

    const skinColor = skinTones[this.playerCustomization.skinTone] || 0xffd7ba;
    const topColor = Phaser.Display.Color.HexStringToColor(this.playerCustomization.topColor || '#87CEEB').color;
    const bottomColor = Phaser.Display.Color.HexStringToColor(this.playerCustomization.bottomColor || '#8B4513').color;
    const hairColor = Phaser.Display.Color.HexStringToColor(this.playerCustomization.hairColor || '#6B4226').color;

    const legs = this.add.rectangle(0, 12, 20, 16, bottomColor);
    const body = this.add.rectangle(0, 0, 24, 28, topColor);
    const head = this.add.circle(0, -18, 10, skinColor);
    const hair = this.add.rectangle(0, -22, 22, 10, hairColor);
    const eyes = this.add.rectangle(0, -18, 8, 2, 0x000000);

    this.player.add([legs, body, head, hair, eyes]);
  }

  private setupCamera() {
    // Use dynamic camera system
    this.dynamicCamera = new DynamicCamera(this, {
      lerp: { x: 0.08, y: 0.08 },
      deadzone: new Phaser.Geom.Rectangle(-40, -30, 80, 60),
      zoom: 1.5,
      minZoom: 0.9,
      maxZoom: 2.5,
      lookAhead: { x: 100, y: 80 },
      bounds: new Phaser.Geom.Rectangle(0, 0, WORLD_BOUNDS.width, WORLD_BOUNDS.height),
    });
    this.dynamicCamera.setTarget(this.player);
  }

  private setupControls() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      };
      this.interactionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.sprintKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.dodgeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
  }

  private createUI() {
    const hud = this.add.container(0, 0);
    hud.setScrollFactor(0);
    hud.setDepth(1000);

    // Top-left: Player info panel
    const playerPanel = this.createPlayerPanel();
    hud.add(playerPanel);

    // Top-center: Clock and region
    const clockPanel = this.createClockPanel();
    hud.add(clockPanel);

    // Top-right: Minimap toggle hint (minimap is always visible now)
    // Bottom-center: Coordinates and region info
    const coordPanel = this.createCoordPanel();
    hud.add(coordPanel);

    // Store references for updates
    this.hudElements = {
      playerPanel,
      clockPanel,
      coordPanel,
      playerNameText: playerPanel.getAt(2) as Phaser.GameObjects.Text,
      clockText: clockPanel.getAt(1) as Phaser.GameObjects.Text,
      regionText: clockPanel.getAt(2) as Phaser.GameObjects.Text,
      coordText: coordPanel.getAt(1) as Phaser.GameObjects.Text,
    };
  }

  private createPlayerPanel(): Phaser.GameObjects.Container {
    const panel = this.add.container(20, 20);
    panel.setScrollFactor(0);
    panel.setDepth(1000);

    // Panel background
    const bg = this.add.rectangle(0, 0, 200, 50, 0x1a1a2e, 0.9);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(2, 0x8d6e63, 0.8);
    bg.setInteractive();

    // Player avatar circle
    const avatar = this.add.circle(25, 25, 20, 0x8d6e63);
    avatar.setStrokeStyle(2, 0xffd700, 1);

    // Player name
    const nameText = this.add.text(55, 12, 'Traveler', {
      fontSize: '16px',
      color: '#ffd700',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0, 0.5);

    // Coins/currency
    const coinText = this.add.text(55, 34, '💰 0', {
      fontSize: '12px',
      color: '#ffd700',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0, 0.5);

    panel.add([bg, avatar, nameText, coinText]);

    // Hover effect
    bg.on('pointerover', () => bg.setFillStyle(0x2a2a3e, 0.95));
    bg.on('pointerout', () => bg.setFillStyle(0x1a1a2e, 0.9));

    return panel;
  }

  private createClockPanel(): Phaser.GameObjects.Container {
    const x = this.scale.width / 2;
    const panel = this.add.container(x, 20);
    panel.setScrollFactor(0);
    panel.setDepth(1000);

    const bg = this.add.rectangle(0, 0, 220, 40, 0x1a1a2e, 0.9);
    bg.setStrokeStyle(2, 0x8d6e63, 0.8);
    bg.setOrigin(0.5, 0);

    // Clock icon
    const clockIcon = this.add.text(-90, 0, '🕐', {
      fontSize: '18px',
    }).setOrigin(0.5);

    // Time text
    const timeText = this.add.text(-60, 0, 'Day 1, 08:00 AM', {
      fontSize: '14px',
      color: '#ffd700',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0, 0.5);

    // Region text
    const regionText = this.add.text(20, 0, 'Willowmere Village', {
      fontSize: '12px',
      color: '#aaaaaa',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0, 0.5);

    panel.add([bg, clockIcon, timeText, regionText]);
    return panel;
  }

  private createCoordPanel(): Phaser.GameObjects.Container {
    const x = this.scale.width / 2;
    const y = this.scale.height - 30;
    const panel = this.add.container(x, y);
    panel.setScrollFactor(0);
    panel.setDepth(1000);

    const bg = this.add.rectangle(0, 0, 200, 28, 0x000000, 0.7);
    bg.setStrokeStyle(1, 0x8d6e63, 0.5);
    bg.setOrigin(0.5, 1);

    const coordText = this.add.text(0, 0, 'X: 2000  Y: 1750', {
      fontSize: '11px',
      color: '#aaaaaa',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5);

    panel.add([bg, coordText]);
    return panel;
  }

  private setupNetworkListeners() {
    if (!this.emitter) return;

    this.emitter.on('player_join', (data: NetworkPlayer) => {
      this.addOtherPlayer(data);
    });

    this.emitter.on('player_leave', (playerId: string) => {
      this.removeOtherPlayer(playerId);
    });

    this.emitter.on('player_offline', (playerId: string) => {
      this.setPlayerOffline(playerId);
    });

    this.emitter.on('player_move', (data: Partial<NetworkPlayer> & { id: string }) => {
      this.updateOtherPlayer(data);
    });

    this.emitter.on('player_position_correction', (data: { position: Vector2; direction: Direction; state: PlayerState }) => {
      this.reconcilePosition(data);
    });

    this.emitter.on('enter_building', (data: { buildingId: string; interiorName: string; spawnPoint: { x: number; y: number } }) => {
      this.scene.start('BuildingInteriorScene', {
        customization: this.playerCustomization,
        buildingId: data.buildingId,
        emitter: this.emitter
      });
    });

    this.emitter.on('map_change', (data: { mapId: string; spawnPoint: { x: number; y: number } }) => {
      this.scene.restart({
        customization: this.playerCustomization,
        emitter: this.emitter
      });
    });

    this.emitter.on('region_entered', (data: RegionChangeEvent) => {
      if (data.currentRegion) {
        this.minimap.discoverRegion(data.currentRegion.id);
        this.worldMapUI.discoverRegion(data.currentRegion.id);
        this.atmosphereManager.setRegion(data.currentRegion.id);
      }
    });

    this.emitter.on('region_discovered', (data: { regionId: string }) => {
      this.minimap.discoverRegion(data.regionId);
      this.worldMapUI.discoverRegion(data.regionId);
    });

    this.emitter.on('request_region_travel', (data: { fromRegion: string; toRegion: string; entranceId: string }) => {
      this.handleRegionTravel(data.fromRegion, data.toRegion, data.entranceId);
    });
  }

  private handleRegionTravel(fromRegion: string, toRegion: string, entranceId: string) {
    const entrance = this.regionManager.getEntrancePosition(entranceId);
    if (entrance) {
      this.player.setPosition(entrance.x, entrance.y);
      this.predictedPosition = { ...entrance };
      this.lastServerPosition = { ...entrance };
      this.regionManager.forceRegion(toRegion);
    }
  }

  private reconcilePosition(data: { position: Vector2; direction: Direction; state: PlayerState }) {
    this.lastServerPosition = data.position;
    
    this.tweens.add({
      targets: this.player,
      x: data.position.x,
      y: data.position.y,
      duration: 50,
      ease: 'Linear',
      onComplete: () => {
        this.predictedPosition = { ...data.position };
      }
    });

    this.direction = data.direction;
    this.playerState = data.state;
  }

  private addOtherPlayer(player: NetworkPlayer) {
    if (this.otherPlayers.has(player.id)) return;

    const renderPos = { ...player.position };
    const interpolatedPlayer: InterpolatedPlayer = {
      ...player,
      renderPosition: renderPos,
      targetPosition: renderPos,
      lastUpdate: player.lastUpdate,
      isOnline: player.isOnline ?? true,
    };

    const container = this.add.container(player.position.x, player.position.y);

    const body = this.add.rectangle(0, 0, 24, 32, 0x4fc3f7);
    const head = this.add.circle(0, -20, 10, 0xffd7ba);
    const nameText = this.add.text(0, -35, player.username, {
      fontSize: '10px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 2, y: 1 }
    }).setOrigin(0.5);

    const offlineText = this.add.text(0, -50, '', {
      fontSize: '9px',
      color: '#ff9800',
      backgroundColor: '#000000aa',
      padding: { x: 2, y: 1 }
    }).setOrigin(0.5).setVisible(false);

    container.add([body, head, nameText, offlineText]);

    interpolatedPlayer.sprite = container;
    this.otherPlayers.set(player.id, interpolatedPlayer);
  }

  private removeOtherPlayer(playerId: string) {
    const player = this.otherPlayers.get(playerId);
    if (player?.sprite) {
      player.sprite.destroy();
    }
    this.otherPlayers.delete(playerId);
  }

  private setPlayerOffline(playerId: string) {
    const player = this.otherPlayers.get(playerId);
    if (!player || !player.sprite) return;

    player.isOnline = false;
    const offlineText = player.sprite.getAt(3) as Phaser.GameObjects.Text;
    if (offlineText) {
      offlineText.setText('[OFFLINE]');
      offlineText.setVisible(true);
    }
    player.sprite.setAlpha(0.7);
  }

  private updateOtherPlayer(data: Partial<NetworkPlayer> & { id: string; isOnline?: boolean }) {
    const player = this.otherPlayers.get(data.id);
    if (!player || !player.sprite) return;

    if (data.position) {
      player.targetPosition = data.position;
      player.lastUpdate = data.lastUpdate || Date.now();
    }
    if (data.direction) {
      player.direction = data.direction;
    }
    if (data.state) {
      player.state = data.state;
    }
    if (data.isOnline !== undefined) {
      player.isOnline = data.isOnline;
      const offlineText = player.sprite?.getAt(3) as Phaser.GameObjects.Text;
      if (offlineText) {
        offlineText.setVisible(!data.isOnline);
      }
      player.sprite?.setAlpha(data.isOnline ? 1 : 0.7);
    }
  }

  update() {
    if (!this.player || !this.player.body) return;

    this.interpolateOtherPlayers();
    this.updateHUD();

    if (this.playerState === 'sitting') {
      this.handleSitting();
      return;
    }

    this.handleMovement();
    this.regionManager.update({ x: this.player.x, y: this.player.y });
    this.worldCollision.update({ x: this.player.x, y: this.player.y });
    this.interactionManager.update({ x: this.player.x, y: this.player.y });
    this.minimap.update({ x: this.player.x, y: this.player.y }, this.direction);
    this.worldMapUI.update({ x: this.player.x, y: this.player.y });
    this.audioManager.update(this.game.loop.delta);
  }

  private updateHUD(): void {
    if (!this.hudElements) return;

    // Update clock
    const gameTime = getGameTime();
    const formattedHour = gameTime.hour % 12 === 0 ? 12 : gameTime.hour % 12;
    const ampm = gameTime.hour >= 12 ? 'PM' : 'AM';
    const minuteStr = gameTime.minute < 10 ? `0${gameTime.minute}` : `${gameTime.minute}`;
    const timeStr = `Day ${gameTime.day}, ${formattedHour}:${minuteStr} ${ampm}`;
    
    this.hudElements.clockText.setText(timeStr);
    
    // Update region name
    const currentRegion = this.regionManager.getCurrentRegion();
    if (currentRegion) {
      this.hudElements.regionText.setText(currentRegion.displayName);
    }

    // Update coordinates
    this.hudElements.coordText.setText(`X: ${Math.round(this.player.x)}  Y: ${Math.round(this.player.y)}`);
  }

  private interpolateOtherPlayers() {
    this.otherPlayers.forEach((player) => {
      if (!player.sprite) return;

      const dx = player.targetPosition.x - player.renderPosition.x;
      const dy = player.targetPosition.y - player.renderPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 1) {
        const lerpFactor = 0.15;
        player.renderPosition.x += dx * lerpFactor;
        player.renderPosition.y += dy * lerpFactor;
        player.sprite.setPosition(player.renderPosition.x, player.renderPosition.y);
      } else {
        player.renderPosition = { ...player.targetPosition };
        player.sprite.setPosition(player.targetPosition.x, player.targetPosition.y);
      }
    });
  }

  private handleMovement() {
    const baseSpeed = PLAYER_SPEED;
    const sprintSpeed = PLAYER_SPEED * 1.7;
    const dodgeSpeed = PLAYER_SPEED * 3.5;
    const acceleration = 1000;
    const drag = 1400;
    const dodgeCooldownMs = 800;

    // Handle dodge cooldown
    if (this.dodgeCooldown > 0) {
      this.dodgeCooldown -= this.game.loop.delta;
    }

    let inputX = 0;
    let inputY = 0;

    // Determine input direction
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      inputX = -1;
      this.direction = 'left';
    } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      inputX = 1;
      this.direction = 'right';
    }

    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      inputY = -1;
      if (inputX === 0) this.direction = 'up';
    } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      inputY = 1;
      if (inputX === 0) this.direction = 'down';
    }

    // Normalize diagonal
    if (inputX !== 0 && inputY !== 0) {
      const len = Math.sqrt(inputX * inputX + inputY * inputY);
      inputX /= len;
      inputY /= len;
    }

    // Check for dodge roll (Space)
    const now = Date.now();
    const isDodgePressed = Phaser.Input.Keyboard.JustDown(this.dodgeKey);
    const canDodge = this.dodgeCooldown <= 0 && (inputX !== 0 || inputY !== 0) && !this.isDodging;

    if (isDodgePressed && canDodge) {
      this.performDodge(inputX, inputY, dodgeSpeed, dodgeCooldownMs);
      return; // Skip normal movement this frame
    }

    // Sprint handling (Shift)
    this.isSprinting = this.sprintKey.isDown && (inputX !== 0 || inputY !== 0);
    const currentSpeed = this.isSprinting ? sprintSpeed : baseSpeed;

    // Update dodge state
    if (this.isDodging) {
      this.dodgeCooldown -= this.game.loop.delta;
      if (this.dodgeCooldown <= 0) {
        this.isDodging = false;
        this.playerState = 'walking';
      }
    }

    // Apply acceleration/deceleration using physics body
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    
    if (inputX !== 0 || inputY !== 0) {
      // Accelerate towards target velocity
      const targetVX = inputX * currentSpeed;
      const targetVY = inputY * currentSpeed;
      
      body.setAcceleration(targetVX * 4, targetVY * 4);
      body.setDrag(drag, drag);
      body.setMaxVelocity(currentSpeed, currentSpeed);
    } else {
      // Decelerate to stop
      body.setAcceleration(0, 0);
      body.setDrag(drag * 1.5, drag * 1.5);
    }

    // Check collision after physics step
    const collisionResult = this.worldCollision.checkCollision({ 
      x: this.player.x, 
      y: this.player.y 
    });
    
    if (collisionResult.collides && collisionResult.correctedPosition) {
      const dx = collisionResult.correctedPosition.x - this.player.x;
      const dy = collisionResult.correctedPosition.y - this.player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0.5) {
        this.player.setPosition(
          this.player.x + dx * 0.3,
          this.player.y + dy * 0.3
        );
      } else {
        this.player.setPosition(collisionResult.correctedPosition.x, collisionResult.correctedPosition.y);
        body.setVelocity(0, 0);
      }
    }

    // Update predicted position for server reconciliation
    this.predictedPosition = { x: this.player.x, y: this.player.y };

    // Update player state
    const isMoving = Math.abs(body.velocity.x) > 10 || Math.abs(body.velocity.y) > 10;
    if (this.isDodging) {
      this.playerState = 'dodging';
    } else if (isMoving) {
      this.playerState = this.isSprinting ? 'sprinting' : 'walking';
    } else {
      this.playerState = 'idle';
    }

    // Update dynamic camera
    this.dynamicCamera.update(this.game.loop.delta, { x: body.velocity.x, y: body.velocity.y }, currentSpeed);

    // Send movement input to server (throttled)
    if (isMoving || this.playerState === 'idle') {
      this.sendMovementInput();
    }
  }

  private sendMovementInput() {
    if (!this.emitter) return;

    const now = Date.now();
    if (now - (this.movementBuffer[this.movementBuffer.length - 1]?.timestamp || 0) < 50) {
      return;
    }

    const inputData = {
      position: { x: this.player.x, y: this.player.y },
      direction: this.direction,
      state: this.playerState,
      timestamp: now,
    };

    this.movementBuffer.push(inputData);
    if (this.movementBuffer.length > 10) {
      this.movementBuffer.shift();
    }

    this.emitter.emit('player_move_input', inputData);
  }

  private performDodge(dirX: number, dirY: number, speed: number, cooldown: number): void {
    this.isDodging = true;
    this.dodgeCooldown = cooldown;
    this.lastDodgeTime = Date.now();
    this.dodgeDirection = this.direction;
    this.playerState = 'dodging';

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    
    // Instant velocity for dodge
    body.setVelocity(dirX * speed, dirY * speed);
    body.setAcceleration(0, 0);
    body.setDrag(800, 800); // Quick deceleration after dodge

    // Visual feedback - flash and screen shake
    this.dynamicCamera.shake(8, 150);
    this.cameras.main.flash(100, 255, 255, 255, true);

    // Dodge particles
    this.createDodgeParticles();

    // Invincibility frames during dodge (could be used for combat later)
    this.player.setAlpha(0.6);
    this.time.delayedCall(200, () => {
      this.player.setAlpha(1);
    });
  }

  private createDodgeParticles(): void {
    const emitter = this.add.particles(this.player.x, this.player.y, '__DEFAULT', {
      x: { min: -10, max: 10 },
      y: { min: -10, max: 10 },
      lifespan: 300,
      speed: { min: 50, max: 150 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.6, end: 0 },
      tint: 0xffffff,
      quantity: 8,
      blendMode: 'ADD',
      emitting: false,
    });
    emitter.explode(8, this.player.x, this.player.y);
    this.time.delayedCall(500, () => emitter.destroy());
  }

  private handleSitting() {
    if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
      this.standUp();
    }
  }

  private standUp() {
    this.playerState = 'idle';
    this.interactionManager.forceHidePrompt();
  }

  destroy() {
    this.worldRenderer.destroy();
    this.regionManager.destroy();
    this.worldCollision.destroy();
    this.interactionManager.destroy();
    this.minimap.destroy();
    this.worldMapUI.destroy();
    this.dynamicCamera?.destroy();
    this.atmosphereManager?.destroy();
    this.audioManager?.destroy();
  }
}