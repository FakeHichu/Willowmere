import { prisma } from '../db';

export async function getPlayerInventory(playerId: string) {
  const items = await prisma.inventoryItem.findMany({
    where: { playerId },
  });
  return items.map(i => ({
    itemId: i.itemId,
    quantity: i.quantity,
  }));
}

export async function addInventoryItem(playerId: string, itemId: string, quantity: number = 1) {
  const existing = await prisma.inventoryItem.findUnique({
    where: {
      playerId_itemId: {
        playerId,
        itemId,
      },
    },
  });

  if (existing) {
    const updated = await prisma.inventoryItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
    return updated;
  }

  const created = await prisma.inventoryItem.create({
    data: {
      playerId,
      itemId,
      quantity,
    },
  });

  return created;
}

export async function removeInventoryItem(playerId: string, itemId: string, quantity: number = 1) {
  const existing = await prisma.inventoryItem.findUnique({
    where: {
      playerId_itemId: {
        playerId,
        itemId,
      },
    },
  });

  if (!existing || existing.quantity < quantity) {
    return false;
  }

  if (existing.quantity === quantity) {
    await prisma.inventoryItem.delete({
      where: { id: existing.id },
    });
  } else {
    await prisma.inventoryItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity - quantity },
    });
  }

  return true;
}
