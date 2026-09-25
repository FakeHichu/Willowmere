import { NextResponse } from 'next/server';
import { prisma } from '@/backend/db';
import { getSession, clearSessionCookie } from '@/backend/auth/utils';

export async function POST() {
  try {
    const session = await getSession();
    
    if (session) {
      // Update player offline status
      await prisma.player.update({
        where: { id: session.playerId },
        data: { isOnline: false, lastOnline: new Date() },
      });
    }

    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}