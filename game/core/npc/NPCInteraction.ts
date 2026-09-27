import type { Vector2, NPCDefinition } from '@shared/types';

export class NPCInteraction {
  static getClosestInteractableNPC(playerPos: Vector2, npcs: NPCDefinition[], interactionRadius: number = 60): NPCDefinition | null {
    let closestNPC: NPCDefinition | null = null;
    let minDistance = interactionRadius;

    for (const npc of npcs) {
      const dist = Math.sqrt(
        Math.pow(playerPos.x - npc.position.x, 2) +
        Math.pow(playerPos.y - npc.position.y, 2)
      );

      if (dist <= minDistance) {
        minDistance = dist;
        closestNPC = npc;
      }
    }

    return closestNPC;
  }
}
