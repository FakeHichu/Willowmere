import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { addInventoryItem } from '../inventory/inventoryService';

export async function getPlayerQuests(playerId: string) {
  return prisma.playerQuest.findMany({
    where: { playerId },
  });
}

export async function acceptQuest(playerId: string, questId: string) {
  const existing = await prisma.playerQuest.findUnique({
    where: {
      playerId_questId: {
        playerId,
        questId,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.playerQuest.create({
    data: {
      playerId,
      questId,
      status: 'active',
      currentStepId: 'step_1',
      progress: {},
    },
  });
}

export async function updateQuestProgress(playerId: string, questId: string, progressData: Record<string, unknown>) {
  return prisma.playerQuest.update({
    where: {
      playerId_questId: {
        playerId,
        questId,
      },
    },
    data: {
      progress: progressData as Prisma.InputJsonValue,
    },
  });
}

export async function completeQuest(playerId: string, questId: string, rewardCurrency: number = 50, rewardItem?: string) {
  const quest = await prisma.playerQuest.update({
    where: {
      playerId_questId: {
        playerId,
        questId,
      },
    },
    data: {
      status: 'completed',
      completedAt: new Date(),
    },
  });

  if (rewardCurrency > 0) {
    await prisma.player.update({
      where: { id: playerId },
      data: { currency: { increment: rewardCurrency } },
    });
  }

  if (rewardItem) {
    await addInventoryItem(playerId, rewardItem, 1);
  }

  return quest;
}
