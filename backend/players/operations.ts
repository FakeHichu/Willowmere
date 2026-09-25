import { prisma } from '@/backend/db';
import type { CharacterCustomization, Vector2, Direction } from '@shared/types';

export interface CreatePlayerData {
  userId: string;
  username: string;
  passwordHash: string;
  customization: CharacterCustomization;
  position?: Vector2;
  direction?: Direction;
}

export interface UpdatePlayerData {
  position?: Vector2;
  direction?: Direction;
  customization?: Partial<CharacterCustomization>;
  currency?: number;
  lastOnline?: Date;
}

export async function createPlayer(data: CreatePlayerData & { passwordHash: string }) {
  return prisma.player.create({
    data: {
      id: data.userId,
      username: data.username,
      passwordHash: data.passwordHash,
      skinTone: data.customization.skinTone,
      hair: data.customization.hair,
      hairColor: data.customization.hairColor,
      top: data.customization.top,
      topColor: data.customization.topColor,
      bottom: data.customization.bottom,
      bottomColor: data.customization.bottomColor,
      shoes: data.customization.shoes,
      shoesColor: data.customization.shoesColor,
      accessory: data.customization.accessory,
      accessoryColor: data.customization.accessoryColor,
      positionX: data.position?.x ?? 400,
      positionY: data.position?.y ?? 300,
      direction: data.direction ?? 'down',
      currency: 0,
    },
  });
}

export async function getPlayerById(playerId: string) {
  return prisma.player.findUnique({
    where: { id: playerId },
    include: {
      inventory: true,
      quests: true,
    },
  });
}

export async function getPlayerByUsername(username: string) {
  return prisma.player.findUnique({
    where: { username },
  });
}

export async function updatePlayer(playerId: string, data: UpdatePlayerData) {
  const updateData: Record<string, unknown> = {};

  if (data.position) {
    updateData.positionX = data.position.x;
    updateData.positionY = data.position.y;
  }
  if (data.direction) {
    updateData.direction = data.direction;
  }
  if (data.customization) {
    if (data.customization.skinTone) updateData.skinTone = data.customization.skinTone;
    if (data.customization.hair) updateData.hair = data.customization.hair;
    if (data.customization.hairColor) updateData.hairColor = data.customization.hairColor;
    if (data.customization.top) updateData.top = data.customization.top;
    if (data.customization.topColor) updateData.topColor = data.customization.topColor;
    if (data.customization.bottom) updateData.bottom = data.customization.bottom;
    if (data.customization.bottomColor) updateData.bottomColor = data.customization.bottomColor;
    if (data.customization.shoes) updateData.shoes = data.customization.shoes;
    if (data.customization.shoesColor) updateData.shoesColor = data.customization.shoesColor;
    if (data.customization.accessory !== undefined) updateData.accessory = data.customization.accessory;
    if (data.customization.accessoryColor !== undefined) updateData.accessoryColor = data.customization.accessoryColor;
  }
  if (data.currency !== undefined) {
    updateData.currency = data.currency;
  }
  if (data.lastOnline) {
    updateData.lastOnline = data.lastOnline;
  }

  return prisma.player.update({
    where: { id: playerId },
    data: updateData,
  });
}

export async function updatePlayerPosition(playerId: string, position: Vector2, direction: Direction) {
  return prisma.player.update({
    where: { id: playerId },
    data: {
      positionX: position.x,
      positionY: position.y,
      direction,
      lastOnline: new Date(),
    },
  });
}

export async function updatePlayerCurrency(playerId: string, amount: number) {
  return prisma.player.update({
    where: { id: playerId },
    data: {
      currency: { increment: amount },
    },
  });
}

export async function getPlayerCustomization(playerId: string): Promise<CharacterCustomization | null> {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: {
      skinTone: true,
      hair: true,
      hairColor: true,
      top: true,
      topColor: true,
      bottom: true,
      bottomColor: true,
      shoes: true,
      shoesColor: true,
      accessory: true,
      accessoryColor: true,
    },
  });

  if (!player) return null;

  return {
    skinTone: player.skinTone,
    hair: player.hair,
    hairColor: player.hairColor,
    top: player.top,
    topColor: player.topColor,
    bottom: player.bottom,
    bottomColor: player.bottomColor,
    shoes: player.shoes,
    shoesColor: player.shoesColor,
    accessory: player.accessory,
    accessoryColor: player.accessoryColor ?? undefined,
  };
}

export async function getPlayerPosition(playerId: string): Promise<{ x: number; y: number; direction: Direction } | null> {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: {
      positionX: true,
      positionY: true,
      direction: true,
    },
  });

  if (!player) return null;

  return {
    x: player.positionX,
    y: player.positionY,
    direction: player.direction as Direction,
  };
}