import Phaser from 'phaser';
import type { WorldEvent, Vector2 } from '@shared/types';
import { worldEventsData } from '@data/world/events';

// ─── Extended event types ────────────────────────────────────────────────────

export type EventCategory =
  | 'exploration'   // player enters new location
  | 'environmental' // weather/time-of-day-based events
  | 'world'         // periodic world occurrences (market day, festival, etc.)
  | 'encounter'     // creature/bandit encounter
  | 'discovery';    // hidden location, secret path

export interface ActiveWorldEvent extends WorldEvent {
  category: EventCategory;
  startTime?: number;      // game world minutes
  endTime?: number;
  cooldownMs: number;
  lastTriggeredAt: number;
  oneShot: boolean;        // fire once per session
  fired: boolean;
  visualIndicator?: 'exclamation' | 'smoke' | 'sparkle' | 'fire' | 'star';
  onTrigger?: (event: ActiveWorldEvent, emitter: Phaser.Events.EventEmitter) => void;
}

export interface EventNotification {
  title: string;
  message: string;
  icon: string;
  color: number;
  duration: number;
}

export class WorldEventManager {
  private scene: Phaser.Scene;
  private emitter: Phaser.Events.EventEmitter;
  private activeEvents: Map<string, ActiveWorldEvent> = new Map();
  private notifications: Phaser.GameObjects.Container[] = [];
  private notificationQueue: EventNotification[] = [];
  private isShowingNotification = false;

  // Recurring world event timers
  private worldEventTimer = 0;
  private readonly WORLD_EVENT_INTERVAL = 180000; // 3 minutes real-time
  private currentGameTimeMin = 480; // Start at 08:00

  // Indicators for event proximity
  private eventIndicators: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor(scene: Phaser.Scene, emitter: Phaser.Events.EventEmitter) {
    this.scene = scene;
    this.emitter = emitter;
  }

  create(): void {
    this.populateEventsFromData();
    this.addDynamicEvents();
    this.setupInternalListeners();
  }

  private populateEventsFromData(): void {
    worldEventsData.forEach(event => {
      const active: ActiveWorldEvent = {
        ...event,
        category: 'world',
        cooldownMs: 120000,
        lastTriggeredAt: 0,
        oneShot: false,
        fired: false,
      };
      this.activeEvents.set(event.id, active);
    });
  }

  private addDynamicEvents(): void {
    const dynamicEvents: ActiveWorldEvent[] = [

      // ── Exploration events ───────────────────────────────────────────────
      {
        id: 'evt_waterfall_discovery',
        name: 'Great Waterfall',
        description: 'The roar of a massive waterfall fills the air. Water crashes down from a cliff high above.',
        position: { x: 4920, y: 900 },
        radius: 300,
        type: 'exploration',
        isActive: true,
        category: 'discovery',
        cooldownMs: 0,
        lastTriggeredAt: 0,
        oneShot: true,
        fired: false,
        visualIndicator: 'sparkle',
      },
      {
        id: 'evt_ancient_tree_discovery',
        name: 'The Ancient Tree',
        description: 'An enormous ancient tree stretches into the sky. Its bark glows faintly at night. Something old lives here.',
        position: { x: 2500, y: 400 },
        radius: 250,
        type: 'exploration',
        isActive: true,
        category: 'discovery',
        cooldownMs: 0,
        lastTriggeredAt: 0,
        oneShot: true,
        fired: false,
        visualIndicator: 'sparkle',
      },
      {
        id: 'evt_mountain_peak_discovery',
        name: 'Summit of Greymane',
        description: 'You reach the peak. The entire valley of Willowmere stretches below you. A cold wind whispers a name.',
        position: { x: 3800, y: 200 },
        radius: 200,
        type: 'exploration',
        isActive: true,
        category: 'discovery',
        cooldownMs: 0,
        lastTriggeredAt: 0,
        oneShot: true,
        fired: false,
        visualIndicator: 'star',
      },
      {
        id: 'evt_hidden_grove_discovery',
        name: 'The Hidden Grove',
        description: 'Dense foliage parts to reveal a secret grove bathed in golden light. Glowing flowers you\'ve never seen before bloom here.',
        position: { x: 800, y: 800 },
        radius: 220,
        type: 'exploration',
        isActive: true,
        category: 'discovery',
        cooldownMs: 0,
        lastTriggeredAt: 0,
        oneShot: true,
        fired: false,
        visualIndicator: 'sparkle',
      },
      {
        id: 'evt_cave_entrance',
        name: 'Cave Entrance',
        description: 'A narrow opening in the rock face leads into darkness. The air is cool and smells of earth and something ancient.',
        position: { x: 3700, y: 1300 },
        radius: 150,
        type: 'exploration',
        isActive: true,
        category: 'discovery',
        cooldownMs: 0,
        lastTriggeredAt: 0,
        oneShot: true,
        fired: false,
        visualIndicator: 'exclamation',
      },
      {
        id: 'evt_abandoned_camp',
        name: 'Abandoned Campsite',
        description: 'A fire pit still warm, supplies scattered — someone left in a hurry. A faded map pin marks something to the south.',
        position: { x: 1200, y: 4300 },
        radius: 200,
        type: 'exploration',
        isActive: true,
        category: 'discovery',
        cooldownMs: 0,
        lastTriggeredAt: 0,
        oneShot: true,
        fired: false,
        visualIndicator: 'exclamation',
      },

      // ── Environmental events ──────────────────────────────────────────────
      {
        id: 'evt_riverside_mist',
        name: 'Morning River Mist',
        description: 'Thick mist rolls off the river at dawn, reducing visibility but making the world feel deeply alive.',
        position: { x: 4500, y: 2200 },
        radius: 600,
        type: 'environmental',
        isActive: true,
        category: 'environmental',
        cooldownMs: 60000,
        lastTriggeredAt: 0,
        oneShot: false,
        fired: false,
        startTime: 300,  // 05:00
        endTime: 480,    // 08:00
      },
      {
        id: 'evt_forest_night_sounds',
        name: 'The Woods Stir',
        description: 'Strange sounds emerge from the Whispering Woods at night. Branches crack, eyes glint between the trees.',
        position: { x: 2800, y: 700 },
        radius: 800,
        type: 'environmental',
        isActive: true,
        category: 'environmental',
        cooldownMs: 30000,
        lastTriggeredAt: 0,
        oneShot: false,
        fired: false,
        startTime: 1320, // 22:00
        endTime: 360,    // 06:00
      },
      {
        id: 'evt_thunderstorm_valley',
        name: 'Storm Front',
        description: 'Dark clouds gather over the valley. Lightning flashes on the horizon. Seek shelter.',
        position: { x: 3000, y: 2300 },
        radius: 2000,
        type: 'environmental',
        isActive: true,
        category: 'environmental',
        cooldownMs: 600000, // 10 min cooldown
        lastTriggeredAt: 0,
        oneShot: false,
        fired: false,
        visualIndicator: 'smoke',
      },

      // ── World events ──────────────────────────────────────────────────────
      {
        id: 'evt_market_day',
        name: 'Market Day!',
        description: 'Merchants have gathered in Willowmere village square! Special goods available today.',
        position: { x: 3100, y: 2100 },
        radius: 400,
        type: 'world',
        isActive: true,
        category: 'world',
        cooldownMs: 0,
        lastTriggeredAt: 0,
        oneShot: false,
        fired: false,
        startTime: 480,  // 08:00
        endTime: 1020,   // 17:00
        visualIndicator: 'exclamation',
      },
      {
        id: 'evt_harvest_festival',
        name: 'Harvest Festival',
        description: 'Colorful banners decorate the village! The annual Harvest Festival is underway. Join the celebration!',
        position: { x: 3100, y: 2100 },
        radius: 500,
        type: 'world',
        isActive: true,
        category: 'world',
        cooldownMs: 0,
        lastTriggeredAt: 0,
        oneShot: false,
        fired: false,
        startTime: 900,  // 15:00
        endTime: 1320,   // 22:00
        visualIndicator: 'sparkle',
      },

      // ── Encounter events ──────────────────────────────────────────────────
      {
        id: 'evt_bandit_road',
        name: 'Danger on the Road',
        description: 'The crossroads ahead feels wrong. A campfire smolders in the ditch. Someone is watching.',
        position: { x: 2000, y: 2300 },
        radius: 200,
        type: 'encounter',
        isActive: true,
        category: 'encounter',
        cooldownMs: 300000,
        lastTriggeredAt: 0,
        oneShot: false,
        fired: false,
        visualIndicator: 'exclamation',
      },
      {
        id: 'evt_wolf_pack_north',
        name: 'Wolf Pack Spotted',
        description: 'Tracks in the mud — fresh, large, wolf. You hear distant howling from the northern woods.',
        position: { x: 2600, y: 500 },
        radius: 300,
        type: 'encounter',
        isActive: true,
        category: 'encounter',
        cooldownMs: 180000,
        lastTriggeredAt: 0,
        oneShot: false,
        fired: false,
        visualIndicator: 'exclamation',
        startTime: 1200, // 20:00 — wolves hunt at night
      },
    ];

    dynamicEvents.forEach(ev => this.activeEvents.set(ev.id, ev));
  }

  private setupInternalListeners(): void {
    // React to game time changes from the clock
    this.emitter.on('game_time_update', (timeMin: number) => {
      this.currentGameTimeMin = timeMin;
    });

    // React to region changes to enable region-specific events
    this.emitter.on('region_changed', (regionId: string) => {
      this.onRegionChange(regionId);
    });

    // React to weather changes
    this.emitter.on('weather_changed', (weather: string) => {
      if (weather === 'storm' || weather === 'heavy_rain') {
        this.triggerEventById('evt_thunderstorm_valley');
      }
    });
  }

  update(playerPos: Vector2): void {
    const now = Date.now();

    this.activeEvents.forEach(event => {
      if (!event.isActive) return;
      if (event.oneShot && event.fired) return;

      // Time-gated events: skip if outside their active window
      if (event.startTime !== undefined && event.endTime !== undefined) {
        const inWindow = this.isInTimeWindow(
          this.currentGameTimeMin,
          event.startTime,
          event.endTime
        );
        if (!inWindow) return;
      }

      // Cooldown check
      if (now - event.lastTriggeredAt < event.cooldownMs) return;

      const dx = playerPos.x - event.position.x;
      const dy = playerPos.y - event.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= event.radius) {
        this.fireEvent(event, now);
      }
    });

    // Update recurring world events (market day announcements, etc.)
    this.worldEventTimer += this.scene.game.loop.delta;
    if (this.worldEventTimer >= this.WORLD_EVENT_INTERVAL) {
      this.worldEventTimer = 0;
      this.checkPeriodicWorldEvents();
    }

    // Process notification queue
    this.processNotificationQueue();
  }

  private fireEvent(event: ActiveWorldEvent, now: number): void {
    event.lastTriggeredAt = now;

    if (event.oneShot) {
      event.fired = true;
    }

    // Emit to the broader event bus
    this.emitter.emit('world_event_triggered', {
      id: event.id,
      name: event.name,
      category: event.category,
      description: event.description,
    });

    // Queue a UI notification for discovery/encounter events
    if (event.category === 'discovery' || event.category === 'encounter' || event.category === 'world') {
      this.queueNotification(event);
    }

    // Custom handler
    if (event.onTrigger) {
      event.onTrigger(event, this.emitter);
    }
  }

  private queueNotification(event: ActiveWorldEvent): void {
    const iconMap: Record<EventCategory, string> = {
      discovery: '★',
      encounter: '!',
      world: '♦',
      environmental: '~',
      exploration: '◎',
    };

    const colorMap: Record<EventCategory, number> = {
      discovery: 0xffd700,
      encounter: 0xff4444,
      world: 0x81c784,
      environmental: 0x80deea,
      exploration: 0xb39ddb,
    };

    this.notificationQueue.push({
      title: event.name,
      message: event.description,
      icon: iconMap[event.category] ?? '●',
      color: colorMap[event.category] ?? 0xffffff,
      duration: event.category === 'discovery' ? 5000 : 3000,
    });
  }

  private processNotificationQueue(): void {
    if (this.isShowingNotification || this.notificationQueue.length === 0) return;

    const notification = this.notificationQueue.shift()!;
    this.showNotification(notification);
  }

  private showNotification(notification: EventNotification): void {
    this.isShowingNotification = true;

    const screenWidth = this.scene.cameras.main.width;
    const container = this.scene.add.container(screenWidth / 2, 80);
    container.setScrollFactor(0);
    container.setDepth(5000);
    container.setAlpha(0);

    const bg = this.scene.add.rectangle(0, 0, 380, 70, 0x000000, 0.85);
    bg.setStrokeStyle(2, notification.color, 0.9);

    const iconText = this.scene.add.text(-170, 0, notification.icon, {
      fontSize: '22px',
      color: `#${notification.color.toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5);

    const titleText = this.scene.add.text(-140, -14, notification.title, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: `#${notification.color.toString(16).padStart(6, '0')}`,
    }).setOrigin(0, 0.5);

    const msgText = this.scene.add.text(-140, 8, notification.message, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '10px',
      color: '#cccccc',
      wordWrap: { width: 290 },
    }).setOrigin(0, 0);

    container.add([bg, iconText, titleText, msgText]);
    this.scene.tweens.add({
      targets: container,
      alpha: 1,
      y: 90,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.scene.time.delayedCall(notification.duration, () => {
          this.scene.tweens.add({
            targets: container,
            alpha: 0,
            y: 70,
            duration: 300,
            onComplete: () => {
              container.destroy();
              this.isShowingNotification = false;
            },
          });
        });
      },
    });

    this.notifications.push(container);
  }

  private isInTimeWindow(currentMin: number, startMin: number, endMin: number): boolean {
    if (startMin <= endMin) {
      return currentMin >= startMin && currentMin <= endMin;
    }
    // Overnight window (e.g., 22:00–06:00)
    return currentMin >= startMin || currentMin <= endMin;
  }

  private checkPeriodicWorldEvents(): void {
    const hour = Math.floor(this.currentGameTimeMin / 60);

    // Announce market day at 08:00
    if (hour === 8) {
      this.triggerEventById('evt_market_day');
    }
    // Announce festival at 15:00
    if (hour === 15) {
      this.triggerEventById('evt_harvest_festival');
    }
  }

  private onRegionChange(regionId: string): void {
    const regionEventMap: Record<string, string[]> = {
      whispering_woods: ['evt_forest_night_sounds'],
      riverside: ['evt_riverside_mist'],
      ancient_ruins: ['evt_ruins_atmosphere'],
    };

    const eventsForRegion = regionEventMap[regionId];
    if (eventsForRegion) {
      eventsForRegion.forEach(id => this.triggerEventById(id));
    }
  }

  triggerEventById(id: string): void {
    const event = this.activeEvents.get(id);
    if (event && event.isActive && !(event.oneShot && event.fired)) {
      this.fireEvent(event, Date.now());
    }
  }

  getActiveEvents(): WorldEvent[] {
    return Array.from(this.activeEvents.values()).filter(e => e.isActive);
  }

  getDiscoveredEvents(): string[] {
    return Array.from(this.activeEvents.values())
      .filter(e => e.oneShot && e.fired)
      .map(e => e.id);
  }

  setCurrentGameTime(minutes: number): void {
    this.currentGameTimeMin = minutes;
  }

  deactivateEvent(id: string): void {
    const event = this.activeEvents.get(id);
    if (event) event.isActive = false;
  }

  destroy(): void {
    this.notifications.forEach(n => n.destroy());
    this.notifications = [];
    this.notificationQueue = [];
  }
}
