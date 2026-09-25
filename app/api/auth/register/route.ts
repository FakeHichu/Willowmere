import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/backend/db';
import { hashPassword, createSession, setSessionCookie } from '@/backend/auth/utils';
import { createPlayer } from '@/backend/players/operations';
import { defaultCustomization } from '@/data/characters';
import type { CharacterCustomization } from '@shared/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, customization } = body;

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Username must be 3-20 characters' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingUser = await prisma.player.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already taken' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create player with password hash
    const playerCustomization: CharacterCustomization = customization || defaultCustomization;

    const player = await prisma.player.create({
      data: {
        username,
        email,
        passwordHash,
        skinTone: playerCustomization.skinTone,
        hair: playerCustomization.hair,
        hairColor: playerCustomization.hairColor,
        top: playerCustomization.top,
        topColor: playerCustomization.topColor,
        bottom: playerCustomization.bottom,
        bottomColor: playerCustomization.bottomColor,
        shoes: playerCustomization.shoes,
        shoesColor: playerCustomization.shoesColor,
        accessory: playerCustomization.accessory,
        accessoryColor: playerCustomization.accessoryColor,
        positionX: 400,
        positionY: 300,
        direction: 'down',
        currency: 0,
      },
    });

    // Create session
    const sessionToken = await createSession({
      userId: player.id,
      username: player.username,
      playerId: player.id,
    });

    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      player: {
        id: player.id,
        username: player.username,
        customization: playerCustomization,
        position: { x: player.positionX, y: player.positionY },
        direction: player.direction,
        currency: player.currency,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}