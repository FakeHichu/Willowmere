import Phaser from 'phaser';
import type { CharacterCustomization, PlayerState, Direction, Vector2, NetworkPlayer } from '@shared/types';
import { WORLD_BOUNDS, PLAYER_SPEED } from '../GameConfig';
import { getGameTime } from '@backend/time/clock';
import {
  WorldRenderer,
  RegionManager,
  WorldCollision,
  WorldInteractionManager,
  Minimap,
  WorldMapUI,
  AtmosphereManager,
  AudioManager,
  DynamicCamera,
  WorldChunkManager,
  WorldStreamer,
  LandmarkManager,
  WorldObjectManager,
  EnvironmentManager,
  WorldEventManager,
} from '../world';
import { CharacterRenderer } from '../characters/CharacterRenderer';
import { NPCManager } from '../npc/NPCManager';
import { ProgressionSystem } from '../world/ProgressionSystem';
import { overworldData } from '@data/world/worldMap';

interface PlayerSprite extends Phaser.GameObjects.Container {
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
  private emitter?: Phaser.Events.EventEmitter;

  private predictedPosition: Vector2 = { x: 0, y: 0 };
  private lastServerPosition: Vector2 = { x: 0, y: 0 };
  private movementBuffer: Array<{ position: Vector2; direction: Direction; state: PlayerState; timestamp: number }> = [];

  // Managers
  private worldRenderer!: WorldRenderer;
  private regionManager!: RegionManager;
  private worldCollision!: WorldCollision;
  private interactionManager!: WorldInteractionManager;
  private minimap!: Minimap;
  private worldMapUI!: WorldMapUI;
  private dynamicCamera!: DynamicCamera;
  private atmosphereManager!: AtmosphereManager;
  private audioManager!: AudioManager;
  private chunkManager!: WorldChunkManager;
  private worldStreamer!: WorldStreamer;
  private landmarkManager!: LandmarkManager;
  private objectManager!: WorldObjectManager;
  private environmentManager!: EnvironmentManager;
  private eventManager!: WorldEventManager;
  private npcManager!: NPCManager;
  private characterRenderer!: CharacterRenderer;
  private progressionSystem!: ProgressionSystem;
  private lastRegionId = 'village';

  private hudElements!: {
    playerPanel: Phaser.GameObjects.Container;
    clockPanel: Phaser.GameObjects.Container;
    coordPanel: Phaser.GameObjects.Container;
    playerNameText: Phaser.GameObjects.Text;
    clockText: Phaser.GameObjects.Text;
    regionText: Phaser.GameObjects.Text;
    coordText: Phaser.GameObjects.Text;
  };

  // Movement controls
  private sprintKey!: Phaser.Input.Keyboard.Key;
  private dodgeKey!: Phaser.Input.Keyboard.Key;
  private isSprinting = false;
  private isDodging = false;
  private dodgeCooldown = 0;

  constructor() {
    super({ key: 'VillageScene' });
    this.playerCustomization = {} as CharacterCustomization;
  }

  init(data: { customization: CharacterCustomization; emitter?: Phaser.Events.EventEmitter; playerId?: string; username?: string }) {
    this.playerCustomization = data.customization || this.game.registry.get('customization') || {} as CharacterCustomization;
    
    if (!this.playerCustomization.skinTone) {
      this.scene.start('CharacterCreationScene');
      return;
    }
    
    this.emitter = data.emitter || this.game.registry.get('emitter');
  }

  async create() {
    this.physics.world.setBounds(WORLD_BOUNDS.x, WORLD_BOUNDS.y, WORLD_BOUNDS.width, WORLD_BOUNDS.height);

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

    this.audioManager = new AudioManager(this);
    this.audioManager.create();

    // Initialize Open World Managers
    this.chunkManager = new WorldChunkManager();
    this.chunkManager.create();

    this.worldStreamer = new WorldStreamer(this);
    this.worldStreamer.create();

    this.landmarkManager = new LandmarkManager(this, this.emitter!);
    this.landmarkManager.create();

    this.objectManager = new WorldObjectManager(this);
    this.objectManager.create();

    this.environmentManager = new EnvironmentManager(this);

    this.eventManager = new WorldEventManager(this, this.emitter!);
    this.eventManager.create();

    this.npcManager = new NPCManager(this);
    this.npcManager.create();

    this.progressionSystem = new ProgressionSystem(this);

    this.createPlayer();
    this.setupCamera();
    this.setupControls();
    this.createUI();
    this.setupNetworkListeners();
    this.syncDiscoveredState();
  }

  private syncDiscoveredState(): void {
    const discoveredRegions = this.regionManager.getDiscoveredRegions();
    this.minimap.setDiscoveredRegions(discoveredRegions);
    this.worldMapUI.setDiscoveredRegions(discoveredRegions);
  }

  private createPlayer() {
    const spawnPoint = overworldData.defaultSpawnPoint;

    this.player = this.add.container(spawnPoint.x, spawnPoint.y) as PlayerSprite;

    this.predictedPosition = { ...spawnPoint };
    this.lastServerPosition = { ...spawnPoint };

    this.characterRenderer = new CharacterRenderer(
      this,
      spawnPoint.x,
      spawnPoint.y,
      this.playerCustomization,
      'You'
    );

    this.physics.add.existing(this.player);
    this.player.body.setSize(24, 32);
    this.player.body.setOffset(-12, -16);
    this.player.body.setCollideWorldBounds(true);
  }

  private setupCamera() {
    this.dynamicCamera = new DynamicCamera(this, {
      lerp: { x: 0.08, y: 0.08 },
      deadzone: new Phaser.Geom.Rectangle(-40, -30, 80, 60),
      zoom: 1.5,
      minZoom: 0.9,
      maxZoom: 2.5,
      lookAhead: { x: 100, y: 80 },
      bounds: new Phaser.Geom.Rectangle(WORLD_BOUNDS.x, WORLD_BOUNDS.y, WORLD_BOUNDS.width, WORLD_BOUNDS.height),
    });
    this.dynamicCamera.setTarget(this.player);
  }

  private setupControls() {
    if (!this.input.keyboard) return;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasdKeys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.interactionKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.sprintKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.dodgeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.interactionKey.on('down', () => {
      this.interactionManager.triggerInteraction({ x: this.player.x, y: this.player.y });
    });

    const mapKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    mapKey.on('down', () => {
      this.worldMapUI.toggle();
    });
  }

  private createUI() {
    const screenWidth = this.cameras.main.width;

    const playerPanel = this.add.container(20, 20);
    playerPanel.setScrollFactor(0);
    playerPanel.setDepth(3000);

    const bg = this.add.rectangle(0, 0, 160, 40, 0x000000, 0.6);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(1, 0xffffff, 0.2);

    const nameText = this.add.text(10, 10, 'Willowmere Explorer', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '12px',
      color: '#ffffff',
    });

    playerPanel.add([bg, nameText]);

    const clockPanel = this.add.container(screenWidth - 220, 20);
    clockPanel.setScrollFactor(0);
    clockPanel.setDepth(3000);

    const clockBg = this.add.rectangle(0, 0, 200, 50, 0x000000, 0.6);
    clockBg.setOrigin(0, 0);
    clockBg.setStrokeStyle(1, 0xffffff, 0.2);

    const clockText = this.add.text(10, 8, 'Day 1, 8:00 AM', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '12px',
      color: '#ffd700',
    });

    const regionText = this.add.text(10, 26, 'Willowmere Village', {
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: '11px',
      color: '#81c784',
    });

    clockPanel.add([clockBg, clockText, regionText]);

    const coordPanel = this.add.container(20, this.cameras.main.height - 40);
    coordPanel.setScrollFactor(0);
    coordPanel.setDepth(3000);

    const coordBg = this.add.rectangle(0, 0, 180, 24, 0x000000, 0.6);
    coordBg.setOrigin(0, 0);

    const coordText = this.add.text(10, 5, 'X: 3000  Y: 2300', {
      fontFamily: 'Consolas, monospace',
      fontSize: '11px',
      color: '#aaaaaa',
    });

    coordPanel.add([coordBg, coordText]);

    this.hudElements = {
      playerPanel,
      clockPanel,
      coordPanel,
      playerNameText: nameText,
      clockText,
      regionText,
      coordText,
    };
  }

  private setupNetworkListeners() {
    if (!this.emitter) return;

    this.emitter.on('player_move', (data: { id: string; position: Vector2; direction: Direction; state: PlayerState }) => {
      if (data.id === this.game.registry.get('playerId')) {
        this.reconcilePosition(data.position);
      } else {
        this.updateOtherPlayer(data);
      }
    });

    this.emitter.on('player_join', (data: NetworkPlayer) => {
      this.addOtherPlayer(data);
    });

    this.emitter.on('player_leave', (data: { id: string }) => {
      this.removeOtherPlayer(data.id);
    });
  }

  private reconcilePosition(serverPos: Vector2) {
    this.lastServerPosition = { ...serverPos };
    const dx = serverPos.x - this.player.x;
    const dy = serverPos.y - this.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 50) {
      this.player.setPosition(serverPos.x, serverPos.y);
      this.characterRenderer.setPosition(serverPos.x, serverPos.y);
      this.predictedPosition = { ...serverPos };
    }
  }

  private updateOtherPlayer(data: { id: string; position: Vector2; direction: Direction; state: PlayerState }) {
    if (!data.id) {
      console.warn('updateOtherPlayer received data without id:', data);
      return;
    }
    let player = this.otherPlayers.get(data.id);
    if (!player) {
      player = {
        id: data.id,
        username: `Player_${data.id.substring(0, 4)}`,
        customization: {} as CharacterCustomization,
        position: data.position,
        targetPosition: data.position,
        renderPosition: { ...data.position },
        direction: data.direction,
        state: data.state,
        lastUpdate: Date.now(),
        isOnline: true,
      };
      this.otherPlayers.set(data.id, player);
      this.createOtherPlayerSprite(player);
    } else {
      player.targetPosition = data.position;
      player.direction = data.direction;
      player.state = data.state;
      player.lastUpdate = Date.now();
    }
  }

  private createOtherPlayerSprite(player: InterpolatedPlayer) {
    const container = this.add.container(player.position.x, player.position.y);
    const body = this.add.rectangle(0, 0, 24, 32, 0x2196f3);
    const text = this.add.text(0, -28, player.username, { fontSize: '11px', color: '#ffffff' }).setOrigin(0.5);
    container.add([body, text]);
    player.sprite = container;
  }

  private addOtherPlayer(data: NetworkPlayer) {
    if (data.id === this.game.registry.get('playerId')) return;
    this.updateOtherPlayer({ id: data.id, position: data.position, direction: data.direction, state: data.state });
  }

  private removeOtherPlayer(id: string) {
    const player = this.otherPlayers.get(id);
    if (player && player.sprite) {
      player.sprite.destroy();
    }
    this.otherPlayers.delete(id);
  }

  update(time: number, delta: number) {
    if (!this.player || !this.player.body) return;

    this.interpolateOtherPlayers();
    this.updateHUD();

    if (this.playerState === 'sitting') {
      this.handleSitting();
      return;
    }

    const playerPos = { x: this.player.x, y: this.player.y };

    this.handleMovement();
    this.characterRenderer.update(time, delta, this.playerState, this.direction);
    this.characterRenderer.setPosition(this.player.x, this.player.y);

    this.regionManager.update(playerPos);
    this.worldCollision.update(playerPos);
    this.interactionManager.update(playerPos);
    this.minimap.update(playerPos, this.direction);
    this.worldMapUI.update(playerPos);
    this.audioManager.update(this.game.loop.delta);

    // Open World Managers Update
    const gameTime = getGameTime();
    const formattedHour = gameTime.hour < 10 ? `0${gameTime.hour}` : `${gameTime.hour}`;
    const minuteStr = gameTime.minute < 10 ? `0${gameTime.minute}` : `${gameTime.minute}`;
    const timeStr = `${formattedHour}:${minuteStr}`;
    const currentTimeMinutes = gameTime.hour * 60 + gameTime.minute;

    this.environmentManager.update(time, delta, playerPos, timeStr);
    this.landmarkManager.updatePlayerPosition(playerPos);
    this.objectManager.updateCulling(playerPos);

    // Feed current game time to the event manager
    this.eventManager.setCurrentGameTime(currentTimeMinutes);
    this.eventManager.update(playerPos);

    this.npcManager.update(time, delta, timeStr, this.environmentManager.getCurrentWeather(), playerPos);

    // Emit region changes for event manager hooks
    const currentRegion = this.regionManager.getCurrentRegion();
    if (currentRegion && currentRegion.id !== this.lastRegionId) {
      this.lastRegionId = currentRegion.id;
      if (this.emitter) this.emitter.emit('region_changed', currentRegion.id);
    }
  }

  private updateHUD(): void {
    if (!this.hudElements) return;

    const gameTime = getGameTime();
    const formattedHour = gameTime.hour % 12 === 0 ? 12 : gameTime.hour % 12;
    const ampm = gameTime.hour >= 12 ? 'PM' : 'AM';
    const minuteStr = gameTime.minute < 10 ? `0${gameTime.minute}` : `${gameTime.minute}`;
    const timeStr = `Day ${gameTime.day}, ${formattedHour}:${minuteStr} ${ampm}`;
    
    this.hudElements.clockText.setText(timeStr);
    
    const currentRegion = this.regionManager.getCurrentRegion();
    if (currentRegion) {
      this.hudElements.regionText.setText(currentRegion.displayName);
    }

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
    const drag = 1400;
    const dodgeCooldownMs = 800;

    if (this.dodgeCooldown > 0) {
      this.dodgeCooldown -= this.game.loop.delta;
    }

    let inputX = 0;
    let inputY = 0;

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

    if (inputX !== 0 && inputY !== 0) {
      const len = Math.sqrt(inputX * inputX + inputY * inputY);
      inputX /= len;
      inputY /= len;
    }

    const isDodgePressed = Phaser.Input.Keyboard.JustDown(this.dodgeKey);
    const canDodge = this.dodgeCooldown <= 0 && (inputX !== 0 || inputY !== 0) && !this.isDodging;

    if (isDodgePressed && canDodge) {
      this.performDodge(inputX, inputY, dodgeSpeed, dodgeCooldownMs);
      return;
    }

    this.isSprinting = this.sprintKey.isDown && (inputX !== 0 || inputY !== 0);
    const currentSpeed = this.isSprinting ? sprintSpeed : baseSpeed;

    if (this.isDodging) {
      this.dodgeCooldown -= this.game.loop.delta;
      if (this.dodgeCooldown <= 0) {
        this.isDodging = false;
        this.playerState = 'walking';
      }
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    
    if (inputX !== 0 || inputY !== 0) {
      const targetVX = inputX * currentSpeed;
      const targetVY = inputY * currentSpeed;
      
      body.setAcceleration(targetVX * 4, targetVY * 4);
      body.setDrag(drag, drag);
      body.setMaxVelocity(currentSpeed, currentSpeed);
    } else {
      body.setAcceleration(0, 0);
      body.setDrag(drag * 1.5, drag * 1.5);
    }

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

    this.predictedPosition = { x: this.player.x, y: this.player.y };

    const isMoving = Math.abs(body.velocity.x) > 10 || Math.abs(body.velocity.y) > 10;
    if (this.isDodging) {
      this.playerState = 'dodging';
    } else if (isMoving) {
      this.playerState = this.isSprinting ? 'sprinting' : 'walking';
    } else {
      this.playerState = 'idle';
    }

    this.dynamicCamera.update(this.game.loop.delta, { x: body.velocity.x, y: body.velocity.y }, currentSpeed);

    if (isMoving || this.playerState === 'idle') {
      this.sendMovementInput();
    }
  }

  private performDodge(dirX: number, dirY: number, dodgeSpeed: number, cooldownMs: number) {
    this.isDodging = true;
    this.dodgeCooldown = cooldownMs;
    this.playerState = 'dodging';

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(dirX * dodgeSpeed, dirY * dodgeSpeed);
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
    if (this.movementBuffer.length > 20) {
      this.movementBuffer.shift();
    }

    this.emitter.emit('player_move', inputData);
  }

  private handleSitting() {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    this.playerState = 'sitting';

    if (this.cursors.left.isDown || this.cursors.right.isDown || 
        this.cursors.up.isDown || this.cursors.down.isDown ||
        this.wasdKeys.W.isDown || this.wasdKeys.A.isDown ||
        this.wasdKeys.S.isDown || this.wasdKeys.D.isDown) {
      this.playerState = 'idle';
    }
  }
}