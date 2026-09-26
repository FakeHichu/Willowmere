import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from '../db';

export const SESSION_COOKIE_NAME = 'willowmere_session';
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Hash a plain text password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare a plain text password with a bcrypt hash.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a new database game session for a user and return the token & expiration.
 */
export async function createGameSession(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const session = await prisma.gameSession.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return session;
}

/**
 * Set session HttpOnly cookie on Next.js response.
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(Date.now() + SESSION_DURATION_MS),
  });
}

/**
 * Clear session cookie.
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Invalidate a session token in the database.
 */
export async function invalidateSession(token: string) {
  try {
    await prisma.gameSession.deleteMany({
      where: { token },
    });
  } catch {
    // Ignore if session was already deleted
  }
}

/**
 * Authenticate session from cookies header or Next.js cookie store.
 */
export async function getAuthenticatedUser(tokenOverride?: string | null) {
  let token = tokenOverride;

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {
      // Called outside request context or missing cookies
    }
  }

  if (!token) {
    return null;
  }

  const session = await prisma.gameSession.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          player: {
            include: {
              inventory: true,
              quests: true,
            },
          },
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    // Expired session
    await invalidateSession(token);
    return null;
  }

  return {
    user: {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email,
      createdAt: session.user.createdAt,
    },
    player: session.user.player,
    sessionToken: session.token,
  };
}
