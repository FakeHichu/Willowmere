export interface GlobalEvent {
  id: string;
  name: string;
  active: boolean;
  description: string;
}

let activeEvent: GlobalEvent | null = null;

export function triggerGlobalEvent(event: GlobalEvent) {
  activeEvent = event;
}

export function clearGlobalEvent() {
  activeEvent = null;
}

export function getActiveGlobalEvent(): GlobalEvent | null {
  return activeEvent;
}
