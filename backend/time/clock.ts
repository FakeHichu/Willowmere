export interface GameTime {
  day: number;
  hour: number;
  minute: number;
  timeString: string; // e.g. "Day 1, 08:30 AM"
  period: 'morning' | 'day' | 'evening' | 'night';
}

let gameDay = 1;
let gameHour = 8;
let gameMinute = 0;

// 1 real second = 1 game minute
const TICK_INTERVAL_MS = 1000;

let intervalId: NodeJS.Timeout | null = null;
const tickCallbacks: ((time: GameTime) => void)[] = [];

export function startGameClock(onTick?: (time: GameTime) => void) {
  if (onTick) {
    tickCallbacks.push(onTick);
  }

  if (intervalId) return;

  intervalId = setInterval(() => {
    gameMinute += 1;
    if (gameMinute >= 60) {
      gameMinute = 0;
      gameHour += 1;
      if (gameHour >= 24) {
        gameHour = 0;
        gameDay += 1;
      }
    }

    const current = getGameTime();
    tickCallbacks.forEach(cb => cb(current));
  }, TICK_INTERVAL_MS);
}

export function getGameTime(): GameTime {
  const period = getPeriod(gameHour);
  const formattedHour = gameHour % 12 === 0 ? 12 : gameHour % 12;
  const ampm = gameHour >= 12 ? 'PM' : 'AM';
  const minuteStr = gameMinute < 10 ? `0${gameMinute}` : `${gameMinute}`;
  const timeString = `Day ${gameDay}, ${formattedHour}:${minuteStr} ${ampm}`;

  return {
    day: gameDay,
    hour: gameHour,
    minute: gameMinute,
    timeString,
    period,
  };
}

function getPeriod(hour: number): 'morning' | 'day' | 'evening' | 'night' {
  if (hour >= 5 && hour < 9) return 'morning';
  if (hour >= 9 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}
