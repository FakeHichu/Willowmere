import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
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
}

// In-memory player storage (replace with database in production)
const connectedPlayers = new Map<string, ConnectedPlayer>();

export function initializeSocketServer(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    let currentPlayerId: string | null = null;

    // Handle player joining
    socket.on('player_join', (data: { playerId: string; username: string; customization: CharacterCustomization }) => {
      currentPlayerId = data.playerId;

      // Create player record
      const player: ConnectedPlayer = {
        id: data.playerId,
        username: data.username,
        customization: data.customization,
        position: { x: 400, y: 300 },
        targetPosition: { x: 400, y: 300 },
        direction: 'down',
        state: 'idle',
        socketId: socket.id,
        lastUpdate: Date.now()
      };

      connectedPlayers.set(data.playerId, player);

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
          lastUpdate: p.lastUpdate
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
        lastUpdate: player.lastUpdate
      });
    });

    // Handle player movement
    socket.on('player_move', (data: { position: Vector2; direction: Direction; state: PlayerState }) => {
      if (!currentPlayerId) return;

      const player = connectedPlayers.get(currentPlayerId);
      if (!player) return;

      // Update player state
      player.position = data.position;
      player.targetPosition = data.position;
      player.direction = data.direction;
      player.state = data.state;
      player.lastUpdate = Date.now();

      // Broadcast to other players
      socket.broadcast.emit('player_move', {
        id: player.id,
        position: player.position,
        targetPosition: player.targetPosition,
        direction: player.direction,
        state: player.state,
        lastUpdate: player.lastUpdate
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
        message: data.message
      });
    });

    // Handle player interaction
    socket.on('player_interact', (data: { objectId: string; interactionType: string }) => {
      if (!currentPlayerId) return;

      // Broadcast interaction to nearby players
      socket.broadcast.emit('player_interact', {
        playerId: currentPlayerId,
        objectId: data.objectId,
        interactionType: data.interactionType
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);

      if (currentPlayerId) {
        const player = connectedPlayers.get(currentPlayerId);
        if (player) {
          // Notify others of player leaving
          io.emit('player_leave', currentPlayerId);
        }
        connectedPlayers.delete(currentPlayerId);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
}

// Helper function to get nearby players
export function getNearbyPlayers(position: Vector2, radius: number = 200): NetworkPlayer[] {
  return Array.from(connectedPlayers.values())
    .filter(player => {
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
      lastUpdate: player.lastUpdate
    }));
}

// Cleanup disconnected players periodically
setInterval(() => {
  const now = Date.now();
  const timeout = 60000; // 1 minute timeout

  connectedPlayers.forEach((player, id) => {
    if (now - player.lastUpdate > timeout) {
      connectedPlayers.delete(id);
    }
  });
}, 30000);
