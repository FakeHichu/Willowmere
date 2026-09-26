import Phaser from 'phaser';
import type { CharacterCustomization, PlayerState, Direction, Vector2, NetworkPlayer } from '@shared/types';
import { MAPS, PLAYER_SPEED, INTERACTION_RADIUS } from '../GameConfig';
import { getBuildingInterior } from '@backend/buildings/buildingManager';
import { getObjectById } from '@data/world/objects';

interface PlayerSprite extends Phaser.GameObjects.Container {
  body: Phaser.Physics.Arcade.Body;
}

interface NPCSprite extends Phaser.GameObjects.Container {
  npcId: string;
  body: Phaser.Physics.Arcade.Body;
}

export class BuildingInteriorScene extends Phaser.Scene {
  private player!: PlayerSprite;
  private playerState: PlayerState = 'idle';
  private direction: Direction = 'down';
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private interactionKey!: Phaser.Input.Keyboard.Key;
  private playerCustomization: CharacterCustomization;
  private otherPlayers: Map<string, NetworkPlayer & { sprite?: Phaser.GameObjects.Container }> = new Map();
  private npcs: NPCSprite[] = [];
  private worldObjects: Phaser.GameObjects.GameObject[] = [];
  private interactionPrompt: Phaser.GameObjects.Container | null = null;
  private dialogueUI: Phaser.GameObjects.Container | null = null;
  private sitTarget: Phaser.GameObjects.GameObject | null = null;
  private emitter?: Phaser.Events.EventEmitter;
  private currentBuildingId: string;
  private exitDoorPosition: Vector2;

  constructor() {
    super({ key: 'BuildingInteriorScene' });
    this.playerCustomization = {} as CharacterCustomization;
    this.currentBuildingId = '';
    this.exitDoorPosition = { x: 200, y: 300 };
  }

  init(data: { customization: CharacterCustomization; buildingId: string; emitter?: Phaser.Events.EventEmitter }) {
    this.playerCustomization = data.customization || {};
    this.currentBuildingId = data.buildingId;
    this.emitter = data.emitter;

    const interior = getBuildingInterior(data.buildingId);
    if (interior) {
      this.exitDoorPosition = interior.exitSpawn;
    }
  }

  create() {
    const interior = getBuildingInterior(this.currentBuildingId);
    const bounds = interior ? { width: 400, height: 400 } : { width: 400, height: 400 };

    this.physics.world.setBounds(0, 0, bounds.width, bounds.height);

    this.createInterior(interior);
    this.createPlayer(interior?.entrySpawn || { x: 200, y: 300 });
    this.setupCamera(bounds);
    this.setupControls();
    this.createUI();

    if (this.emitter) {
      this.setupNetworkListeners();
    }
  }

  private createInterior(interior: { id: string; name: string; entrySpawn: Vector2; exitSpawn: Vector2 } | undefined) {
    const graphics = this.add.graphics();

    if (!interior) return;

    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(0, 0, 400, 400);

    graphics.fillStyle(0x5d4037, 1);
    graphics.fillRect(0, 0, 400, 20);
    graphics.fillRect(0, 380, 400, 20);
    graphics.fillRect(0, 0, 20, 400);
    graphics.fillRect(380, 0, 20, 400);

    graphics.fillStyle(0x795548, 1);
    graphics.fillRect(160, 10, 80, 20);

    graphics.fillStyle(0x000000, 0.5);
    graphics.fillRect(170, 10, 60, 20);

    this.add.text(200, 30, interior.name, {
      fontSize: '16px',
      color: '#f5f0e6',
      fontFamily: 'Georgia, serif'
    }).setOrigin(0.5).setDepth(10);

    const exitDoor = this.add.container(this.exitDoorPosition.x, this.exitDoorPosition.y);
    const frame = this.add.rectangle(0, 0, 36, 52, 0x5d4037);
    const door = this.add.rectangle(0, 0, 32, 48, 0x795548);
    const handle = this.add.circle(10, 5, 3, 0xffc107);
    exitDoor.add([frame, door, handle]);
    exitDoor.setData('objectId', `exit_${this.currentBuildingId}`);
    exitDoor.setData('objectType', 'exit_door');
    exitDoor.setData('interactions', [{ type: 'exit', label: 'Exit', key: 'E' }]);
    exitDoor.setData('properties', { building: this.currentBuildingId });

    const hitbox = this.add.rectangle(this.exitDoorPosition.x, this.exitDoorPosition.y, 36, 52, 0x000000, 0) as Phaser.GameObjects.Rectangle;
    this.physics.add.existing(hitbox, true);
    if (this.player) {
      this.physics.add.collider(this.player, hitbox);
    }
    this.worldObjects.push(exitDoor);
  }

  private createPlayer(spawnPoint: Vector2) {
    this.player = this.add.container(spawnPoint.x, spawnPoint.y) as PlayerSprite;
    this.updatePlayerAppearance();

    this.physics.add.existing(this.player);
    this.player.body.setSize(24, 32);
    this.player.body.setOffset(-12, -16);
    this.player.body.setCollideWorldBounds(true);

    this.npcs.forEach(npc => {
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

  private setupCamera(bounds: { width: number; height: number }) {
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, bounds.width, bounds.height);
    this.cameras.main.setZoom(2.0);
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
    }
  }

  private createUI() {
    const hud = this.add.container(0, 0);
    hud.setScrollFactor(0);
    hud.setDepth(1000);

    const nameBadge = this.add.rectangle(20, 20, 120, 30, 0x000000aa);
    const playerName = this.add.text(20, 20, 'Traveler', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    hud.add([nameBadge, playerName]);

    const exitHint = this.add.text(200, 380, '[E] Exit Building', {
      fontSize: '12px',
      color: '#f5f0e6',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setDepth(1000);
    hud.add(exitHint);
  }

  private setupNetworkListeners() {
    if (!this.emitter) return;

    this.emitter.on('player_join', (data: NetworkPlayer) => {
      this.addOtherPlayer(data);
    });

    this.emitter.on('player_leave', (playerId: string) => {
      this.removeOtherPlayer(playerId);
    });

    this.emitter.on('player_move', (data: Partial<NetworkPlayer> & { id: string }) => {
      this.updateOtherPlayer(data);
    });
  }

  private addOtherPlayer(player: NetworkPlayer) {
    if (this.otherPlayers.has(player.id)) return;

    const container = this.add.container(player.position.x, player.position.y);
    const body = this.add.rectangle(0, 0, 24, 32, 0x4fc3f7);
    const head = this.add.circle(0, -20, 10, 0xffd7ba);
    const nameText = this.add.text(0, -35, player.username, {
      fontSize: '10px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 2, y: 1 }
    }).setOrigin(0.5);

    container.add([body, head, nameText]);
    this.otherPlayers.set(player.id, { ...player, sprite: container });
  }

  private removeOtherPlayer(playerId: string) {
    const player = this.otherPlayers.get(playerId);
    if (player?.sprite) {
      player.sprite.destroy();
    }
    this.otherPlayers.delete(playerId);
  }

  private updateOtherPlayer(data: Partial<NetworkPlayer> & { id: string }) {
    const player = this.otherPlayers.get(data.id);
    if (!player || !player.sprite) return;

    if (data.position) {
      this.tweens.add({
        targets: player.sprite,
        x: data.position.x,
        y: data.position.y,
        duration: 100
      });
    }
  }

  update() {
    if (!this.player || !this.player.body) return;

    if (this.playerState === 'sitting') {
      this.handleSitting();
      return;
    }

    this.handleMovement();
    this.checkInteractions();
    this.checkExitBuilding();
  }

  private handleMovement() {
    const speed = PLAYER_SPEED;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      velocityX = -speed;
      this.direction = 'left';
    } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      velocityX = speed;
      this.direction = 'right';
    }

    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      velocityY = -speed;
      this.direction = 'up';
    } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      velocityY = speed;
      this.direction = 'down';
    }

    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.player.body.setVelocity(velocityX, velocityY);

    if (velocityX !== 0 || velocityY !== 0) {
      this.playerState = 'walking';
      this.emitMovement();
    } else {
      this.playerState = 'idle';
    }
  }

  private handleSitting() {
    if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
      this.standUp();
    }
  }

  private standUp() {
    this.playerState = 'idle';
    this.sitTarget = null;
    this.hideInteractionPrompt();
  }

  private checkInteractions() {
    const playerPos = { x: this.player.x, y: this.player.y };

    const nearbyObjects = this.worldObjects.filter(obj => {
      const container = obj as Phaser.GameObjects.Container;
      const objX = container.x || 0;
      const objY = container.y || 0;
      const dx = objX - playerPos.x;
      const dy = objY - playerPos.y;
      return Math.sqrt(dx * dx + dy * dy) <= INTERACTION_RADIUS;
    });

    if (nearbyObjects.length > 0) {
      const obj = nearbyObjects[0];
      const interactions = obj.getData('interactions') || [];
      if (interactions.length > 0) {
        this.showInteractionPrompt(interactions[0].label, () => this.interactWithObject(obj));
        return;
      }
    }

    this.hideInteractionPrompt();
  }

  private checkExitBuilding() {
    const playerPos = { x: this.player.x, y: this.player.y };
    const dx = this.exitDoorPosition.x - playerPos.x;
    const dy = this.exitDoorPosition.y - playerPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= INTERACTION_RADIUS && Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
      this.exitBuilding();
    }
  }

  private exitBuilding() {
    this.emitter?.emit('exit_building', { buildingId: this.currentBuildingId });
  }

  private showInteractionPrompt(label: string, callback: () => void) {
    if (this.interactionPrompt) {
      this.interactionPrompt.destroy();
    }

    const prompt = this.add.container(200, 350);
    prompt.setScrollFactor(0);
    prompt.setDepth(1001);

    const bg = this.add.rectangle(0, 0, 100, 30, 0x000000cc);
    const text = this.add.text(0, 0, `E - ${label}`, {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    prompt.add([bg, text]);
    this.interactionPrompt = prompt;

    if (Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
      callback();
    }
  }

  private hideInteractionPrompt() {
    if (this.interactionPrompt) {
      this.interactionPrompt.destroy();
      this.interactionPrompt = null;
    }
  }

  private interactWithObject(obj: Phaser.GameObjects.GameObject) {
    const interactions = obj.getData('interactions') || [];
    const interaction = interactions[0];
    if (!interaction) return;

    switch (interaction.type) {
      case 'exit':
        this.exitBuilding();
        break;
      case 'sit':
        this.sitOnObject(obj);
        break;
      case 'inspect':
        this.inspectObject(obj);
        break;
      default:
        console.log('Unknown interaction type:', interaction.type);
    }
  }

  private sitOnObject(obj: Phaser.GameObjects.GameObject) {
    this.playerState = 'sitting';
    this.sitTarget = obj;

    const container = obj as Phaser.GameObjects.Container;
    this.tweens.add({
      targets: this.player,
      x: container.x || 200,
      y: (container.y || 200) - 10,
      duration: 200
    });
  }

  private inspectObject(obj: Phaser.GameObjects.GameObject) {
    console.log('Inspecting:', obj.getData('objectId'));
  }

  private emitMovement() {
    if (this.emitter) {
      this.emitter.emit('player_move', {
        position: { x: this.player.x, y: this.player.y },
        direction: this.direction,
        state: this.playerState
      });
    }
  }
}