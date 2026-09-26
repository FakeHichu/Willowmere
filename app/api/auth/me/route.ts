import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@backend/auth/auth';

export async function GET() {
  try {
    const auth = await getAuthenticatedUser();

    if (!auth || !auth.player) {
      return NextResponse.json(
        { error: 'Unauthenticated' },
        { status: 401 }
      );
    }

    const { user, player } = auth;

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      player: {
        id: player.id,
        username: player.username,
        customization: {
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
          accessoryColor: player.accessoryColor || undefined,
        },
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
        createdAt: player.createdAt,
        updatedAt: player.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}