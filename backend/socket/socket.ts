import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifySession } from '@/backend/auth/utils';
import { updatePlayerPosition, getPlayerPosition } from '@/backend/players/operations';
import type { NetworkPlayer, Vector2, Direction, PlayerState, CharacterCustomization } from '@shared/types';

interface ConnectedPlayer {
  id: string;
  username: string;
  customization: CharacterCustomization;
  position: Vector2;
  targetPosition: Vector2;
  direction: Direction;
  state: PlayerState;
  socketId: string;
  lastUpdate: number;
  isOnline: boolean;
}

const connectedPlayers = new Map<string, ConnectedPlayer>();
const playerSockets = new Map<string, string>(); // playerId -> socketId

// Movement validation constants
const WORLD_BOUNDS = { width: 1200, height: 900 };
const PLAYER_SPEED = 150;
const MOVEMENT_TICK_RATE = 50; // ms

// Simple collision objects (in production, load from shared data)
const COLLISION_OBJECTS = [
  { x: 320, y: 520, width: 160, height: 96 }, // pond
  { x: 350, y: 280, width: 64, height: 32 }, // bench 1
  { x: 450, y: 280, width: 64, height: 32 }, // bench 2
  { x: 280, y: 480, width: 64, height: 32 }, // bench 3
  { x: 400, y: 180, width: 48, height: 64 }, // notice board
  { x: 100, y: 170, width: 24, height: 32 }, // mailbox 1
  { x: 780, y: 370, width: 24, height: 32 }, // mailbox 2
];

function checkCollision(x: number, y: number, radius: number = 16): boolean {
  // World bounds
  if (x - radius < 0 || x + radius > WORLD_BOUNDS.width ||
      y - radius < 0 || y + radius > WORLD_BOUNDS.height) {
    return true;
  }

  // Object collisions
  for (const obj of COLLISION_OBJECTS) {
    const closestX = Math.max(obj.x, Math.min(x, obj.x + obj.width));
    const closestY = Math.max(obj.y, Math.min(y, obj.y + obj.height));
    const dx = x - closestX;
    const dy = y - closestY;
    if (dx * dx + dy * dy < radius * radius) {
      return true;
    }
  }

  return false;
}

function validateMovement(
  currentPos: Vector2,
  newPos: Vector2,
  direction: Direction,
  timeDelta: number
): { valid: boolean; position: Vector2 } {
  const maxDistance = PLAYER_SPEED * (timeDelta / 1000) * 1.5; // Allow 50% buffer for latency
  const dx = newPos.x - currentPos.x;
  const dy = newPos.y - currentPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > maxDistance) {
    // Clamp to max distance
    const ratio = maxDistance / distance;
    return {
      valid: false,
      position: {
        x: currentPos.x + dx * ratio,
        y: currentPos.y + dy * ratio,
      },
    };
  }

  // Check collision at new position
  if (checkCollision(newPos.x, newPos.y)) {
    return { valid: false, position: currentPos };
  }

  return { valid: true, position: newPos };
}

export function initializeSocketServer(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      // Check for token in auth, headers, or cookies
      const authToken = socket.handshake.auth.token;
      const headerToken = socket.handshake.headers.authorization?.split(' ')[1];
      const cookieToken = socket.handshake.headers.cookie
        ?.split('; ')
        .find(c => c.startsWith('session='))
        ?.split('=')[1];
      
      const token = authToken || headerToken || cookieToken;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const session = await verifySession(token);
      if (!session) {
        return next(new Error('Invalid session'));
      }

      // Attach session to socket
      (socket as any).session = session;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Broadcast to nearby players (interest management)
  function broadcastToNearby(player: ConnectedPlayer, event: string, data: unknown) {
    const radius = 500; // Interest management radius
    
    connectedPlayers.forEach((otherPlayer, otherId) => {
      if (otherId === player.id) return;
      if (!otherPlayer.isOnline) return;

      const dx = otherPlayer.position.x - player.position.x;
      const dy = otherPlayer.position.y - player.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        const socketId = playerSockets.get(otherId);
        if (socketId) {
          io.to(socketId).emit(event, data);
        }
      }
    });
  }

  io.on('connection', (socket: Socket) => {
    const session = (socket as any).session;
    console.log(`Player connected: ${session.username} (${socket.id})`);

    let currentPlayerId: string | null = null;

    // Handle player joining
    socket.on('player_join', async (data: { playerId: string; username: string; customization: CharacterCustomization }) => {
      if (data.playerId !== session.playerId) {
        socket.emit('error', { message: 'Player ID mismatch' });
        return;
      }

      currentPlayerId = data.playerId;

      // Load saved position from database
      const savedPos = await getPlayerPosition(data.playerId);
      const startPosition = savedPos ? { x: savedPos.x, y: savedPos.y } : { x: 400, y: 300 };
      const startDirection = savedPos ? savedPos.direction : 'down';

      // Create player record
      const player: ConnectedPlayer = {
        id: data.playerId,
        username: data.username,
        customization: data.customization,
        position: startPosition,
        targetPosition: startPosition,
        direction: startDirection,
        state: 'idle',
        socketId: socket.id,
        lastUpdate: Date.now(),
        isOnline: true,
      };

      connectedPlayers.set(data.playerId, player);
      playerSockets.set(data.playerId, socket.id);

      // Update database online status
      await updatePlayerPosition(data.playerId, startPosition, startDirection);

      // Send current players to the new player
      const existingPlayers = Array.from(connectedPlayers.values())
        .filter(p => p.id !== data.playerId)
        .map(p => ({
          id: p.id,
          username: p.username,
          customization: p.customization,
          position: p.position,
          targetPosition: p.targetPosition,
          direction: p.direction,
          state: p.state,
          lastUpdate: p.lastUpdate,
          isOnline: p.isOnline,
        }));

      socket.emit('existing_players', existingPlayers);

      // Notify others of new player
      socket.broadcast.emit('player_join', {
        id: player.id,
        username: player.username,
        customization: player.customization,
        position: player.position,
        targetPosition: player.targetPosition,
        direction: player.direction,
        state: player.state,
        lastUpdate: player.lastUpdate,
        isOnline: true,
      });

      console.log(`Player ${data.username} joined at ${startPosition.x}, ${startPosition.y}`);
    });

    // Handle player movement input (server-authoritative)
    socket.on('player_move_input', (data: { position: Vector2; direction: Direction; state: PlayerState; timestamp: number }) => {
      if (!currentPlayerId) return;

      const player = connectedPlayers.get(currentPlayerId);
      if (!player) return;

      const now = Date.now();
      const timeDelta = now - player.lastUpdate;

      // Validate movement
      const validation = validateMovement(player.position, data.position, data.direction, timeDelta);

      // Update player state with validated position
      player.position = validation.position;
      player.targetPosition = validation.position;
      player.direction = data.direction;
      player.state = data.state;
      player.lastUpdate = now;

      // Send correction back to originating player (server-authoritative position)
      socket.emit('player_position_correction', {
        position: player.position,
        direction: player.direction,
        state: player.state,
      });

      // Broadcast to other players in range (interest management)
      broadcastToNearby(player, 'player_move', {
        id: player.id,
        position: player.position,
        targetPosition: player.targetPosition,
        direction: player.direction,
        state: player.state,
        lastUpdate: player.lastUpdate,
      });
    });

    // Handle player chat
    socket.on('player_chat', (data: { message: string }) => {
      if (!currentPlayerId) return;

      const player = connectedPlayers.get(currentPlayerId);
      if (!player) return;

      io.emit('player_chat', {
        playerId: player.id,
        username: player.username,
        message: data.message,
      });
    });

    // Handle player interaction
    socket.on('player_interact', (data: { objectId: string; interactionType: string }) => {
      if (!currentPlayerId) return;

      // Broadcast interaction to nearby players
      const player = connectedPlayers.get(currentPlayerId);
      if (player) {
        broadcastToNearby(player, 'player_interact', {
          playerId: currentPlayerId,
          objectId: data.objectId,
          interactionType: data.interactionType,
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`Player disconnected: ${socket.id}`);

      if (currentPlayerId) {
        const player = connectedPlayers.get(currentPlayerId);
        if (player) {
          // Save position to database
          await updatePlayerPosition(currentPlayerId, player.position, player.direction);

          // Mark as offline but keep in world
          player.isOnline = false;
          player.lastUpdate = Date.now();

          // Notify others of player going offline
          io.emit('player_offline', currentPlayerId);
        }
        playerSockets.delete(currentPlayerId);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Periodic position save to database
  setInterval(async () => {
    for (const [playerId, player] of connectedPlayers) {
      if (player.isOnline) {
        await updatePlayerPosition(playerId, player.position, player.direction);
      }
    }
  }, 30000); // Every 30 seconds

  // Cleanup stale players
  setInterval(() => {
    const now = Date.now();
    const timeout = 60000; // 1 minute timeout

    connectedPlayers.forEach((player, id) => {
      if (now - player.lastUpdate > timeout && player.isOnline) {
        player.isOnline = false;
        io.emit('player_offline', id);
      }
    });
  }, 30000);

  return io;
}

function broadcastToNearby(player: ConnectedPlayer, event: string, data: unknown) {
  const radius = 500; // Interest management radius
  
  connectedPlayers.forEach((otherPlayer, otherId) => {
    if (otherId === player.id) return;
    if (!otherPlayer.isOnline) return;

    const dx = otherPlayer.position.x - player.position.x;
    const dy = otherPlayer.position.y - player.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= radius) {
      const socket = playerSockets.get(otherId);
      if (socket) {
        // We need access to io here - in production, pass io as parameter
      }
    }
  });
}

// Helper function to get nearby players
export function getNearbyPlayers(position: Vector2, radius: number = 200): NetworkPlayer[] {
  return Array.from(connectedPlayers.values())
    .filter(player => {
      if (!player.isOnline) return false;
      const dx = player.position.x - position.x;
      const dy = player.position.y - position.y;
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    })
    .map(player => ({
      id: player.id,
      username: player.username,
      customization: player.customization,
      position: player.position,
      targetPosition: player.targetPosition,
      direction: player.direction,
      state: player.state,
      lastUpdate: player.lastUpdate,
    }));
}