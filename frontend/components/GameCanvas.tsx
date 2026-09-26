'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { io, Socket } from 'socket.io-client';
import { GAME_CONFIG } from '@game/core/GameConfig';
import type { CharacterCustomization } from '@shared/types';

interface GameCanvasProps {
  customization: CharacterCustomization;
  onDialogueStart?: (npcId: string) => void;
  onItemPickup?: (itemId: string, objectId: string) => void;
  onClockTick?: (timeData: { timeString: string }) => void;
}

export function GameCanvas({ customization, onDialogueStart, onItemPickup, onClockTick }: GameCanvasProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const emitterRef = useRef<Phaser.Events.EventEmitter | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    // Connect Socket.IO
    socketRef.current = io(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', {
      withCredentials: true,
    });

    // Create event emitter for Phaser communication
    emitterRef.current = new Phaser.Events.EventEmitter();

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

    // Forward socket events
    socketRef.current.on('clock_tick', (timeData: { timeString: string }) => {
      if (onClockTick) onClockTick(timeData);
      emitterRef.current?.emit('clock_tick', timeData);
    });

    socketRef.current.on('player_move', (moveData: unknown) => {
      emitterRef.current?.emit('server_player_move', moveData);
    });

    socketRef.current.on('npc_update', (npcData: unknown) => {
      emitterRef.current?.emit('server_npc_update', npcData);
    });

    socketRef.current.on('item_picked_up', (pickupData: { itemId: string; objectId: string }) => {
      if (onItemPickup) {
        onItemPickup(pickupData.itemId, pickupData.objectId);
      }
      emitterRef.current?.emit('server_item_picked_up', pickupData);
    });

    // Handle building transitions
    socketRef.current.on('enter_building_response', (data: { buildingId: string; interiorName: string; spawnPoint: { x: number; y: number } }) => {
      emitterRef.current?.emit('enter_building', data);
    });

    socketRef.current.on('map_change', (data: { mapId: string; spawnPoint: { x: number; y: number } }) => {
      emitterRef.current?.emit('map_change', data);
    });

    // Forward local movements/inputs to Socket.IO server
    emitterRef.current.on('player_input', (inputData: unknown) => {
      socketRef.current?.emit('player_input', inputData);
    });

    // Handle scene transitions from Phaser
    emitterRef.current.on('request_enter_building', (data: { buildingId: string }) => {
      socketRef.current?.emit('enter_building', data);
    });

    emitterRef.current.on('request_exit_building', (data: { buildingId: string }) => {
      socketRef.current?.emit('exit_building', data);
    });

    emitterRef.current.on('request_change_map', (data: { mapId: string }) => {
      socketRef.current?.emit('change_map', data);
    });

    // Initialize Phaser game
    const config: Phaser.Types.Core.GameConfig = {
      ...GAME_CONFIG,
      parent: containerRef.current,
      callbacks: {
        preBoot: (game) => {
          game.registry.set('customization', customization);
          game.registry.set('emitter', emitterRef.current);
          game.registry.set('socket', socketRef.current);
        },
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (gameRef.current) {
        try {
          // Safely destroy Phaser game - handle AudioContext cleanup
          const game = gameRef.current;
          
          // Stop any running audio before destroying
          const soundManager = game.sound as { context?: AudioContext; pauseAll?: () => void };
          if (soundManager.context) {
            const audioContext = soundManager.context;
            if (audioContext.state !== 'closed') {
              // Suspend gracefully if running
              if (audioContext.state === 'running') {
                audioContext.suspend().catch(() => {});
              }
            }
          }
          
          game.destroy(true);
        } catch (err) {
          // Ignore AudioContext errors during cleanup
          console.warn('Phaser cleanup warning:', err);
        }
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="game-container"
      className="w-full h-full min-h-[600px] rounded-lg overflow-hidden shadow-xl border-4 border-[#8d6e63]"
    />
  );
}
