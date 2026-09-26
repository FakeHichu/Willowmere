import { NextResponse } from 'next/server';
import { prisma } from '@backend/db';
import { hashPassword, createGameSession, setSessionCookie } from '@backend/auth/auth';
import type { CharacterCustomization } from '@shared/types';
import { defaultCustomization } from '@data/characters';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, customization } = body;

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long.' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check duplicate username or email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanUsername, mode: 'insensitive' } },
          { email: { equals: cleanEmail, mode: 'insensitive' } },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === cleanUsername.toLowerCase()) {
        return NextResponse.json(
          { error: 'Username is already taken.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Email is already registered.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const playerCustomization: CharacterCustomization = {
      ...defaultCustomization,
      ...(customization || {}),
    };

    // Create User, Player, and Session in database
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          username: cleanUsername,
          email: cleanEmail,
          passwordHash,
        },
      });

      const player = await tx.player.create({
        data: {
          userId: user.id,
          username: user.username,
          skinTone: playerCustomization.skinTone,
          hair: playerCustomization.hair,
          hairColor: playerCustomization.hairColor,
          top: playerCustomization.top,
          topColor: playerCustomization.topColor,
          bottom: playerCustomization.bottom,
          bottomColor: playerCustomization.bottomColor,
          shoes: playerCustomization.shoes,
          shoesColor: playerCustomization.shoesColor,
          accessory: playerCustomization.accessory || null,
          accessoryColor: playerCustomization.accessoryColor || null,
          positionX: 400,
          positionY: 300,
          direction: 'down',
          currency: 0,
        },
      });

      return { user, player };
    });

    const session = await createGameSession(result.user.id);
    await setSessionCookie(session.token);

    return NextResponse.json(
      {
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          createdAt: result.user.createdAt,
        },
        player: {
          id: result.player.id,
          username: result.player.username,
          customization: {
            skinTone: result.player.skinTone,
            hair: result.player.hair,
            hairColor: result.player.hairColor,
            top: result.player.top,
            topColor: result.player.topColor,
            bottom: result.player.bottom,
            bottomColor: result.player.bottomColor,
            shoes: result.player.shoes,
            shoesColor: result.player.shoesColor,
            accessory: result.player.accessory,
            accessoryColor: result.player.accessoryColor || undefined,
          },
          position: { x: result.player.positionX, y: result.player.positionY },
          direction: result.player.direction,
          currency: result.player.currency,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration.' },
      { status: 500 }
    );
  }
}