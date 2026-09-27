import type { Vector2, NPCBehaviorState } from '@shared/types';

export interface NPCScheduleGoal {
  time: string;
  position: Vector2;
  state: NPCBehaviorState;
  activityLabel: string;
}

export class NPCScheduleSystem {
  static getGoalForTime(schedules: NPCScheduleGoal[] = [], timeStr: string): NPCScheduleGoal | undefined {
    if (!schedules || schedules.length === 0) return undefined;

    // Convert timeStr ("14:30") to minutes
    const currentMins = this.timeToMinutes(timeStr);

    let currentGoal = schedules[0];
    for (const schedule of schedules) {
      const schedMins = this.timeToMinutes(schedule.time);
      if (currentMins >= schedMins) {
        currentGoal = schedule;
      }
    }
    return currentGoal;
  }

  private static timeToMinutes(timeStr: string): number {
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0], 10) || 0;
    const mins = parseInt(parts[1], 10) || 0;
    return hours * 60 + mins;
  }
}
