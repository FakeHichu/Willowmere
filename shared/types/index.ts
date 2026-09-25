// Core type definitions for the Willowmere game
// These types define the data contracts between game systems

// ============================================================================
// Character & Customization
// ============================================================================

export interface CharacterCustomization {
  skinTone: string;
  hair: string;
  hairColor: string;
  top: string;
  topColor: string;
  bottom: string;
  bottomColor: string;
  shoes: string;
  shoesColor: string;
  accessory: string | null;
  accessoryColor?: string;
}

export interface CharacterAppearance {
  id: string;
  name: string;
  category: 'hair' | 'top' | 'bottom' | 'shoes' | 'accessory';
  defaultColor: string;
  colors?: string[];
}

export interface SkinTone {
  id: string;
  name: string;
  hex: string;
}

// ============================================================================
// Player
// ============================================================================

export interface Player {
  id: string;
  username: string;
  customization: CharacterCustomization;
  position: Vector2;
  direction: Direction;
  state: PlayerState;
  currentQuestIds: string[];
  completedQuestIds: string[];
  inventory: InventoryItem[];
  currency: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PlayerState = 'idle' | 'walking' | 'sitting' | 'interacting';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Vector2 {
  x: number;
  y: number;
}

// ============================================================================
// NPC
// ============================================================================

export interface NPCDefinition {
  id: string;
  name: string;
  role: string;
  position: Vector2;
  sprite: string;
  portrait: string;
  personality: string[];
  backstory: string;
  schedule?: NPCSchedule[];
  dialogueTreeId: string;
  questIds: string[];
  relationships?: NPCRelationship[];
}

export interface NPCSchedule {
  time: string;
  position: Vector2;
  action: string;
}

export interface NPCRelationship {
  npcId: string;
  relationship: string;
  level: number;
}

// ============================================================================
// Dialogue
// ============================================================================

export interface DialogueTree {
  id: string;
  npcId: string;
  nodes: DialogueNode[];
}

export interface DialogueNode {
  id: string;
  text: string;
  portrait?: string;
  choices?: DialogueChoice[];
  action?: DialogueAction;
  condition?: DialogueCondition;
}

export interface DialogueChoice {
  id: string;
  text: string;
  nextNodeId: string | null;
  condition?: DialogueCondition;
  action?: DialogueAction;
}

export interface DialogueAction {
  type: 'accept_quest' | 'complete_quest' | 'give_item' | 'update_relationship' | 'trigger_event';
  payload: Record<string, unknown>;
}

export interface DialogueCondition {
  type: 'has_item' | 'quest_active' | 'quest_complete' | 'relationship_level';
  payload: Record<string, unknown>;
}

// ============================================================================
// Quests
// ============================================================================

export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  giverNpcId: string;
  steps: QuestStep[];
  rewards: QuestReward[];
  prerequisites?: string[];
  timeLimit?: number;
}

export interface QuestStep {
  id: string;
  type: 'talk' | 'collect' | 'deliver' | 'explore' | 'interact' | 'reach';
  targetId: string;
  itemId?: string;
  targetPosition?: Vector2;
  quantity?: number;
  description: string;
  nextStepId: string | null;
}

export interface QuestReward {
  type: 'item' | 'currency' | 'relationship';
  itemId?: string;
  quantity: number;
  npcId?: string;
}

export interface QuestState {
  questId: string;
  currentStepId: string;
  progress: Record<string, number>;
  startedAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'failed';
}

// ============================================================================
// Items & Inventory
// ============================================================================

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  category: 'flower' | 'vegetable' | 'tool' | 'food' | 'gift' | 'material' | 'key';
  stackable: boolean;
  maxStack: number;
  value: number;
  sprite: string;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

// ============================================================================
// World & Map
// ============================================================================

export interface WorldMap {
  id: string;
  name: string;
  width: number;
  height: number;
  tileSize: number;
  layers: MapLayer[];
  objects: WorldObject[];
  spawnPoint: Vector2;
  ambientColor: string;
}

export interface MapLayer {
  id: string;
  name: string;
  type: 'tile' | 'object';
  data: number[][];
  opacity: number;
  visible: boolean;
}

export interface WorldObject {
  id: string;
  type: string;
  position: Vector2;
  size: Vector2;
  sprite: string;
  collision: boolean;
  interactions: InteractionDefinition[];
  properties?: Record<string, unknown>;
}

// ============================================================================
// Interactions
// ============================================================================

export interface InteractionDefinition {
  type: string;
  label: string;
  key?: string;
  action?: InteractionAction;
  condition?: InteractionCondition;
}

export interface InteractionAction {
  type: 'sit' | 'pickup' | 'inspect' | 'talk' | 'open' | 'use';
  payload?: Record<string, unknown>;
}

export interface InteractionCondition {
  type: 'has_item' | 'quest_active' | 'time_of_day' | 'player_state';
  payload: Record<string, unknown>;
}

export interface InteractionResult {
  success: boolean;
  message?: string;
  effects?: InteractionEffect[];
}

export interface InteractionEffect {
  type: 'give_item' | 'remove_item' | 'start_quest' | 'update_state' | 'show_message';
  payload: Record<string, unknown>;
}

// ============================================================================
// Multiplayer
// ============================================================================

export interface NetworkPlayer {
  id: string;
  username: string;
  customization: CharacterCustomization;
  position: Vector2;
  targetPosition: Vector2;
  direction: Direction;
  state: PlayerState;
  lastUpdate: number;
}

export interface NetworkMessage {
  type: 'player_join' | 'player_leave' | 'player_move' | 'player_state' | 'player_chat';
  payload: unknown;
  timestamp: number;
}

// ============================================================================
// UI State
// ============================================================================

export interface UIState {
  dialogueOpen: boolean;
  currentDialogue: DialogueTree | null;
  currentNodeId: string | null;
  questLogOpen: boolean;
  inventoryOpen: boolean;
  settingsOpen: boolean;
  interactionPrompt: InteractionPrompt | null;
}

export interface InteractionPrompt {
  objectId: string;
  objectName: string;
  interactions: InteractionDefinition[];
}
