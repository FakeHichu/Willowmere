'use client';

import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { io, Socket } from 'socket.io-client';
import { GAME_CONFIG } from '@game/core/GameConfig';
import type { CharacterCustomization, NetworkPlayer, Vector2, Direction, PlayerState } from '@shared/types';
import { getSession } from '@/backend/auth/utils';

interface GameCanvasProps {
  customization: CharacterCustomization;
  playerId: string;
  username: string;
  onDialogueStart?: (npcId: string) => void;
  onItemPickup?: (itemId: string, objectId: string) => void;
  onPlayersUpdate?: (players: NetworkPlayer[]) => void;
}

export function GameCanvas({ 
  customization, 
  playerId, 
  username, 
  onDialogueStart, 
  onItemPickup,
  onPlayersUpdate 
}: GameCanvasProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const emitterRef = useRef<Phaser.Events.EventEmitter | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    // Create event emitter for communication
    emitterRef.current = new Phaser.Events.EventEmitter();

    // Setup event listeners
    if (onDialogueStart) {
      emitterRef.current.on('start_dialogue', (data: { npcId: string }) => {
        onDialogueStart(data.npcId);
      });
    }

    if (onItemPickup) {
      emitterRef.current.on('pickup_item', (data: { itemId: string; objectId: string }) => {
        onItemPickup(data.itemId, data.objectId);
      });
    }

    // Connect to socket server (runs on separate port in dev)
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002';
    socketRef.current = io(socketUrl, {
      auth: { token: '' }, // Will be set after getting session
      transports: ['websocket', 'polling'],
    });

    // Get session token and authenticate
    const authenticateSocket = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.authenticated && data.player) {
          // Reconnect with auth token
          socketRef.current?.disconnect();
          
          // Get token from cookie - in practice, the socket.io-client will send cookies automatically
          // But we need to include it in auth for the middleware
          socketRef.current = io(socketUrl, {
            auth: { token: '' }, // Cookie will be sent automatically with credentials
            transports: ['websocket', 'polling'],
            withCredentials: true,
          });
          
          setupSocketListeners();
        }
      } catch (error) {
        console.error('Failed to authenticate socket:', error);
      }
    };

    const setupSocketListeners = () => {
      const socket = socketRef.current;
      if (!socket) return;

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        setIsConnected(true);
        
        // Join the game
        socket.emit('player_join', {
          playerId,
          username,
          customization,
        });
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setIsConnected(false);
      });

      socket.on('existing_players', (players: NetworkPlayer[]) => {
        console.log('Received existing players:', players.length);
        if (onPlayersUpdate) {
          onPlayersUpdate(players);
        }
        // Emit to Phaser scene
        players.forEach(p => {
          emitterRef.current?.emit('player_join', p);
        });
      });

      socket.on('player_join', (player: NetworkPlayer) => {
        emitterRef.current?.emit('player_join', player);
      });

      socket.on('player_leave', (playerId: string) => {
        emitterRef.current?.emit('player_leave', playerId);
      });

      socket.on('player_offline', (playerId: string) => {
        emitterRef.current?.emit('player_offline', playerId);
      });

      socket.on('player_move', (data: Partial<NetworkPlayer> & { id: string }) => {
        emitterRef.current?.emit('player_move', data);
      });

      socket.on('player_position_correction', (data: { position: Vector2; direction: Direction; state: PlayerState }) => {
        emitterRef.current?.emit('player_position_correction', data);
      });

      socket.on('player_chat', (data: { playerId: string; username: string; message: string }) => {
        // Could emit to UI for chat display
        console.log('Chat:', data);
      });

      socket.on('player_interact', (data: { playerId: string; objectId: string; interactionType: string }) => {
        emitterRef.current?.emit('player_interact', data);
      });

      socket.on('error', (error: { message: string }) => {
        console.error('Socket error:', error.message);
      });
    };

    authenticateSocket();

    // Initialize game with customization
    const config: Phaser.Types.Core.GameConfig = {
      ...GAME_CONFIG,
      parent: containerRef.current,
      callbacks: {
        preBoot: (game) => {
          // Pass customization to scenes
          game.registry.set('customization', customization);
          game.registry.set('emitter', emitterRef.current);
          game.registry.set('socket', socketRef.current);
          game.registry.set('playerId', playerId);
        }
      }
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [playerId, username, customization]);

  // Expose socket methods to scene via emitter
  useEffect(() => {
    if (!emitterRef.current || !socketRef.current) return;

    const socket = socketRef.current;

    // Listen for movement emission from scene
    const handleMoveInput = (data: { position: Vector2; direction: Direction; state: PlayerState; timestamp: number }) => {
      if (socket.connected) {
        socket.emit('player_move_input', data);
      }
    };

    const handleInteract = (data: { objectId: string; interactionType: string }) => {
      if (socket.connected) {
        socket.emit('player_interact', data);
      }
    };

    emitterRef.current.on('player_move_input', handleMoveInput);
    emitterRef.current.on('player_interact', handleInteract);

    return () => {
      emitterRef.current?.off('player_move_input', handleMoveInput);
      emitterRef.current?.off('player_interact', handleInteract);
    };
  }, [emitterRef.current, socketRef.current]);

  return (
    <div
      ref={containerRef}
      id="game-container"
      className="w-full h-full min-h-[600px] rounded-lg overflow-hidden shadow-xl border-4 border-[#8d6e63]"
    />
  );
}