import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db';
import { getSession } from '@/backend/auth/utils';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const player = await prisma.player.findUnique({
      where: { id: session.playerId },
      include: {
        inventory: true,
        quests: true,
      },
    });

    if (!player) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const customization = {
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

    return NextResponse.json({
      authenticated: true,
      player: {
        id: player.id,
        username: player.username,
        customization,
        position: { x: player.positionX, y: player.positionY },
        direction: player.direction,
        currency: player.currency,
        inventory: player.inventory.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
        })),
        quests: player.quests.map(q => ({
          questId: q.questId,
          currentStepId: q.currentStepId,
          status: q.status,
          progress: q.progress,
        })),
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}