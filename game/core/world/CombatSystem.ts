import Phaser from 'phaser';
import type { Vector2, Direction, PlayerState } from '@shared/types';

export interface CombatEntity {
  id: string;
  health: number;
  maxHealth: number;
  attackPower: number;
  defense: number;
  attackSpeed: number;
  attackRange: number;
  knockbackResistance: number;
  invincibilityFrames: number;
  lastHitTime: number;
  isBlocking: boolean;
  blockDirection: Direction | null;
  comboCount: number;
  lastAttackTime: number;
  stamina: number;
  maxStamina: number;
}

export interface AttackData {
  attackerId: string;
  targetId: string;
  damage: number;
  knockback: number;
  hitDirection: Direction;
  attackType: 'light' | 'heavy' | 'special' | 'combo';
  comboIndex: number;
}

export interface CombatEvent {
  type: 'hit' | 'block' | 'parry' | 'dodge' | 'critical' | 'kill' | 'combo';
  attackerId: string;
  targetId: string;
  data: unknown;
}

export type CombatCallback = (data: unknown) => void;

export class CombatSystem {
  private scene: Phaser.Scene;
  private entities: Map<string, CombatEntity> = new Map();
  private eventCallbacks: Map<string, CombatCallback[]> = new Map();
  private hitPauseDuration = 50;
  private screenShakeIntensity = 5;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  registerEntity(id: string, config: Partial<CombatEntity>): CombatEntity {
    const entity: CombatEntity = {
      id,
      health: config.maxHealth ?? 100,
      maxHealth: config.maxHealth ?? 100,
      attackPower: config.attackPower ?? 10,
      defense: config.defense ?? 5,
      attackSpeed: config.attackSpeed ?? 1,
      attackRange: config.attackRange ?? 50,
      knockbackResistance: config.knockbackResistance ?? 0.5,
      invincibilityFrames: config.invincibilityFrames ?? 500,
      lastHitTime: 0,
      isBlocking: false,
      blockDirection: null,
      comboCount: 0,
      lastAttackTime: 0,
      stamina: config.maxStamina ?? 100,
      maxStamina: config.maxStamina ?? 100,
    };
    this.entities.set(id, entity);
    return entity;
  }

  unregisterEntity(id: string): void {
    this.entities.delete(id);
  }

  getEntity(id: string): CombatEntity | undefined {
    return this.entities.get(id);
  }

  canAttack(attackerId: string): boolean {
    const attacker = this.entities.get(attackerId);
    if (!attacker) return false;
    const now = this.scene.time.now;
    return now - attacker.lastAttackTime >= 1000 / attacker.attackSpeed && attacker.stamina >= 10;
  }

  performAttack(attackerId: string, targetId: string, attackType: 'light' | 'heavy' | 'special' = 'light'): AttackData | null {
    const attacker = this.entities.get(attackerId);
    const target = this.entities.get(targetId);
    
    if (!attacker || !target) return null;
    if (!this.canAttack(attackerId)) return null;
    if (attacker.health <= 0 || target.health <= 0) return null;

    const now = this.scene.time.now;
    const distance = this.getDistance(attackerId, targetId);
    if (distance > attacker.attackRange) return null;

    // Stamina cost
    const staminaCost = attackType === 'light' ? 10 : attackType === 'heavy' ? 25 : 40;
    if (attacker.stamina < staminaCost) return null;
    attacker.stamina -= staminaCost;

    // Combo system
    const timeSinceLastAttack = now - attacker.lastAttackTime;
    if (timeSinceLastAttack <= 800 && timeSinceLastAttack >= 100) {
      attacker.comboCount = Math.min(attacker.comboCount + 1, 4);
    } else {
      attacker.comboCount = 0;
    }

    // Calculate damage
    let damage = attacker.attackPower;
    const comboMultiplier = 1 + attacker.comboCount * 0.25;
    damage *= comboMultiplier;
    
    if (attackType === 'heavy') damage *= 1.5;
    if (attackType === 'special') damage *= 2.0;

    // Critical hit chance
    const isCritical = Math.random() < 0.1 + attacker.comboCount * 0.05;
    if (isCritical) damage *= 2;

    // Apply defense
    damage = Math.max(1, damage - target.defense);

    // Block/Parry check
    if (target.isBlocking) {
      const blockAngle = this.getAngleBetween(targetId, attackerId);
      const blockDir = target.blockDirection;
      const canBlock = this.canBlockDirection(blockDir, blockAngle);
      
      if (canBlock) {
        const isParry = Math.abs(this.getAngleDiff(blockAngle, this.directionToAngle(blockDir!))) < 0.3;
        if (isParry) {
          this.emit('parry', { attackerId, targetId, damage: 0 });
          this.applyParry(attackerId, targetId);
          return null;
        } else {
          damage = Math.floor(damage * 0.3);
          this.emit('block', { attackerId, targetId, damage });
        }
      }
    }

    // Apply damage
    target.health = Math.max(0, target.health - damage);
    target.lastHitTime = this.scene.time.now;
    attacker.lastAttackTime = now;

    // Knockback
    const knockback = this.calculateKnockback(attackerId, targetId, damage);
    this.applyKnockback(targetId, knockback);

    // Hit effects
    this.createHitEffects(attackerId, targetId, damage, isCritical);
    this.scene.cameras.main.shake(this.hitPauseDuration * 0.001, this.screenShakeIntensity * (damage / target.maxHealth));
    this.scene.time.delayedCall(this.hitPauseDuration, () => {});

    // Stun target briefly
    this.applyHitStun(targetId, 200 + damage * 2);

    const attackData: AttackData = {
      attackerId,
      targetId,
      damage,
      knockback,
      hitDirection: this.getDirectionBetween(attackerId, targetId),
      attackType,
      comboIndex: attacker.comboCount,
    };

    this.emit('hit', attackData);

    if (target.health <= 0) {
      this.emit('kill', { attackerId, targetId });
      this.onDeath(targetId);
    }

    return attackData;
  }

  startBlock(entityId: string, direction: Direction): void {
    const entity = this.entities.get(entityId);
    if (!entity) return;
    entity.isBlocking = true;
    entity.blockDirection = direction;
    entity.stamina = Math.max(0, entity.stamina - 5);
  }

  stopBlock(entityId: string): void {
    const entity = this.entities.get(entityId);
    if (!entity) return;
    entity.isBlocking = false;
    entity.blockDirection = null;
  }

  dodge(entityId: string, direction: Direction): boolean {
    const entity = this.entities.get(entityId);
    if (!entity || entity.stamina < 20) return false;
    
    entity.stamina -= 20;
    entity.invincibilityFrames = 300;
    
    // Quick dash in direction
    const speed = 500;
    const velocity = this.directionToVector(direction);
    
    this.emit('dodge', { entityId, direction });
    return true;
  }

  heal(entityId: string, amount: number): void {
    const entity = this.entities.get(entityId);
    if (!entity) return;
    entity.health = Math.min(entity.maxHealth, entity.health + amount);
    this.emit('heal', { entityId, amount });
  }

  restoreStamina(entityId: string, amount: number): void {
    const entity = this.entities.get(entityId);
    if (!entity) return;
    entity.stamina = Math.min(entity.maxStamina, entity.stamina + amount);
  }

  update(delta: number): void {
    // Regen stamina
    this.entities.forEach(entity => {
      if (entity.health > 0 && entity.stamina < entity.maxStamina) {
        entity.stamina = Math.min(entity.maxStamina, entity.stamina + delta * 0.1);
      }
      
      // Invincibility frames decay
      if (entity.invincibilityFrames > 0) {
        entity.invincibilityFrames -= delta;
      }
    });
  }

  private getDistance(id1: string, id2: string): number {
    const e1 = this.entities.get(id1);
    const e2 = this.entities.get(id2);
    if (!e1 || !e2) return Infinity;
    // This would need position data from the scene
    return 0; // Placeholder - actual implementation needs position access
  }

  private getDirectionBetween(id1: string, id2: string): Direction {
    // Placeholder - needs actual position data
    return 'down';
  }

  private getAngleBetween(id1: string, id2: string): number {
    return 0; // Placeholder
  }

  private getAngleDiff(a1: number, a2: number): number {
    let diff = Math.abs(a1 - a2);
    if (diff > Math.PI) diff = 2 * Math.PI - diff;
    return diff;
  }

  private directionToAngle(dir: Direction): number {
    const angles: Record<Direction, number> = { up: -Math.PI/2, down: Math.PI/2, left: Math.PI, right: 0 };
    return angles[dir];
  }

  private canBlockDirection(blockDir: Direction | null, attackAngle: number): boolean {
    if (!blockDir) return false;
    const blockAngle = this.directionToAngle(blockDir);
    return this.getAngleDiff(blockAngle, attackAngle) < Math.PI / 3;
  }

  private directionToVector(dir: Direction): Vector2 {
    const vectors: Record<Direction, Vector2> = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    return vectors[dir];
  }

  private calculateKnockback(attackerId: string, targetId: string, damage: number): number {
    const target = this.entities.get(targetId);
    const resist = target?.knockbackResistance ?? 0.5;
    return damage * 2 * (1 - resist);
  }

  private applyKnockback(targetId: string, knockback: number): void {
    this.emit('knockback', { targetId, knockback });
  }

  private applyHitStun(targetId: string, duration: number): void {
    const target = this.entities.get(targetId);
    if (target) target.invincibilityFrames = duration;
    this.emit('hitstun', { targetId, duration });
  }

  private applyParry(attackerId: string, targetId: string): void {
    const attacker = this.entities.get(attackerId);
    if (attacker) {
      attacker.invincibilityFrames = 500;
      attacker.comboCount = 0;
    }
    this.emit('parry_success', { attackerId, targetId });
  }

  private createHitEffects(attackerId: string, targetId: string, damage: number, isCritical: boolean): void {
    this.emit('hit_effect', { attackerId, targetId, damage, isCritical });
  }

  private onDeath(entityId: string): void {
    const entity = this.entities.get(entityId);
    if (entity) entity.health = 0;
    this.emit('death', { entityId });
  }

  // Event system
  on(event: string, callback: CombatCallback): void {
    if (!this.eventCallbacks.has(event)) this.eventCallbacks.set(event, []);
    this.eventCallbacks.get(event)!.push(callback);
  }

  off(event: string, callback: CombatCallback): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      const idx = callbacks.indexOf(callback);
      if (idx >= 0) callbacks.splice(idx, 1);
    }
  }

  private emit(event: string, data: unknown): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) callbacks.forEach(cb => cb(data));
  }

  destroy(): void {
    this.entities.clear();
    this.eventCallbacks.clear();
  }
}