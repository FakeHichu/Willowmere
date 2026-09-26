const playerFlags = new Map<string, Set<string>>();

export function setPlayerFlag(playerId: string, flag: string) {
  let flags = playerFlags.get(playerId);
  if (!flags) {
    flags = new Set();
    playerFlags.set(playerId, flags);
  }
  flags.add(flag);
}

export function hasPlayerFlag(playerId: string, flag: string): boolean {
  const flags = playerFlags.get(playerId);
  return flags ? flags.has(flag) : false;
}

export function getPlayerFlags(playerId: string): string[] {
  const flags = playerFlags.get(playerId);
  return flags ? Array.from(flags) : [];
}
