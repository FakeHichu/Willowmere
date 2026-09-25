'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { CharacterCustomization } from '@shared/types';
import { DialogueUI } from '@frontend/components/DialogueUI';

// Dynamically import the game canvas to avoid SSR issues
const GameCanvas = dynamic(
  () => import('@frontend/components/GameCanvas').then(mod => mod.GameCanvas),
  { ssr: false }
);

export default function PlayPage() {
  const router = useRouter();
  const [customization, setCustomization] = useState<CharacterCustomization | null>(null);
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQuests, setActiveQuests] = useState<string[]>([]);
  const [inventory, setInventory] = useState<{ itemId: string; quantity: number }[]>([]);

  useEffect(() => {
    // Load character customization from localStorage
    const saved = localStorage.getItem('willowmere_character');
    if (saved) {
      try {
        setCustomization(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved character:', e);
        router.push('/create');
      }
    } else {
      router.push('/create');
    }
    setIsLoading(false);
  }, [router]);

  const handleDialogueStart = (npcId: string) => {
    setActiveNpcId(npcId);
  };

  const handleDialogueClose = () => {
    setActiveNpcId(null);
  };

  const handleQuestAccept = (questId: string) => {
    setActiveQuests(prev => [...prev, questId]);
    console.log('Quest accepted:', questId);
  };

  const handleItemPickup = (itemId: string, objectId: string) => {
    setInventory(prev => {
      const existing = prev.find(item => item.itemId === itemId);
      if (existing) {
        return prev.map(item =>
          item.itemId === itemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { itemId, quantity: 1 }];
    });
    console.log('Item picked up:', itemId, 'Total inventory:', inventory);
  };

  if (isLoading || !customization) {
    return (
      <div className="min-h-screen bg-[#f5f0e6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8d6e63] border-t-[#558b2f] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#5d4037] font-medium">Loading Willowmere...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f0e6] flex flex-col">
      {/* Game container */}
      <div className="flex-1 relative">
        <Suspense
          fallback={
            <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-[#e8f5e9]">
              <div className="text-[#5d4037]">Loading game...</div>
            </div>
          }
        >
          <GameCanvas
            customization={customization}
            onDialogueStart={handleDialogueStart}
            onItemPickup={handleItemPickup}
          />
        </Suspense>
      </div>

      {/* HUD Overlay */}
      <div className="fixed top-4 left-4 z-40">
        <div className="bg-[#f5f0e6] rounded-xl border-2 border-[#8d6e63] p-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#558b2f] flex items-center justify-center text-white font-bold">
              T
            </div>
            <div>
              <p className="font-bold text-[#5d4037]">Traveler</p>
              <p className="text-xs text-[#8d6e63]">{activeQuests.length} active quest{activeQuests.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls hint */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="bg-[#f5f0e6]/90 backdrop-blur-sm rounded-lg border-2 border-[#8d6e63] px-4 py-2 shadow-lg">
          <p className="text-xs text-[#8d6e63]">
            <span className="font-mono bg-[#d7ccc8] px-1.5 py-0.5 rounded mr-1">WASD</span>
            or
            <span className="font-mono bg-[#d7ccc8] px-1.5 py-0.5 rounded mx-1">Arrow Keys</span>
            to move •
            <span className="font-mono bg-[#d7ccc8] px-1.5 py-0.5 rounded mx-1">E</span>
            to interact
          </p>
        </div>
      </div>

      {/* Dialogue UI */}
      {activeNpcId && (
        <DialogueUI
          npcId={activeNpcId}
          onClose={handleDialogueClose}
          onQuestAccept={handleQuestAccept}
        />
      )}
    </main>
  );
}
