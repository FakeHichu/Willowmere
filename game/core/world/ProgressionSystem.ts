export type ProgressionCallback = (data: unknown) => void;

export interface PlayerStats {
  strength: number;
  dexterity: number;
  intelligence: number;
  vitality: number;
  wisdom: number;
  luck: number;
  maxHealth: number;
  maxStamina: number;
  maxMana: number;
  attackPower: number;
  defense: number;
  magicPower: number;
  criticalChance: number;
  criticalDamage: number;
  attackSpeed: number;
  movementSpeed: number;
  healthRegen: number;
  staminaRegen: number;
  manaRegen: number;
  carryCapacity: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: 'combat' | 'magic' | 'survival' | 'crafting' | 'social';
  tier: number;
  maxLevel: number;
  currentLevel: number;
  xpCost: number[];
  prerequisites: string[];
  effects: SkillEffect[];
  icon: string;
}

export interface SkillEffect {
  type: 'stat_bonus' | 'ability_unlock' | 'passive' | 'active';
  value: number | string | Record<string, number>;
  description: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  slot: 'main_hand' | 'off_hand' | 'head' | 'chest' | 'legs' | 'feet' | 'ring' | 'amulet' | 'belt';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  levelReq: number;
  stats: Partial<PlayerStats>;
  effects: EquipmentEffect[];
  durability: number;
  maxDurability: number;
  value: number;
  description: string;
  icon: string;
}

export interface EquipmentEffect {
  type: 'on_hit' | 'on_kill' | 'on_hit_taken' | 'on_heal' | 'passive' | 'on_crit';
  triggerChance?: number;
  effect?: {
    type: 'damage' | 'heal' | 'buff' | 'debuff' | 'spawn' | 'teleport';
    value: number;
    duration: number;
    target: 'self' | 'target' | 'area';
  };
  cooldown?: number;
  value?: number;
  description?: string;
}

export interface PlayerProgression {
  level: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
  skillPoints: number;
  attributePoints: number;
  
  stats: PlayerStats;
  baseStats: PlayerStats;
  
  skills: Map<string, Skill>;
  activeSkills: string[];
  
  equipment: Map<string, Equipment>;
  equippedItems: Map<string, Equipment | null>;
  
  knownRecipes: string[];
  discoveredLocations: string[];
  completedQuests: string[];
  killedEnemies: Map<string, number>;
  
  playTime: number;
  deaths: number;
}

export interface XPCurve {
  baseXP: number;
  growthFactor: number;
  maxLevel: number;
}

export class ProgressionSystem {
  private scene: Phaser.Scene;
  private progression: PlayerProgression;
  private xpCurve: XPCurve;
  private skillDefinitions: Map<string, Skill> = new Map();
  private equipmentDefinitions: Map<string, Equipment> = new Map();
  private callbacks: Map<string, ProgressionCallback[]> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.xpCurve = { baseXP: 100, growthFactor: 1.15, maxLevel: 100 };
    this.progression = this.createInitialProgression();
    this.initializeSkills();
    this.initializeEquipment();
  }

  private createInitialProgression(): PlayerProgression {
    const baseStats: PlayerStats = {
      strength: 10, dexterity: 10, intelligence: 10, vitality: 10, wisdom: 10, luck: 10,
      maxHealth: 100, maxStamina: 100, maxMana: 50,
      attackPower: 10, defense: 5, magicPower: 5,
      criticalChance: 0.05, criticalDamage: 1.5,
      attackSpeed: 1.0, movementSpeed: 150,
      healthRegen: 1, staminaRegen: 5, manaRegen: 2,
      carryCapacity: 50,
    };

    return {
      level: 1, xp: 0, xpToNext: this.getXPForLevel(2), totalXp: 0,
      skillPoints: 0, attributePoints: 0,
      stats: { ...baseStats }, baseStats: { ...baseStats },
      skills: new Map(), activeSkills: [],
      equipment: new Map(), equippedItems: new Map([
        ['main_hand', null], ['off_hand', null], ['head', null],
        ['chest', null], ['legs', null], ['feet', null],
        ['ring', null], ['amulet', null], ['belt', null],
      ]),
      knownRecipes: [], discoveredLocations: [], completedQuests: [],
      killedEnemies: new Map(), playTime: 0, deaths: 0,
    };
  }

  private initializeSkills(): void {
    const skills: Skill[] = [
      // Combat skills
      {
        id: 'sword_mastery', name: 'Sword Mastery', description: 'Increases damage with swords',
        category: 'combat', tier: 1, maxLevel: 5, currentLevel: 0,
        xpCost: [100, 250, 500, 1000, 2000],
        prerequisites: [], effects: [
          { type: 'stat_bonus', value: { attackPower: 5 }, description: '+5 Attack Power per level' }
        ], icon: 'skill_sword',
      },
      {
        id: 'parry', name: 'Perfect Parry', description: 'Chance to parry attacks',
        category: 'combat', tier: 2, maxLevel: 3, currentLevel: 0,
        xpCost: [500, 1500, 3000],
        prerequisites: ['sword_mastery'], effects: [
          { type: 'ability_unlock', value: 'parry', description: 'Unlock parry ability' },
          { type: 'stat_bonus', value: { criticalChance: 0.02 }, description: '+2% Critical Chance' }
        ], icon: 'skill_parry',
      },
      {
        id: 'whirlwind', name: 'Whirlwind Attack', description: 'Spin attack hitting all nearby enemies',
        category: 'combat', tier: 3, maxLevel: 1, currentLevel: 0,
        xpCost: [2000], prerequisites: ['parry'], effects: [
          { type: 'ability_unlock', value: 'whirlwind', description: 'Unlock Whirlwind ability' }
        ], icon: 'skill_whirlwind',
      },
      
      // Magic skills
      {
        id: 'fire_magic', name: 'Fire Magic', description: 'Basic fire spells',
        category: 'magic', tier: 1, maxLevel: 5, currentLevel: 0,
        xpCost: [100, 250, 500, 1000, 2000],
        prerequisites: [], effects: [
          { type: 'ability_unlock', value: 'fireball', description: 'Unlock Fireball spell' },
          { type: 'stat_bonus', value: { magicPower: 3 }, description: '+3 Magic Power per level' }
        ], icon: 'skill_fire',
      },
      {
        id: 'healing_light', name: 'Healing Light', description: 'Restores health over time',
        category: 'magic', tier: 2, maxLevel: 3, currentLevel: 0,
        xpCost: [500, 1500, 3000], prerequisites: ['fire_magic'], effects: [
          { type: 'ability_unlock', value: 'heal', description: 'Unlock Heal spell' }
        ], icon: 'skill_heal',
      },

      // Survival skills
      {
        id: 'foraging', name: 'Foraging', description: 'Better resource gathering',
        category: 'survival', tier: 1, maxLevel: 5, currentLevel: 0,
        xpCost: [100, 200, 400, 800, 1600],
        prerequisites: [], effects: [
          { type: 'passive', value: 1.2, description: '20% more resources gathered' }
        ], icon: 'skill_forage',
      },
      {
        id: 'cooking', name: 'Cooking', description: 'Create better food',
        category: 'survival', tier: 2, maxLevel: 3, currentLevel: 0,
        xpCost: [300, 800, 2000], prerequisites: ['foraging'], effects: [
          { type: 'ability_unlock', value: 'cook', description: 'Unlock cooking recipes' }
        ], icon: 'skill_cook',
      },

      // Crafting skills
      {
        id: 'blacksmithing', name: 'Blacksmithing', description: 'Craft weapons and armor',
        category: 'crafting', tier: 1, maxLevel: 5, currentLevel: 0,
        xpCost: [200, 500, 1000, 2000, 4000],
        prerequisites: [], effects: [
          { type: 'ability_unlock', value: 'forge', description: 'Unlock forging' },
          { type: 'passive', value: 0.1, description: '10% better crafted stats' }
        ], icon: 'skill_smith',
      },
    ];

    skills.forEach(s => this.skillDefinitions.set(s.id, s));
  }

  private initializeEquipment(): void {
    // This would be loaded from data files in production
    const equipment: Equipment[] = [
      {
        id: 'iron_sword', name: 'Iron Sword', type: 'weapon', slot: 'main_hand',
        rarity: 'common', levelReq: 1, stats: { attackPower: 15 },
        effects: [], durability: 100, maxDurability: 100, value: 50,
        description: 'A basic iron sword', icon: 'eq_sword_iron',
      },
      {
        id: 'steel_sword', name: 'Steel Sword', type: 'weapon', slot: 'main_hand',
        rarity: 'uncommon', levelReq: 5, stats: { attackPower: 30, criticalChance: 0.05 },
        effects: [{ type: 'on_hit', triggerChance: 0.1, effect: { type: 'damage', value: 10, duration: 0, target: 'target' }, cooldown: 2 }],
        durability: 150, maxDurability: 150, value: 200,
        description: 'A well-forged steel blade', icon: 'eq_sword_steel',
      },
      {
        id: 'leather_armor', name: 'Leather Armor', type: 'armor', slot: 'chest',
        rarity: 'common', levelReq: 1, stats: { defense: 8, maxHealth: 20 },
        effects: [], durability: 100, maxDurability: 100, value: 40,
        description: 'Basic leather protection', icon: 'eq_armor_leather',
      },
      {
        id: 'health_ring', name: 'Ring of Vitality', type: 'accessory', slot: 'ring',
        rarity: 'rare', levelReq: 10, stats: { maxHealth: 50, healthRegen: 2 },
        effects: [{ type: 'passive', triggerChance: 1, effect: { type: 'heal', value: 0, duration: 0, target: 'self' }, cooldown: 0, value: 1.5, description: '50% faster health regen' }],
        durability: 0, maxDurability: 0, value: 500,
        description: 'A ring that pulses with life energy', icon: 'eq_ring_health',
      },
    ];

    equipment.forEach(e => this.equipmentDefinitions.set(e.id, e));
  }

  getXPForLevel(level: number): number {
    return Math.floor(this.xpCurve.baseXP * Math.pow(this.xpCurve.growthFactor, level - 1));
  }

  addXP(amount: number): void {
    this.progression.xp += amount;
    this.progression.totalXp += amount;
    
    while (this.progression.xp >= this.progression.xpToNext && this.progression.level < this.xpCurve.maxLevel) {
      this.levelUp();
    }
    
    this.emit('xp_gained', { amount, totalXP: this.progression.totalXp, level: this.progression.level });
  }

  private levelUp(): void {
    this.progression.level++;
    this.progression.xp -= this.progression.xpToNext;
    this.progression.xpToNext = this.getXPForLevel(this.progression.level + 1);
    this.progression.skillPoints += 1;
    this.progression.attributePoints += 2;
    
    // Increase base stats
    this.progression.baseStats.maxHealth += 10;
    this.progression.baseStats.maxStamina += 5;
    this.progression.baseStats.maxMana += 3;
    this.progression.baseStats.attackPower += 1;
    this.progression.baseStats.defense += 1;
    this.progression.baseStats.magicPower += 1;
    
    this.recalculateStats();
    
    this.emit('level_up', { 
      level: this.progression.level, 
      skillPoints: this.progression.skillPoints,
      attributePoints: this.progression.attributePoints,
    });
  }

  addAttributePoint(stat: keyof PlayerStats): boolean {
    if (this.progression.attributePoints <= 0) return false;
    if (!['strength', 'dexterity', 'intelligence', 'vitality', 'wisdom', 'luck'].includes(stat)) return false;
    
    (this.progression.baseStats as unknown as Record<string, number>)[stat]++;
    this.progression.attributePoints--;
    this.recalculateStats();
    this.emit('attribute_increased', { stat, value: this.progression.baseStats[stat] });
    return true;
  }

  learnSkill(skillId: string): boolean {
    const skill = this.skillDefinitions.get(skillId);
    if (!skill) return false;
    if (this.progression.skills.has(skillId)) return false;
    if (this.progression.skillPoints <= 0) return false;
    
    // Check prerequisites
    for (const prereq of skill.prerequisites) {
      const prereqSkill = this.progression.skills.get(prereq);
      if (!prereqSkill || prereqSkill.currentLevel < prereqSkill.maxLevel) return false;
    }

    const newSkill = { ...skill, currentLevel: 1, xpCost: skill.xpCost };
    this.progression.skills.set(skillId, newSkill);
    this.progression.skillPoints--;
    
    this.applySkillEffects(skillId, 1);
    this.emit('skill_learned', { skillId, skill });
    return true;
  }

  upgradeSkill(skillId: string): boolean {
    const skill = this.progression.skills.get(skillId);
    if (!skill) return false;
    if (skill.currentLevel >= skill.maxLevel) return false;
    if (this.progression.skillPoints <= 0) return false;
    
    const nextCost = skill.xpCost[skill.currentLevel - 1];
    if (this.progression.skillPoints < nextCost) return false;

    skill.currentLevel++;
    this.progression.skillPoints -= nextCost;
    
    this.applySkillEffects(skillId, skill.currentLevel);
    this.emit('skill_upgraded', { skillId, level: skill.currentLevel });
    return true;
  }

  private applySkillEffects(skillId: string, level: number): void {
    const skill = this.skillDefinitions.get(skillId);
    if (!skill) return;

    for (const effect of skill.effects) {
      if (effect.type === 'stat_bonus') {
        const bonus = typeof effect.value === 'object' ? effect.value as Record<string, number> : { [effect.description.split('+')[1]?.split(' ')[0]?.toLowerCase() || 'attackPower']: effect.value as number };
        for (const [stat, value] of Object.entries(bonus)) {
          if (stat in this.progression.stats) {
            (this.progression.stats as unknown as Record<string, number>)[stat] += value * level;
          }
        }
      }
    }
    
    this.recalculateStats();
  }

  equipItem(itemId: string, slot: string): boolean {
    const item = this.progression.equipment.get(itemId) || this.equipmentDefinitions.get(itemId);
    if (!item) return false;
    if (this.progression.level < item.levelReq) return false;
    if (item.slot !== slot) return false;

    // Unequip current item in slot
    const current = this.progression.equippedItems.get(slot);
    if (current) this.unequipItem(slot);

    this.progression.equippedItems.set(slot, item);
    this.applyEquipmentStats(item, true);
    this.emit('item_equipped', { itemId, slot });
    return true;
  }

  unequipItem(slot: string): Equipment | null {
    const item = this.progression.equippedItems.get(slot);
    if (!item) return null;

    this.progression.equippedItems.set(slot, null);
    this.applyEquipmentStats(item, false);
    this.emit('item_unequipped', { itemId: item.id, slot });
    return item;
  }

  private applyEquipmentStats(item: Equipment, equip: boolean): void {
    const multiplier = equip ? 1 : -1;
    for (const [stat, value] of Object.entries(item.stats)) {
      if (stat in this.progression.stats && typeof value === 'number') {
        (this.progression.stats as unknown as Record<string, number>)[stat] += value * multiplier;
      }
    }
    this.recalculateStats();
  }

  private recalculateStats(): void {
    // Start with base stats
    this.progression.stats = { ...this.progression.baseStats };
    
    // Apply equipment bonuses
    for (const [, item] of this.progression.equippedItems) {
      if (item) {
        for (const [stat, value] of Object.entries(item.stats)) {
          if (stat in this.progression.stats && typeof value === 'number') {
            (this.progression.stats as unknown as Record<string, number>)[stat] += value;
          }
        }
      }
    }
    
    // Apply active skill effects
    for (const [skillId, skill] of this.progression.skills) {
      if (skill.currentLevel > 0) {
        for (const effect of this.skillDefinitions.get(skillId)?.effects || []) {
          if (effect.type === 'stat_bonus' && typeof effect.value === 'object') {
            for (const [stat, value] of Object.entries(effect.value)) {
              if (stat in this.progression.stats && typeof value === 'number') {
                (this.progression.stats as unknown as Record<string, number>)[stat] += value * skill.currentLevel;
              }
            }
          }
        }
      }
    }
  }

  // Getters
  getProgression(): PlayerProgression { return this.progression; }
  getStats(): PlayerStats { return this.progression.stats; }
  getSkill(skillId: string): Skill | undefined { return this.skillDefinitions.get(skillId); }
  getPlayerSkill(skillId: string): Skill | undefined { return this.progression.skills.get(skillId); }
  getAllSkills(): Skill[] { return Array.from(this.skillDefinitions.values()); }
  getEquipment(itemId: string): Equipment | undefined { return this.equipmentDefinitions.get(itemId); }
  getEquippedItems(): Map<string, Equipment | null> { return this.progression.equippedItems; }

  // Save/Load
  save(): string {
    return JSON.stringify({
      progression: {
        ...this.progression,
        skills: Array.from(this.progression.skills.entries()),
        equipment: Array.from(this.progression.equipment.entries()),
        equippedItems: Array.from(this.progression.equippedItems.entries()),
        killedEnemies: Array.from(this.progression.killedEnemies.entries()),
      },
      skillDefinitions: Array.from(this.skillDefinitions.entries()),
    });
  }

  load(data: string): void {
    const parsed = JSON.parse(data);
    this.progression = {
      ...parsed.progression,
      skills: new Map(parsed.progression.skills),
      equipment: new Map(parsed.progression.equipment),
      equippedItems: new Map(parsed.progression.equippedItems),
      killedEnemies: new Map(parsed.progression.killedEnemies),
    };
    this.recalculateStats();
  }

  // Event system
  on(event: string, callback: ProgressionCallback): void {
    if (!this.callbacks.has(event)) this.callbacks.set(event, []);
    this.callbacks.get(event)!.push(callback);
  }

  off(event: string, callback: ProgressionCallback): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const idx = callbacks.indexOf(callback);
      if (idx >= 0) callbacks.splice(idx, 1);
    }
  }

  private emit(event: string, data: unknown): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) callbacks.forEach(cb => cb(data));
  }

  destroy(): void {
    this.callbacks.clear();
  }
}