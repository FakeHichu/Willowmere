import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/db';
import { verifyPassword, createSession, setSessionCookie } from '@/backend/auth/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find player by username
    const player = await prisma.player.findUnique({
      where: { username },
    });

    if (!player) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, player.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = await createSession({
      userId: player.id,
      username: player.username,
      playerId: player.id,
    });

    await setSessionCookie(sessionToken);

    // Update online status
    await prisma.player.update({
      where: { id: player.id },
      data: { isOnline: true, lastOnline: new Date() },
    });

    // Get customization
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
      success: true,
      player: {
        id: player.id,
        username: player.username,
        customization,
        position: { x: player.positionX, y: player.positionY },
        direction: player.direction,
        currency: player.currency,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}