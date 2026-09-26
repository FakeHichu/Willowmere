import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import type { NetworkPlayer, Vector2, Direction, PlayerState, CharacterCustomization } from '@shared/types';
import { prisma } from '../db';
import { calculateAuthoritativeMove } from '../movement/movementEngine';
import { startGameClock, getGameTime } from '../time/clock';
import { updateNPCSchedules } from '../npc/npcEngine';
import { addInventoryItem } from '../inventory/inventoryService';
import { getObjectById } from '@data/world/objects';
import { getBuildingInterior } from '../buildings/buildingManager';
import { MAPS } from '@game/core/GameConfig';

interface ConnectedPlayer {
  id: string;
  userId: string;
  username: string;
  customization: CharacterCustomization;
  position: Vector2;
  targetPosition: Vector2;
  direction: Direction;
  state: PlayerState;
  socketId: string;
  lastUpdate: number;
  isOnline: boolean;
  currentMap: string;
  currentBuilding?: string;
}

// In-memory active & offline player map
const worldPlayers = new Map<string, ConnectedPlayer>();

export function initializeSocketServer(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Start synchronized Game Clock & broadcast clock tick
  startGameClock((gameTime) => {
    io.emit('clock_tick', gameTime);
  });

  // Server tick for NPC schedule updates (every 2 seconds)
  setInterval(() => {
    const updatedNPCs = updateNPCSchedules();
    io.emit('npc_update', updatedNPCs);
  }, 2000);

  // Periodic autosave (30 seconds) to PostgreSQL
  setInterval(async () => {
    for (const player of worldPlayers.values()) {
      if (player.isOnline) {
        try {
          await prisma.player.update({
            where: { id: player.id },
            data: {
              positionX: player.position.x,
              positionY: player.position.y,
              direction: player.direction,
              lastOnline: new Date(),
            },
          });
        } catch (err) {
          console.error(`Autosave failed for player ${player.id}:`, err);
        }
      }
    }
  }, 30000);

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    let currentPlayerId: string | null = null;

    // Handle player joining (authenticates and syncs PostgreSQL state)
    socket.on('player_join', async (data: { playerId: string; username: string; customization: CharacterCustomization }) => {
      currentPlayerId = data.playerId;

      // Load persistent state from database
      let initialPos = { x: 480, y: 360 };
      let dir: Direction = 'down';

      try {
        const dbPlayer = await prisma.player.findUnique({
          where: { id: data.playerId },
        });
        if (dbPlayer) {
          initialPos = { x: dbPlayer.positionX, y: dbPlayer.positionY };
          dir = dbPlayer.direction as Direction;
        }
      } catch (e) {
        console.error('Failed to load player position from DB:', e);
      }

      const player: ConnectedPlayer = {
        id: data.playerId,
        userId: data.playerId,
        username: data.username,
        customization: data.customization,
        position: initialPos,
        targetPosition: initialPos,
        direction: dir,
        state: 'idle',
        socketId: socket.id,
        lastUpdate: Date.now(),
        isOnline: true,
        currentMap: 'village',
      };

      worldPlayers.set(data.playerId, player);

      // Send existing online & offline players to new client
      const existingPlayers = Array.from(worldPlayers.values())
        .filter((p) => p.id !== data.playerId)
        .map((p) => ({
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
      socket.emit('clock_tick', getGameTime());

      // Broadcast new player join
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
    });

    // Handle SERVER-AUTHORITATIVE Movement Input
    socket.on(
      'player_input',
      (data: { direction: Direction; isMoving: boolean; deltaSeconds?: number }) => {
        if (!currentPlayerId) return;

        const player = worldPlayers.get(currentPlayerId);
        if (!player || !player.isOnline) return;

        const delta = Math.min(data.deltaSeconds || 0.05, 0.1);

        // Calculate authoritative position and validate collision on server
        const moveResult = calculateAuthoritativeMove(
          player.position,
          data.direction,
          data.isMoving,
          delta
        );

        player.position = moveResult.position;
        player.targetPosition = moveResult.position;
        player.direction = data.direction;
        player.state = moveResult.state;
        player.lastUpdate = Date.now();

        // Broadcast authoritative position back to client & other players
        io.emit('player_move', {
          id: player.id,
          position: player.position,
          targetPosition: player.targetPosition,
          direction: player.direction,
          state: player.state,
          lastUpdate: player.lastUpdate,
        });
      }
    );

    // Fallback legacy handler for position sync reconciliation
    socket.on('player_move', (data: { position: Vector2; direction: Direction; state: PlayerState }) => {
      if (!currentPlayerId) return;
      const player = worldPlayers.get(currentPlayerId);
      if (!player) return;

      player.position = data.position;
      player.targetPosition = data.position;
      player.direction = data.direction;
      player.state = data.state;
      player.lastUpdate = Date.now();

      socket.broadcast.emit('player_move', {
        id: player.id,
        position: player.position,
        targetPosition: player.targetPosition,
        direction: player.direction,
        state: player.state,
        lastUpdate: player.lastUpdate,
      });
    });

    // Handle Server-Authoritative Interaction (Pickup, Sit, Door, Inspect)
    socket.on('player_interact', async (data: { objectId: string; interactionType: string }) => {
      if (!currentPlayerId) return;

      const player = worldPlayers.get(currentPlayerId);
      if (!player) return;

      const obj = getObjectById(data.objectId);

      if (data.interactionType === 'pickup' && obj && obj.properties?.itemType) {
        const itemType = obj.properties.itemType as string;
        // Server validates pickup distance
        const dx = player.position.x - obj.position.x;
        const dy = player.position.y - obj.position.y;
        if (Math.hypot(dx, dy) <= 100) {
          await addInventoryItem(player.id, itemType, 1);

          io.emit('item_picked_up', {
            playerId: player.id,
            objectId: data.objectId,
            itemId: itemType,
          });
          return;
        }
      }

      // Broadcast generic interaction to nearby clients
      socket.broadcast.emit('player_interact', {
        playerId: currentPlayerId,
        objectId: data.objectId,
        interactionType: data.interactionType,
      });
    });

    // Handle Enter Building
    socket.on('enter_building', async (data: { buildingId: string }) => {
      if (!currentPlayerId) return;
      const player = worldPlayers.get(currentPlayerId);
      if (!player) return;

      const interior = getBuildingInterior(data.buildingId);
      if (!interior) return;

      player.currentBuilding = data.buildingId;

      await prisma.player.update({
        where: { id: player.id },
        data: { currentBuilding: data.buildingId },
      });

      socket.emit('enter_building_response', {
        buildingId: data.buildingId,
        interiorName: interior.name,
        spawnPoint: interior.entrySpawn,
      });
    });

    // Handle Exit Building
    socket.on('exit_building', async (data: { buildingId: string }) => {
      if (!currentPlayerId) return;
      const player = worldPlayers.get(currentPlayerId);
      if (!player) return;

      const interior = getBuildingInterior(data.buildingId);
      if (!interior) return;

      player.currentBuilding = undefined;
      player.position = interior.exitSpawn;
      player.targetPosition = interior.exitSpawn;

      await prisma.player.update({
        where: { id: player.id },
        data: { currentBuilding: null, positionX: interior.exitSpawn.x, positionY: interior.exitSpawn.y },
      });

      socket.emit('map_change', { mapId: 'village', spawnPoint: interior.exitSpawn });
      socket.broadcast.emit('player_move', {
        id: player.id,
        position: player.position,
        targetPosition: player.targetPosition,
        direction: player.direction,
        state: player.state,
        lastUpdate: player.lastUpdate,
      });
    });

    // Handle Map Change (for future multi-map support)
    socket.on('change_map', async (data: { mapId: string }) => {
      if (!currentPlayerId) return;
      const player = worldPlayers.get(currentPlayerId);
      if (!player) return;

      const mapConfig = MAPS[data.mapId as keyof typeof MAPS];
      if (!mapConfig) return;

      player.currentMap = data.mapId;
      player.currentBuilding = undefined;
      player.position = mapConfig.spawnPoint;
      player.targetPosition = mapConfig.spawnPoint;

      await prisma.player.update({
        where: { id: player.id },
        data: { currentMap: data.mapId, currentBuilding: null, positionX: mapConfig.spawnPoint.x, positionY: mapConfig.spawnPoint.y },
      });

      socket.emit('map_change', { mapId: data.mapId, spawnPoint: mapConfig.spawnPoint });
    });

    // Handle Disconnection (Preserves offline player representation & saves position)
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);

      if (currentPlayerId) {
        const player = worldPlayers.get(currentPlayerId);
        if (player) {
          player.isOnline = false;
          player.state = 'idle';

          // Persist position to PostgreSQL on disconnect
          try {
            await prisma.player.update({
              where: { id: player.id },
              data: {
                positionX: player.position.x,
                positionY: player.position.y,
                direction: player.direction,
                lastOnline: new Date(),
              },
            });
          } catch (e) {
            console.error('Failed to save disconnect position to DB:', e);
          }

          // Notify clients that player is now offline (retains stationary representation)
          io.emit('player_offline', {
            id: player.id,
            position: player.position,
          });
        }
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
}

export function getNearbyPlayers(position: Vector2, radius: number = 250): NetworkPlayer[] {
  return Array.from(worldPlayers.values())
    .filter((player) => {
      const dx = player.position.x - position.x;
      const dy = player.position.y - position.y;
      return Math.sqrt(dx * dx + dy * dy) <= radius;
    })
    .map((player) => ({
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
