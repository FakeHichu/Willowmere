'use client';

import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GAME_CONFIG } from '@game/core/GameConfig';
import { CharacterCustomization } from '@shared/types';

interface GameCanvasProps {
  customization: CharacterCustomization;
  onDialogueStart?: (npcId: string) => void;
  onItemPickup?: (itemId: string, objectId: string) => void;
}

export function GameCanvas({ customization, onDialogueStart, onItemPickup }: GameCanvasProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const emitterRef = useRef<Phaser.Events.EventEmitter | null>(null);

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

    // Initialize game with customization
    const config: Phaser.Types.Core.GameConfig = {
      ...GAME_CONFIG,
      parent: containerRef.current,
      callbacks: {
        preBoot: (game) => {
          // Pass customization to scenes
          game.registry.set('customization', customization);
          game.registry.set('emitter', emitterRef.current);
        }
      }
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
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
