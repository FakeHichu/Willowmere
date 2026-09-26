import { NextResponse } from 'next/server';
import { prisma } from '@backend/db';
import { comparePassword, createGameSession, setSessionCookie } from '@backend/auth/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const identifier = username || body.email || body.identifier;

    if (!identifier || typeof identifier !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Username/Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanIdentifier, mode: 'insensitive' } },
          { email: { equals: cleanIdentifier.toLowerCase(), mode: 'insensitive' } },
        ],
      },
      include: {
        player: true,
      },
    });

    if (!user || !user.player) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const session = await createGameSession(user.id);
    await setSessionCookie(session.token);

    // Update customization if provided
    let playerRecord = user.player;
    if (body.customization && typeof body.customization === 'object') {
      try {
        playerRecord = await prisma.player.update({
          where: { id: user.player.id },
          data: {
            skinTone: body.customization.skinTone || user.player.skinTone,
            hair: body.customization.hair || user.player.hair,
            hairColor: body.customization.hairColor || user.player.hairColor,
            top: body.customization.top || user.player.top,
            topColor: body.customization.topColor || user.player.topColor,
            bottom: body.customization.bottom || user.player.bottom,
            bottomColor: body.customization.bottomColor || user.player.bottomColor,
            shoes: body.customization.shoes || user.player.shoes,
            shoesColor: body.customization.shoesColor || user.player.shoesColor,
            accessory: body.customization.accessory !== undefined ? body.customization.accessory : user.player.accessory,
            accessoryColor: body.customization.accessoryColor !== undefined ? body.customization.accessoryColor : user.player.accessoryColor,
          },
        });
      } catch (e) {
        console.error('Failed to update player customization on login:', e);
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      player: {
        id: playerRecord.id,
        username: playerRecord.username,
        customization: {
          skinTone: playerRecord.skinTone,
          hair: playerRecord.hair,
          hairColor: playerRecord.hairColor,
          top: playerRecord.top,
          topColor: playerRecord.topColor,
          bottom: playerRecord.bottom,
          bottomColor: playerRecord.bottomColor,
          shoes: playerRecord.shoes,
          shoesColor: playerRecord.shoesColor,
          accessory: playerRecord.accessory,
          accessoryColor: playerRecord.accessoryColor || undefined,
        },
        position: { x: playerRecord.positionX, y: playerRecord.positionY },
        direction: playerRecord.direction,
        currency: playerRecord.currency,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}