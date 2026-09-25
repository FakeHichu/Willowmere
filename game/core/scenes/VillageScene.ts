import Phaser from 'phaser';
import type { CharacterCustomization, PlayerState, Direction, Vector2, NetworkPlayer } from '@shared/types';
import { villageMap, getObjectsAtPosition } from '@data/world/objects';
import { npcs, getNpcsAtPosition } from '@data/npcs';
import { WORLD_BOUNDS, PLAYER_SPEED, INTERACTION_RADIUS } from '../GameConfig';

interface PlayerSprite extends Phaser.GameObjects.Container {
  body: Phaser.Physics.Arcade.Body;
}

interface NPCSprite extends Phaser.GameObjects.Container {
  npcId: string;
  body: Phaser.Physics.Arcade.Body;
}

export class VillageScene extends Phaser.Scene {
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

  constructor() {
    super({ key: 'VillageScene' });
    this.playerCustomization = {} as CharacterCustomization;
  }

  init(data: { customization: CharacterCustomization; emitter?: Phaser.Events.EventEmitter }) {
    this.playerCustomization = data.customization || {};
    this.emitter = data.emitter;
  }

  create() {
    // Create world bounds
    this.physics.world.setBounds(0, 0, WORLD_BOUNDS.width, WORLD_BOUNDS.height);

    // Create ground layer
    this.createGround();

    // Create world objects
    this.createWorldObjects();

    // Create NPCs
    this.createNPCs();

    // Create player
    this.createPlayer();

    // Setup camera
    this.setupCamera();

    // Setup controls
    this.setupControls();

    // Create UI elements
    this.createUI();

    // Listen for network events
    if (this.emitter) {
      this.setupNetworkListeners();
    }
  }

  private createGround() {
    // Create a simple grass background
    const graphics = this.add.graphics();
    graphics.fillStyle(0x7cb342, 1); // Warm grass green
    graphics.fillRect(0, 0, WORLD_BOUNDS.width, WORLD_BOUNDS.height);

    // Add some texture variation
    for (let i = 0; i < 200; i++) {
      const x = Phaser.Math.Between(0, WORLD_BOUNDS.width);
      const y = Phaser.Math.Between(0, WORLD_BOUNDS.height);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.3);
      graphics.fillStyle(0x558b2f, alpha);
      graphics.fillCircle(x, y, Phaser.Math.Between(2, 8));
    }

    // Add paths
    graphics.fillStyle(0x8d6e63, 1); // Dirt path color
    // Main path through village
    graphics.fillRect(50, 250, 700, 40);
    graphics.fillRect(380, 50, 40, 400);
    graphics.fillRect(380, 450, 200, 40);

    // Path details
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(250, 290);
      graphics.fillStyle(0x795548, 0.3);
      graphics.fillCircle(x, y, Phaser.Math.Between(1, 3));
    }
  }

  private createWorldObjects() {
    // Create visual representations of world objects
    villageMap.objects.forEach(obj => {
      const container = this.add.container(obj.position.x, obj.position.y);

      let sprite: Phaser.GameObjects.GameObject;

      switch (obj.type) {
        case 'bench':
          sprite = this.createBenchSprite(obj.position.x, obj.position.y);
          break;
        case 'flower':
          sprite = this.createFlowerSprite(obj.position.x, obj.position.y, obj.sprite);
          break;
        case 'pond':
          sprite = this.createPondSprite(obj.position.x, obj.position.y, obj.size);
          break;
        case 'notice_board':
          sprite = this.createNoticeBoardSprite(obj.position.x, obj.position.y);
          break;
        case 'door':
          sprite = this.createDoorSprite(obj.position.x, obj.position.y);
          break;
        case 'mailbox':
          sprite = this.createMailboxSprite(obj.position.x, obj.position.y);
          break;
        case 'garden_plot':
          sprite = this.createGardenPlotSprite(obj.position.x, obj.position.y);
          break;
        case 'item_pickup':
          sprite = this.createItemSprite(obj.position.x, obj.position.y, obj.sprite);
          break;
        default:
          sprite = this.add.rectangle(obj.position.x, obj.position.y, obj.size.x, obj.size.y, 0x8b4513);
      }

      // Add collision if needed
      if (obj.collision) {
        const hitbox = this.add.rectangle(0, 0, obj.size.x, obj.size.y, 0x000000, 0) as Phaser.GameObjects.Rectangle;
        this.physics.add.existing(hitbox, true);
        container.add(hitbox);

        if (this.player) {
          this.physics.add.collider(this.player, hitbox);
        }
      }

      // Store reference for interactions
      container.setData('objectId', obj.id);
      container.setData('objectType', obj.type);
      container.setData('interactions', obj.interactions);
      container.setData('properties', obj.properties);

      this.worldObjects.push(container);
    });
  }

  private createBenchSprite(x: number, y: number): Phaser.GameObjects.Rectangle {
    const bench = this.add.rectangle(x, y, 64, 32, 0x8b4513);
    const legs = this.add.rectangle(x, y + 12, 56, 8, 0x5d4037);
    const seat = this.add.rectangle(x, y - 4, 64, 8, 0xa1887f);

    return bench;
  }

  private createFlowerSprite(x: number, y: number, type: string): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const colors: Record<string, number> = {
      'flower_wildflower': 0xff6b9d,
      'flower_lavender': 0x9c27b0,
      'flower_sunflower': 0xffc107
    };

    const color = colors[type] || 0xff6b9d;
    const size = type === 'flower_sunflower' ? 16 : 12;

    // Stem
    const stem = this.add.rectangle(0, 8, 2, 16, 0x4caf50);
    // Flower center
    const center = this.add.circle(0, -4, size / 3, 0xffeb3b);
    // Petals
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const petalX = Math.cos(angle) * size / 2;
      const petalY = Math.sin(angle) * size / 2 - 4;
      const petal = this.add.circle(petalX, petalY, size / 3, color);
      container.add(petal);
    }

    container.add([stem, center]);
    return container;
  }

  private createPondSprite(x: number, y: number, size: Vector2): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Water
    const water = this.add.ellipse(0, 0, size.x, size.y, 0x4fc3f7, 0.8);
    // Reflection highlights
    const highlight1 = this.add.ellipse(-30, -10, 40, 20, 0x81d4fa, 0.5);
    const highlight2 = this.add.ellipse(20, 15, 30, 15, 0x81d4fa, 0.4);

    // Water plants
    const plant1 = this.add.ellipse(-60, 20, 20, 30, 0x66bb6a);
    const plant2 = this.add.ellipse(55, -15, 25, 35, 0x4caf50);

    container.add([water, highlight1, highlight2, plant1, plant2]);

    // Add subtle animation
    this.tweens.add({
      targets: [highlight1, highlight2],
      alpha: { from: 0.5, to: 0.7 },
      duration: 2000,
      yoyo: true,
      repeat: -1
    });

    return container;
  }

  private createNoticeBoardSprite(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Post
    const post = this.add.rectangle(0, 20, 8, 50, 0x5d4037);
    // Board
    const board = this.add.rectangle(0, -10, 48, 40, 0x8d6e63);
    const border = this.add.rectangle(0, -10, 52, 44, 0x5d4037);
    border.setStrokeStyle(2, 0x3e2723);

    container.add([border, board, post]);
    return container;
  }

  private createDoorSprite(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const frame = this.add.rectangle(0, 0, 36, 52, 0x5d4037);
    const door = this.add.rectangle(0, 0, 32, 48, 0x795548);
    const handle = this.add.circle(10, 5, 3, 0xffc107);

    container.add([frame, door, handle]);
    return container;
  }

  private createMailboxSprite(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const post = this.add.rectangle(0, 10, 6, 30, 0x5d4037);
    const box = this.add.rectangle(0, -8, 24, 16, 0xef5350);
    const flag = this.add.rectangle(14, -8, 4, 10, 0xffc107);

    container.add([post, box, flag]);
    return container;
  }

  private createGardenPlotSprite(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Soil
    const soil = this.add.rectangle(0, 0, 48, 48, 0x6d4c41);
    // Plants
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const plantX = (i - 1) * 14;
        const plantY = (j - 1) * 14;
        const stem = this.add.rectangle(plantX, plantY, 2, 8, 0x4caf50);
        const leaf = this.add.ellipse(plantX, plantY - 4, 6, 4, 0x66bb6a);
        container.add([stem, leaf]);
      }
    }

    return container;
  }

  private createItemSprite(x: number, y: number, sprite: string): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const item = this.add.rectangle(0, 0, 16, 16, 0x78909c);
    const highlight = this.add.rectangle(-2, -2, 6, 6, 0xb0bec5);

    container.add([item, highlight]);

    // Add floating animation
    this.tweens.add({
      targets: container,
      y: y - 3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return container;
  }

  private createNPCs() {
    npcs.forEach(npcData => {
      const container = this.add.container(npcData.position.x, npcData.position.y) as NPCSprite;
      container.npcId = npcData.id;

      // Create NPC sprite based on their role
      const colors: Record<string, number> = {
        'npc_mabel': 0x4caf50,
        'npc_rose': 0xffc107,
        'npc_arthur': 0xff5722,
        'npc_luna': 0x9c27b0
      };

      const bodyColor = colors[npcData.id] || 0x9e9e9e;

      // Body
      const body = this.add.rectangle(0, 0, 24, 32, bodyColor);
      // Head
      const head = this.add.circle(0, -20, 12, 0xffd7ba);
      // Name tag
      const nameText = this.add.text(0, -40, npcData.name, {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 4, y: 2 }
      }).setOrigin(0.5);

      container.add([body, head, nameText]);

      // Add physics
      this.physics.add.existing(container);
      container.body.setSize(24, 32);
      container.body.setOffset(-12, -16);
      (container.body as Phaser.Physics.Arcade.Body).setImmovable(true);

      this.npcs.push(container);

      // Add idle animation
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
    this.player = this.add.container(
      villageMap.spawnPoint.x,
      villageMap.spawnPoint.y
    ) as PlayerSprite;

    // Create player sprite based on customization
    this.updatePlayerAppearance();

    // Add physics
    this.physics.add.existing(this.player);
    this.player.body.setSize(24, 32);
    this.player.body.setOffset(-12, -16);
    this.player.body.setCollideWorldBounds(true);

    // Add collision with NPCs
    this.npcs.forEach(npc => {
      this.physics.add.collider(this.player, npc);
    });
  }

  private updatePlayerAppearance() {
    this.player.removeAll(true);

    // Get colors from customization
    const skinTones: Record<string, number> = {
      'skin_01': 0xffe4d0,
      'skin_02': 0xf5d0b5,
      'skin_03': 0xe8c4a2,
      'skin_04': 0xd4a574,
      'skin_05': 0xc4956a,
      'skin_06': 0xa67c52,
      'skin_07': 0x8b5a2b,
      'skin_08': 0x6b4423,
      'skin_09': 0x4a3021,
      'skin_10': 0x3d261a
    };

    const skinColor = skinTones[this.playerCustomization.skinTone] || 0xffd7ba;
    const topColor = Phaser.Display.Color.HexStringToColor(this.playerCustomization.topColor || '#87CEEB').color;
    const bottomColor = Phaser.Display.Color.HexStringToColor(this.playerCustomization.bottomColor || '#8B4513').color;
    const hairColor = Phaser.Display.Color.HexStringToColor(this.playerCustomization.hairColor || '#6B4226').color;

    // Legs
    const legs = this.add.rectangle(0, 12, 20, 16, bottomColor);
    // Body
    const body = this.add.rectangle(0, 0, 24, 28, topColor);
    // Head
    const head = this.add.circle(0, -18, 10, skinColor);
    // Hair
    const hair = this.add.rectangle(0, -22, 22, 10, hairColor);
    // Eyes
    const eyes = this.add.rectangle(0, -18, 8, 2, 0x000000);

    this.player.add([legs, body, head, hair, eyes]);
  }

  private setupCamera() {
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, WORLD_BOUNDS.width, WORLD_BOUNDS.height);
    this.cameras.main.setZoom(1.5);
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
    // Create HUD
    const hud = this.add.container(0, 0);
    hud.setScrollFactor(0);
    hud.setDepth(1000);

    // Player name badge
    const nameBadge = this.add.rectangle(20, 20, 120, 30, 0x000000aa);
    const playerName = this.add.text(20, 20, 'Traveler', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);
    hud.add([nameBadge, playerName]);
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

    // Simple player sprite
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
      // Smooth interpolation
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
  }

  private handleMovement() {
    const speed = PLAYER_SPEED;
    let velocityX = 0;
    let velocityY = 0;

    // Check WASD and Arrow keys
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

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= 0.707;
      velocityY *= 0.707;
    }

    this.player.body.setVelocity(velocityX, velocityY);

    // Update player state
    if (velocityX !== 0 || velocityY !== 0) {
      this.playerState = 'walking';
      this.emitMovement();
    } else {
      this.playerState = 'idle';
    }
  }

  private handleSitting() {
    // Press E to stand up
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

    // Check NPCs
    const nearbyNpcs = getNpcsAtPosition(playerPos, INTERACTION_RADIUS);
    if (nearbyNpcs.length > 0) {
      const npc = nearbyNpcs[0];
      this.showInteractionPrompt('Talk', () => this.interactWithNPC(npc));
      return;
    }

    // Check world objects
    const nearbyObjects = getObjectsAtPosition(playerPos, INTERACTION_RADIUS);
    if (nearbyObjects.length > 0) {
      const obj = nearbyObjects[0];
      if (obj.interactions && obj.interactions.length > 0) {
        this.showInteractionPrompt(obj.interactions[0].label, () => this.interactWithObject(obj));
        return;
      }
    }

    this.hideInteractionPrompt();
  }

  private showInteractionPrompt(label: string, callback: () => void) {
    if (this.interactionPrompt) {
      this.interactionPrompt.destroy();
    }

    const prompt = this.add.container(400, 550);
    prompt.setScrollFactor(0);
    prompt.setDepth(1001);

    const bg = this.add.rectangle(0, 0, 100, 30, 0x000000cc);
    const text = this.add.text(0, 0, `E - ${label}`, {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    prompt.add([bg, text]);
    this.interactionPrompt = prompt;

    // Handle interaction key press
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

  private interactWithNPC(npc: typeof npcs[0]) {
    // Emit dialogue event
    this.emitter?.emit('start_dialogue', { npcId: npc.id });
  }

  private interactWithObject(obj: typeof villageMap.objects[0]) {
    const interaction = obj.interactions?.[0];
    if (!interaction) return;

    switch (interaction.type) {
      case 'sit':
        this.sitOnObject(obj);
        break;
      case 'pickup':
        this.pickupItem(obj);
        break;
      case 'inspect':
        this.inspectObject(obj);
        break;
      default:
        console.log('Unknown interaction type:', interaction.type);
    }
  }

  private sitOnObject(obj: typeof villageMap.objects[0]) {
    this.playerState = 'sitting';
    this.sitTarget = this.worldObjects.find(o => o.getData('objectId') === obj.id) || null;

    // Move player to bench position
    this.tweens.add({
      targets: this.player,
      x: obj.position.x,
      y: obj.position.y - 10,
      duration: 200
    });
  }

  private pickupItem(obj: typeof villageMap.objects[0]) {
    const itemType = obj.properties?.itemType as string;
    if (itemType) {
      this.emitter?.emit('pickup_item', { itemId: itemType, objectId: obj.id });
    }
  }

  private inspectObject(obj: typeof villageMap.objects[0]) {
    console.log('Inspecting:', obj.id);
    // Could show a UI panel with object description
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
