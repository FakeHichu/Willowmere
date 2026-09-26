import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, invalidateSession, clearSessionCookie } from '@backend/auth/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await invalidateSession(token);
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
