import { NextResponse } from 'next/server';
import { prisma } from '@backend/db';
import { getAuthenticatedUser } from '@backend/auth/auth';

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth || !auth.player) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const { player } = auth;
  return NextResponse.json({
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
  });
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth || !auth.player) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { customization, position, direction, currency } = body;

    const updateData: Record<string, unknown> = {};

    if (customization && typeof customization === 'object') {
      if (customization.skinTone) updateData.skinTone = customization.skinTone;
      if (customization.hair) updateData.hair = customization.hair;
      if (customization.hairColor) updateData.hairColor = customization.hairColor;
      if (customization.top) updateData.top = customization.top;
      if (customization.topColor) updateData.topColor = customization.topColor;
      if (customization.bottom) updateData.bottom = customization.bottom;
      if (customization.bottomColor) updateData.bottomColor = customization.bottomColor;
      if (customization.shoes) updateData.shoes = customization.shoes;
      if (customization.shoesColor) updateData.shoesColor = customization.shoesColor;
      if (customization.accessory !== undefined) updateData.accessory = customization.accessory;
      if (customization.accessoryColor !== undefined) updateData.accessoryColor = customization.accessoryColor;
    }

    if (position && typeof position === 'object') {
      if (typeof position.x === 'number') updateData.positionX = position.x;
      if (typeof position.y === 'number') updateData.positionY = position.y;
    }

    if (direction && typeof direction === 'string') {
      updateData.direction = direction;
    }

    if (typeof currency === 'number') {
      updateData.currency = currency;
    }

    updateData.lastOnline = new Date();

    const updatedPlayer = await prisma.player.update({
      where: { id: auth.player.id },
      data: updateData,
    });

    return NextResponse.json({
      id: updatedPlayer.id,
      username: updatedPlayer.username,
      customization: {
        skinTone: updatedPlayer.skinTone,
        hair: updatedPlayer.hair,
        hairColor: updatedPlayer.hairColor,
        top: updatedPlayer.top,
        topColor: updatedPlayer.topColor,
        bottom: updatedPlayer.bottom,
        bottomColor: updatedPlayer.bottomColor,
        shoes: updatedPlayer.shoes,
        shoesColor: updatedPlayer.shoesColor,
        accessory: updatedPlayer.accessory,
        accessoryColor: updatedPlayer.accessoryColor || undefined,
      },
      position: { x: updatedPlayer.positionX, y: updatedPlayer.positionY },
      direction: updatedPlayer.direction,
      currency: updatedPlayer.currency,
    });
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred updating player state.' },
      { status: 500 }
    );
  }
}
