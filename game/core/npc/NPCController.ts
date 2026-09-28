import Phaser from 'phaser';
import type { NPCDefinition, Vector2, Direction, NPCBehaviorState, WeatherType, CharacterCustomization } from '@shared/types';
import { CharacterRenderer } from '../characters/CharacterRenderer';
import { NPCNavigation } from './NPCNavigation';
import { NPCScheduleSystem, NPCScheduleGoal } from './NPCScheduleSystem';
import { NPCBehavior } from './NPCBehavior';

// ─── Role → visual preset mapping ────────────────────────────────────────────
const NPC_APPEARANCE_PRESETS: Record<string, Partial<CharacterCustomization>> = {
  'Mayor & Leader':           { skinTone: '#e8c99a', hair: 'combed', hairColor: '#4a3728', top: 'coat', topColor: '#3e2723', bottom: 'pants', bottomColor: '#212121', shoes: 'boots', shoesColor: '#1a1a1a' },
  'General Store Owner':      { skinTone: '#d4956a', hair: 'bun', hairColor: '#6d4c41', top: 'blouse', topColor: '#e57373', bottom: 'skirt', bottomColor: '#4a148c', shoes: 'slippers', shoesColor: '#795548' },
  'Village Blacksmith':       { skinTone: '#7c4e2d', hair: 'short', hairColor: '#212121', top: 'tunic', topColor: '#424242', bottom: 'pants', bottomColor: '#212121', shoes: 'boots', shoesColor: '#212121', accessory: 'apron' },
  'Herbalist & Gardener':     { skinTone: '#f5cba7', hair: 'braided', hairColor: '#8bc34a', top: 'blouse', topColor: '#4caf50', bottom: 'skirt', bottomColor: '#2e7d32', shoes: 'sandals', shoesColor: '#795548', accessory: 'flower_crown' },
  'Innkeeper':                { skinTone: '#c68642', hair: 'curly', hairColor: '#d32f2f', top: 'vest', topColor: '#bf360c', bottom: 'pants', bottomColor: '#5d4037', shoes: 'boots', shoesColor: '#3e2723' },
  'Librarian & Historian':    { skinTone: '#e0d0b0', hair: 'long', hairColor: '#9e9e9e', top: 'robe', topColor: '#3f51b5', bottom: 'pants', bottomColor: '#303f9f', shoes: 'slippers', shoesColor: '#7986cb', accessory: 'spectacles' },
  'Stable Master':            { skinTone: '#b5835a', hair: 'short', hairColor: '#6d4c41', top: 'tunic', topColor: '#795548', bottom: 'pants', bottomColor: '#4e342e', shoes: 'boots', shoesColor: '#3e2723' },
  'Fisherwoman':              { skinTone: '#c2956c', hair: 'ponytail', hairColor: '#5d4037', top: 'vest', topColor: '#01579b', bottom: 'pants', bottomColor: '#1565c0', shoes: 'boots', shoesColor: '#1a237e' },
  'North Farm Operator':      { skinTone: '#bf8a5d', hair: 'short', hairColor: '#6d4c41', top: 'tunic', topColor: '#558b2f', bottom: 'pants', bottomColor: '#33691e', shoes: 'boots', shoesColor: '#4e342e' },
  'Village Child':            { skinTone: '#f5cba7', hair: 'pigtails', hairColor: '#ff9800', top: 'blouse', topColor: '#ff5722', bottom: 'shorts', bottomColor: '#1976d2', shoes: 'sandals', shoesColor: '#795548' },
  'Village Priest':           { skinTone: '#e8d5c0', hair: 'tonsure', hairColor: '#9e9e9e', top: 'robe', topColor: '#e8eaf6', bottom: 'pants', bottomColor: '#e8eaf6', shoes: 'slippers', shoesColor: '#9fa8da', accessory: 'medallion' },
  'Riverside Fisherman':      { skinTone: '#8d6e63', hair: 'messy', hairColor: '#795548', top: 'vest', topColor: '#546e7a', bottom: 'pants', bottomColor: '#37474f', shoes: 'boots', shoesColor: '#263238' },
  'Traveling Merchant':       { skinTone: '#d4a76a', hair: 'bun', hairColor: '#212121', top: 'coat', topColor: '#4a148c', bottom: 'skirt', bottomColor: '#7b1fa2', shoes: 'boots', shoesColor: '#4a148c', accessory: 'cloak' },
  'Forest Ranger':            { skinTone: '#a67c52', hair: 'ponytail', hairColor: '#33691e', top: 'tunic', topColor: '#33691e', bottom: 'pants', bottomColor: '#1b5e20', shoes: 'boots', shoesColor: '#3e2723', accessory: 'quiver' },
  'Lost Traveler':            { skinTone: '#d4b483', hair: 'messy', hairColor: '#8d6e63', top: 'tunic', topColor: '#90a4ae', bottom: 'pants', bottomColor: '#546e7a', shoes: 'boots', shoesColor: '#455a64' },
  'Mysterious Figure':        { skinTone: '#5d4037', hair: 'long', hairColor: '#212121', top: 'robe', topColor: '#1a1a2e', bottom: 'pants', bottomColor: '#16213e', shoes: 'boots', shoesColor: '#0f3460', accessory: 'hood' },
  'Senior Farmer':            { skinTone: '#b5835a', hair: 'bun', hairColor: '#9e9e9e', top: 'blouse', topColor: '#8d6e63', bottom: 'skirt', bottomColor: '#6d4c41', shoes: 'boots', shoesColor: '#4e342e' },
  'Farmhand':                 { skinTone: '#c2956c', hair: 'short', hairColor: '#5d4037', top: 'tunic', topColor: '#a5d6a7', bottom: 'pants', bottomColor: '#81c784', shoes: 'boots', shoesColor: '#4e342e' },
  'Ruins Archaeologist':      { skinTone: '#d4b483', hair: 'messy', hairColor: '#9e9e9e', top: 'vest', topColor: '#a1887f', bottom: 'pants', bottomColor: '#795548', shoes: 'boots', shoesColor: '#5d4037', accessory: 'spectacles' },
  'Ruins Guardian':           { skinTone: '#8d6e63', hair: 'short', hairColor: '#212121', top: 'armor', topColor: '#607d8b', bottom: 'pants', bottomColor: '#455a64', shoes: 'boots', shoesColor: '#37474f' },
  'Grove Druid':              { skinTone: '#a0785a', hair: 'long', hairColor: '#33691e', top: 'robe', topColor: '#2e7d32', bottom: 'pants', bottomColor: '#1b5e20', shoes: 'sandals', shoesColor: '#5d4037', accessory: 'staff' },
  'Lakeside Hermit':          { skinTone: '#8d6e63', hair: 'long', hairColor: '#9e9e9e', top: 'tunic', topColor: '#546e7a', bottom: 'pants', bottomColor: '#37474f', shoes: 'boots', shoesColor: '#263238' },
  'Mountain Guide':           { skinTone: '#b5835a', hair: 'ponytail', hairColor: '#5d4037', top: 'coat', topColor: '#b71c1c', bottom: 'pants', bottomColor: '#c62828', shoes: 'boots', shoesColor: '#212121' },
  'Wandering Scout':          { skinTone: '#c2956c', hair: 'short', hairColor: '#4e342e', top: 'vest', topColor: '#78909c', bottom: 'pants', bottomColor: '#546e7a', shoes: 'boots', shoesColor: '#37474f' },
  'Shrine Keeper':            { skinTone: '#e8d5c0', hair: 'long', hairColor: '#f5f5f5', top: 'robe', topColor: '#fffde7', bottom: 'pants', bottomColor: '#fff9c4', shoes: 'slippers', shoesColor: '#ffd54f', accessory: 'hood' },
};

const DEFAULT_APPEARANCE: CharacterCustomization = {
  skinTone: '#e0ac69',
  hair: 'short',
  hairColor: '#3e2723',
  top: 'tunic',
  topColor: '#2e7d32',
  bottom: 'pants',
  bottomColor: '#424242',
  shoes: 'boots',
  shoesColor: '#3e2723',
  accessory: null,
};

function getAppearanceForNPC(definition: NPCDefinition): CharacterCustomization {
  const preset = NPC_APPEARANCE_PRESETS[definition.role];
  if (!preset) return DEFAULT_APPEARANCE;
  return { ...DEFAULT_APPEARANCE, ...preset } as CharacterCustomization;
}

// ─── Idle wander behavior ─────────────────────────────────────────────────────

const IDLE_WANDER_RADIUS = 80;
const IDLE_WANDER_INTERVAL_MIN = 4000; // 4 sec
const IDLE_WANDER_INTERVAL_MAX = 12000; // 12 sec

export class NPCController {
  private definition: NPCDefinition;
  private renderer: CharacterRenderer;
  private navigation: NPCNavigation;
  private currentState: NPCBehaviorState = 'idle';
  private currentDirection: Direction = 'down';
  private currentGoalPosition: Vector2;
  private homePosition: Vector2;

  // Idle wander
  private idleWanderTimer = 0;
  private nextWanderDelay = IDLE_WANDER_INTERVAL_MIN;
  private isWandering = false;

  constructor(scene: Phaser.Scene, definition: NPCDefinition) {
    this.definition = definition;
    this.homePosition = { ...definition.position };
    this.currentGoalPosition = { ...definition.position };
    this.navigation = new NPCNavigation();

    const appearance = getAppearanceForNPC(definition);
    this.renderer = new CharacterRenderer(
      scene,
      definition.position.x,
      definition.position.y,
      appearance,
      definition.name
    );
  }

  update(time: number, delta: number, gameTimeStr: string, currentWeather: WeatherType, playerPos?: Vector2): void {
    const deltaSec = delta / 1000;
    const pos = this.getPosition();

    // ── Schedule evaluation ──────────────────────────────────────────────────
    if (this.definition.schedule && this.definition.schedule.length > 0) {
      const scheduleGoal = NPCScheduleSystem.getGoalForTime(
        this.definition.schedule as unknown as NPCScheduleGoal[],
        gameTimeStr
      );

      if (
        scheduleGoal &&
        (Math.abs(scheduleGoal.position.x - this.currentGoalPosition.x) > 10 ||
          Math.abs(scheduleGoal.position.y - this.currentGoalPosition.y) > 10)
      ) {
        this.currentGoalPosition = { ...scheduleGoal.position };
        this.navigation.setDestination(pos, this.currentGoalPosition, 60);
        this.isWandering = false;
      }
    }

    // ── Navigation ───────────────────────────────────────────────────────────
    const navResult = this.navigation.getNextMovement(pos, deltaSec);
    this.renderer.setPosition(navResult.position.x, navResult.position.y);
    this.currentDirection = navResult.direction;

    // ── Idle wander (when no schedule or already at destination) ─────────────
    if (navResult.reached) {
      this.idleWanderTimer += delta;
      if (this.idleWanderTimer >= this.nextWanderDelay) {
        this.idleWanderTimer = 0;
        this.nextWanderDelay = Phaser.Math.Between(IDLE_WANDER_INTERVAL_MIN, IDLE_WANDER_INTERVAL_MAX);
        this.isWandering = true;

        // Wander around current goal position, not home position
        const wanderX = this.currentGoalPosition.x + Phaser.Math.Between(-IDLE_WANDER_RADIUS, IDLE_WANDER_RADIUS);
        const wanderY = this.currentGoalPosition.y + Phaser.Math.Between(-IDLE_WANDER_RADIUS, IDLE_WANDER_RADIUS);
        this.navigation.setDestination(navResult.position, { x: wanderX, y: wanderY }, 40);
      }
    } else {
      this.idleWanderTimer = 0;
    }

    // ── Behavior state ───────────────────────────────────────────────────────
    const baseState: NPCBehaviorState = (navResult.reached && !this.isWandering) ? 'idle' : 'walking';
    this.currentState = NPCBehavior.evaluateBehavior(baseState, currentWeather, playerPos, navResult.position);

    // ── Animation ────────────────────────────────────────────────────────────
    const renderState = this.currentState === 'walking' ? 'walking' : 'idle';
    this.renderer.update(time, delta, renderState, this.currentDirection);
  }

  getPosition(): Vector2 {
    const container = this.renderer.getContainer();
    return { x: container.x, y: container.y };
  }

  getDefinition(): NPCDefinition {
    return this.definition;
  }

  getCurrentState(): NPCBehaviorState {
    return this.currentState;
  }

  destroy(): void {
    this.renderer.destroy();
  }
}
