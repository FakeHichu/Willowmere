import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@backend/db';
import { SESSION_COOKIE_NAME, invalidateSession, clearSessionCookie } from '@backend/auth/auth';
import { getAuthenticatedUser } from '@backend/auth/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await invalidateSession(token);
    }

    // Update player offline status
    const auth = await getAuthenticatedUser(token ?? null);
    if (auth?.player) {
      await prisma.player.update({
        where: { id: auth.player.id },
        data: { isOnline: false, lastOnline: new Date() },
      });
    }

    await clearSessionCookie();

    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during logout.' },
      { status: 500 }
    );
  }
}