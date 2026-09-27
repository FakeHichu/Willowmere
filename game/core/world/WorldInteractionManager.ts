import Phaser from 'phaser';
import { worldObjects, getObjectById } from '@data/world/objects';
import { landmarks, getLandmarksAtPosition, Landmark, LandmarkInteraction } from '@data/world/landmarks';
import { buildingEntrances, getBuildingAtPosition, BuildingEntrance } from '@data/world/entrances';
import { npcs, getNpcsAtPosition } from '@data/npcs';
import { regionEntrances, getEntranceAtPosition, RegionEntrance, EntranceInteraction } from '@data/world/entrances';
import { INTERACTION_RADIUS } from '@game/core/GameConfig';
import type { Vector2, InteractionDefinition, NPCDefinition, WorldObject, InteractionAction } from '@shared/types';

export interface InteractionTarget {
  type: 'object' | 'npc' | 'landmark' | 'building' | 'region_entrance';
  id: string;
  name: string;
  position: Vector2;
  distance: number;
  interactions: InteractionDefinition[];
  data?: Record<string, unknown>;
}

export class WorldInteractionManager {
  private scene: Phaser.Scene;
  private interactionPrompt?: Phaser.GameObjects.Container;
  private currentTarget: InteractionTarget | null = null;
  private interactionKey!: Phaser.Input.Keyboard.Key;
  private interactionKeyF!: Phaser.Input.Keyboard.Key;
  private emitter: Phaser.Events.EventEmitter;
  private showExtendedMenu = false;
  private extendedMenu?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, emitter: Phaser.Events.EventEmitter) {
    this.scene = scene;
    this.emitter = emitter;
  }

  private convertLandmarkInteractions(interactions: LandmarkInteraction[]): InteractionDefinition[] {
    return interactions.map(i => ({
      type: i.type,
      label: i.label,
      key: i.key,
      action: i.action ? { type: i.action as InteractionAction['type'], payload: {} } : undefined,
      condition: i.condition ? { type: 'has_item', payload: i.condition } : undefined,
    }));
  }

  private convertEntranceInteractions(interactions: EntranceInteraction[]): InteractionDefinition[] {
    return interactions.map(i => ({
      type: i.type,
      label: i.label,
      key: i.key,
      action: i.action ? { type: i.action as InteractionAction['type'], payload: {} } : undefined,
      condition: undefined,
    }));
  }

  create(): void {
    this.interactionKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.interactionKeyF = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.createInteractionPrompt();
  }

  private createInteractionPrompt(): void {
    this.interactionPrompt = this.scene.add.container(400, 520);
    this.interactionPrompt.setScrollFactor(0);
    this.interactionPrompt.setDepth(1001);
    this.interactionPrompt.setVisible(false);
    this.interactionPrompt.setAlpha(0);
  }

  update(playerPosition: Vector2): void {
    const target = this.findNearestInteraction(playerPosition);

    if (target !== this.currentTarget) {
      this.currentTarget = target;
      this.showExtendedMenu = false;
      if (target) {
        this.showInteractionPrompt(target);
      } else {
        this.hideInteractionPrompt();
      }
    }

    // Handle extended menu toggle (F key)
    if (this.currentTarget && this.currentTarget.interactions.length > 1) {
      if (Phaser.Input.Keyboard.JustDown(this.interactionKeyF)) {
        this.showExtendedMenu = !this.showExtendedMenu;
        if (this.showExtendedMenu) {
          this.showExtendedInteractionMenu(this.currentTarget);
        } else {
          this.hideExtendedMenu();
        }
      }
    } else {
      this.hideExtendedMenu();
    }

    // Execute primary interaction (E key)
    if (this.currentTarget && Phaser.Input.Keyboard.JustDown(this.interactionKey)) {
      this.executeInteraction(this.currentTarget);
    }

    // Execute extended menu selection (number keys 1-9)
    if (this.showExtendedMenu && this.extendedMenu) {
      for (let i = 0; i < this.currentTarget!.interactions.length; i++) {
        const numKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE + i);
        if (Phaser.Input.Keyboard.JustDown(numKey)) {
          this.executeExtendedInteraction(this.currentTarget!, i);
          break;
        }
      }
    }
  }

  private findNearestInteraction(playerPosition: Vector2): InteractionTarget | null {
    let nearest: InteractionTarget | null = null;
    let nearestDistance = INTERACTION_RADIUS;

    const nearbyObjects = worldObjects.filter(obj => {
      const dx = obj.position.x - playerPosition.x;
      const dy = obj.position.y - playerPosition.y;
      return Math.sqrt(dx * dx + dy * dy) <= INTERACTION_RADIUS;
    });

    for (const obj of nearbyObjects) {
      if (obj.interactions && obj.interactions.length > 0) {
        const dx = obj.position.x - playerPosition.x;
        const dy = obj.position.y - playerPosition.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < nearestDistance) {
          nearestDistance = dist;
          nearest = {
            type: obj.type === 'building' ? 'building' : 'object',
            id: obj.id,
            name: obj.properties?.label as string || obj.type,
            position: obj.position,
            distance: dist,
            interactions: obj.interactions,
            data: obj.properties,
          };
        }
      }
    }

    const nearbyNpcs = getNpcsAtPosition(playerPosition, INTERACTION_RADIUS);
    for (const npc of nearbyNpcs) {
      const dx = npc.position.x - playerPosition.x;
      const dy = npc.position.y - playerPosition.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearest = {
          type: 'npc',
          id: npc.id,
          name: npc.name,
          position: npc.position,
          distance: dist,
          interactions: [{ type: 'talk', label: 'Talk', key: 'E' }],
          data: { npc },
        };
      }
    }

    const nearbyLandmarks = getLandmarksAtPosition(playerPosition, INTERACTION_RADIUS);
    for (const landmark of nearbyLandmarks) {
      if (landmark.interactions && landmark.interactions.length > 0) {
        const dx = landmark.position.x - playerPosition.x;
        const dy = landmark.position.y - playerPosition.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < nearestDistance) {
          nearestDistance = dist;
          nearest = {
            type: 'landmark',
            id: landmark.id,
            name: landmark.name,
            position: landmark.position,
            distance: dist,
            interactions: this.convertLandmarkInteractions(landmark.interactions),
            data: landmark.properties,
          };
        }
      }
    }

    const buildingEntrance = getBuildingAtPosition(playerPosition, INTERACTION_RADIUS);
    if (buildingEntrance) {
      const dx = buildingEntrance.exteriorPosition.x - playerPosition.x;
      const dy = buildingEntrance.exteriorPosition.y - playerPosition.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearest = {
          type: 'building',
          id: buildingEntrance.buildingId,
          name: buildingEntrance.interiorName,
          position: buildingEntrance.exteriorPosition,
          distance: dist,
          interactions: [{ type: 'open', label: 'Enter', key: 'E' }],
          data: { buildingEntrance },
        };
      }
    }

    const regionEntrance = getEntranceAtPosition(playerPosition, INTERACTION_RADIUS);
    if (regionEntrance && regionEntrance.discovered) {
      const dx = regionEntrance.position.x - playerPosition.x;
      const dy = regionEntrance.position.y - playerPosition.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearest = {
          type: 'region_entrance',
          id: regionEntrance.id,
          name: regionEntrance.name,
          position: regionEntrance.position,
          distance: dist,
          interactions: this.convertEntranceInteractions(regionEntrance.interactions),
          data: { regionEntrance },
        };
      }
    }

    return nearest;
  }

  private showInteractionPrompt(target: InteractionTarget): void {
    if (!this.interactionPrompt || !target.interactions.length) return;

    this.interactionPrompt.removeAll(true);

    const primaryInteraction = target.interactions[0];
    const label = primaryInteraction.label;

    const bg = this.scene.add.rectangle(0, 0, 160, 40, 0x000000, 0.85);
    bg.setStrokeStyle(2, 0xffd700);

    const text = this.scene.add.text(0, 0, `E - ${label}`, {
      fontSize: '16px',
      color: '#ffd700',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    if (target.interactions.length > 1) {
      const hintText = this.scene.add.text(0, 25, `Hold F for more`, {
        fontSize: '10px',
        color: '#aaaaaa',
      }).setOrigin(0.5);
      this.interactionPrompt.add(hintText);
    }

    this.interactionPrompt.add([bg, text]);
    this.interactionPrompt.setPosition(400, 520);
    this.interactionPrompt.setVisible(true);

    this.scene.tweens.add({
      targets: this.interactionPrompt,
      alpha: 1,
      y: 500,
      duration: 200,
      ease: 'Power2',
    });
  }

  private hideInteractionPrompt(): void {
    if (!this.interactionPrompt) return;

    this.scene.tweens.add({
      targets: this.interactionPrompt,
      alpha: 0,
      y: 540,
      duration: 150,
      ease: 'Power2',
      onComplete: () => {
        this.interactionPrompt?.setVisible(false);
        this.interactionPrompt?.removeAll(true);
      },
    });
  }

  private showExtendedInteractionMenu(target: InteractionTarget): void {
    if (!target || target.interactions.length <= 1) return;

    this.extendedMenu = this.scene.add.container(400, 400);
    this.extendedMenu.setScrollFactor(0);
    this.extendedMenu.setDepth(1002);
    this.extendedMenu.setAlpha(0);

    const bg = this.scene.add.rectangle(0, 0, 240, 30 + target.interactions.length * 35, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0xffd700);
    this.extendedMenu.add(bg);

    const title = this.scene.add.text(0, -bg.height / 2 + 18, `Interact with ${target.name}`, {
      fontSize: '14px',
      color: '#ffd700',
      fontFamily: 'Georgia, serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.extendedMenu.add(title);

    target.interactions.forEach((interaction, index) => {
      const y = -bg.height / 2 + 45 + index * 35;
      
      const itemBg = this.scene.add.rectangle(0, y, 220, 30, 0x2a2a3e, 0.9);
      itemBg.setStrokeStyle(1, 0x444455);
      itemBg.setInteractive({ useHandCursor: true });
      
      const keyText = this.scene.add.text(-100, y, `${index + 1}.`, {
        fontSize: '13px',
        color: '#ffd700',
        fontFamily: 'Georgia, serif',
        fontStyle: 'bold',
      }).setOrigin(0.5, 0.5);
      
      const labelText = this.scene.add.text(-80, y, interaction.label, {
        fontSize: '13px',
        color: '#ffffff',
        fontFamily: 'Georgia, serif',
      }).setOrigin(0, 0.5);

      const keyHint = this.scene.add.text(100, y, `[${interaction.key || 'E'}]`, {
        fontSize: '11px',
        color: '#8888aa',
        fontFamily: 'Georgia, serif',
      }).setOrigin(1, 0.5);

      itemBg.on('pointerover', () => itemBg.setFillStyle(0x3a3a5e, 0.9));
      itemBg.on('pointerout', () => itemBg.setFillStyle(0x2a2a3e, 0.9));
      itemBg.on('pointerdown', () => this.executeExtendedInteraction(target, index));

      this.extendedMenu!.add([itemBg, keyText, labelText, keyHint]);
    });

    this.scene.tweens.add({
      targets: this.extendedMenu,
      alpha: 1,
      duration: 150,
      ease: 'Power2',
    });
  }

  private hideExtendedMenu(): void {
    if (!this.extendedMenu) return;

    this.scene.tweens.add({
      targets: this.extendedMenu,
      alpha: 0,
      duration: 100,
      ease: 'Power2',
      onComplete: () => {
        this.extendedMenu?.destroy();
        this.extendedMenu = undefined;
      },
    });
  }

  private executeExtendedInteraction(target: InteractionTarget, index: number): void {
    if (index >= target.interactions.length) return;
    
    const interaction = target.interactions[index];

    switch (target.type) {
      case 'npc':
        this.emitter.emit('start_dialogue', { npcId: target.id });
        break;
      case 'object':
        this.emitter.emit('interact_object', {
          objectId: target.id,
          interactionType: interaction.type,
          interaction: interaction,
        });
        break;
      case 'landmark':
        this.emitter.emit('interact_landmark', {
          landmarkId: target.id,
          interactionType: interaction.type,
          interaction: interaction,
        });
        break;
      case 'building':
        const buildingData = target.data?.buildingEntrance as BuildingEntrance;
        if (buildingData) {
          this.emitter.emit('request_enter_building', { buildingId: buildingData.buildingId });
        }
        break;
      case 'region_entrance':
        const entranceData = target.data?.regionEntrance as RegionEntrance;
        if (entranceData) {
          this.emitter.emit('request_region_travel', {
            fromRegion: entranceData.fromRegion,
            toRegion: entranceData.toRegion,
            entranceId: entranceData.id,
          });
        }
        break;
    }

    this.hideInteractionPrompt();
    this.hideExtendedMenu();
    this.showExtendedMenu = false;
  }

  private executeInteraction(target: InteractionTarget): void {
    const primaryInteraction = target.interactions[0];

    switch (target.type) {
      case 'npc':
        this.emitter.emit('start_dialogue', { npcId: target.id });
        break;

      case 'object':
        this.emitter.emit('interact_object', {
          objectId: target.id,
          interactionType: primaryInteraction.type,
          interaction: primaryInteraction,
        });
        break;

      case 'landmark':
        this.emitter.emit('interact_landmark', {
          landmarkId: target.id,
          interactionType: primaryInteraction.type,
          interaction: primaryInteraction,
        });
        break;

      case 'building':
        const buildingData = target.data?.buildingEntrance as BuildingEntrance;
        if (buildingData) {
          this.emitter.emit('request_enter_building', {
            buildingId: buildingData.buildingId,
          });
        }
        break;

      case 'region_entrance':
        const entranceData = target.data?.regionEntrance as RegionEntrance;
        if (entranceData) {
          this.emitter.emit('request_region_travel', {
            fromRegion: entranceData.fromRegion,
            toRegion: entranceData.toRegion,
            entranceId: entranceData.id,
          });
        }
        break;
    }

    this.hideInteractionPrompt();
  }

  getCurrentTarget(): InteractionTarget | null {
    return this.currentTarget;
  }

  forceHidePrompt(): void {
    this.hideInteractionPrompt();
    this.currentTarget = null;
  }

  destroy(): void {
    this.interactionPrompt?.destroy();
  }
}