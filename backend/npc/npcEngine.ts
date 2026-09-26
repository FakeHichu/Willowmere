import type { Vector2, Direction } from '@shared/types';
import { npcs } from '@data/npcs';
import { findPath } from '../navigation/pathfinding';
import { getGameTime } from '../time/clock';

export interface LiveNPCState {
  id: string;
  name: string;
  position: Vector2;
  targetPosition: Vector2;
  direction: Direction;
  isMoving: boolean;
  currentAction: string;
  path: Vector2[];
}

const liveNPCs = new Map<string, LiveNPCState>();

// Initialize live NPC state
for (const npc of npcs) {
  liveNPCs.set(npc.id, {
    id: npc.id,
    name: npc.name,
    position: { ...npc.position },
    targetPosition: { ...npc.position },
    direction: 'down',
    isMoving: false,
    currentAction: 'idle',
    path: [],
  });
}

export function updateNPCSchedules(): LiveNPCState[] {
  const time = getGameTime();
  const timeStr = `${time.hour < 10 ? '0' + time.hour : time.hour}:${time.minute < 10 ? '0' + time.minute : time.minute}`;

  const updatedNPCs: LiveNPCState[] = [];

  liveNPCs.forEach((npcState) => {
    const npcDef = npcs.find(n => n.id === npcState.id);
    if (!npcDef || !npcDef.schedule) return;

    // Determine current schedule item based on current time
    let activeScheduleItem = npcDef.schedule[0];
    for (const item of npcDef.schedule) {
      if (timeStr >= item.time) {
        activeScheduleItem = item;
      }
    }

    if (activeScheduleItem) {
      const dist = Math.hypot(
        activeScheduleItem.position.x - npcState.position.x,
        activeScheduleItem.position.y - npcState.position.y
      );

      if (dist > 16 && !npcState.isMoving) {
        // Find path to target position
        npcState.targetPosition = activeScheduleItem.position;
        npcState.currentAction = activeScheduleItem.action;
        npcState.path = findPath(npcState.position, activeScheduleItem.position);
        npcState.isMoving = true;
      }
    }

    // Step NPC along current path if moving
    if (npcState.isMoving && npcState.path.length > 0) {
      const nextWaypoint = npcState.path[0];
      const stepDist = 2; // NPC movement speed per tick

      const dx = nextWaypoint.x - npcState.position.x;
      const dy = nextWaypoint.y - npcState.position.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= stepDist) {
        npcState.position = { ...nextWaypoint };
        npcState.path.shift();
        if (npcState.path.length === 0) {
          npcState.isMoving = false;
        }
      } else {
        npcState.position.x += (dx / distance) * stepDist;
        npcState.position.y += (dy / distance) * stepDist;

        // Set direction
        if (Math.abs(dx) > Math.abs(dy)) {
          npcState.direction = dx > 0 ? 'right' : 'left';
        } else {
          npcState.direction = dy > 0 ? 'down' : 'up';
        }
      }

      updatedNPCs.push(npcState);
    }
  });

  return Array.from(liveNPCs.values());
}

export function getAllNPCStates(): LiveNPCState[] {
  return Array.from(liveNPCs.values());
}
