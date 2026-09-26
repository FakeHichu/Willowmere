'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { CharacterCustomization, NetworkPlayer } from '@shared/types';
import { DialogueUI } from '@frontend/components/DialogueUI';

// Dynamically import the game canvas to avoid SSR issues
const GameCanvas = dynamic(
  () => import('@frontend/components/GameCanvas').then(mod => mod.GameCanvas),
  { ssr: false }
);

interface PlayerData {
  id: string;
  username: string;
  customization: CharacterCustomization;
  position: { x: number; y: number };
  direction: string;
  currency: number;
  inventory: { itemId: string; quantity: number }[];
  quests: { questId: string; currentStepId: string | null; status: string; progress: Record<string, number> }[];
}

export default function PlayPage() {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [activeNpcId, setActiveNpcId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameTime, setGameTime] = useState<string>('Day 1, 08:00 AM');
  const [activeQuests, setActiveQuests] = useState<string[]>([]);
  const [inventory, setInventory] = useState<{ itemId: string; quantity: number }[]>([]);
  const [otherPlayers, setOtherPlayers] = useState<NetworkPlayer[]>([]);

  // UI modal toggles
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadAuthUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          if (isMounted) router.push('/create');
          return;
        }
        const data = await res.json();
        if (isMounted && data.player) {
          setPlayer(data.player);
          if (data.player.inventory) {
            setInventory(data.player.inventory);
          }
          setIsLoading(false);
        } else {
          if (isMounted) router.push('/create');
        }
      } catch (err) {
        console.error('Failed to load authenticated player:', err);
        if (isMounted) router.push('/create');
      }
    }

    loadAuthUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/create');
    }
  };

  const handleDialogueStart = (npcId: string) => {
    setActiveNpcId(npcId);
  };

  const handleDialogueClose = () => {
    setActiveNpcId(null);
  };

  const handleQuestAccept = (questId: string) => {
    if (!activeQuests.includes(questId)) {
      setActiveQuests(prev => [...prev, questId]);
    }
  };

  const handleItemPickup = (itemId: string, _objectId: string) => {
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
  };

  const handlePlayersUpdate = (players: NetworkPlayer[]) => {
    setOtherPlayers(players);
  };

  const handleClockTick = (timeData: { timeString: string }) => {
    if (timeData?.timeString) {
      setGameTime(timeData.timeString);
    }
  };

  if (isLoading || !player) {
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
    <main className="min-h-screen bg-[#f5f0e6] flex flex-col select-none">
      {/* Game canvas container */}
      <div className="flex-1 relative">
        <Suspense
          fallback={
            <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-[#e8f5e9]">
              <div className="text-[#5d4037]">Loading game...</div>
            </div>
          }
        >
          <GameCanvas
            customization={player.customization}
            playerId={player.id}
            username={player.username}
            onDialogueStart={handleDialogueStart}
            onItemPickup={handleItemPickup}
            onClockTick={handleClockTick}
            onPlayersUpdate={handlePlayersUpdate}
          />
        </Suspense>
      </div>

      {/* TOP LEFT: Player Info & Clock HUD */}
      <div className="fixed top-4 left-4 z-40 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="bg-[#f5f0e6] rounded-xl border-2 border-[#8d6e63] p-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#558b2f] flex items-center justify-center text-white font-bold text-lg shadow">
              {player.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-[#5d4037]">{player.username}</p>
              <p className="text-xs text-[#8d6e63]">
                {activeQuests.length} quest{activeQuests.length !== 1 ? 's' : ''} • {player.currency} coins
              </p>
            </div>
          </div>
        </div>

        {/* Live Synchronized Game Clock */}
        <div className="bg-[#558b2f] text-white rounded-xl border-2 border-[#33691e] px-4 py-2 shadow-lg flex items-center gap-2">
          <span className="text-lg">🕒</span>
          <span className="font-bold text-sm tracking-wide">{gameTime}</span>
        </div>
      </div>

      {/* TOP RIGHT: Action Buttons (Quest Log, Inventory, Logout) */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setShowQuestLog(!showQuestLog)}
          className="bg-[#f5f0e6] hover:bg-[#efebe9] text-[#5d4037] border-2 border-[#8d6e63] rounded-xl px-3 py-2 text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
        >
          📜 Quests ({activeQuests.length})
        </button>

        <button
          onClick={() => setShowInventory(!showInventory)}
          className="bg-[#f5f0e6] hover:bg-[#efebe9] text-[#5d4037] border-2 border-[#8d6e63] rounded-xl px-3 py-2 text-xs font-bold shadow-lg transition-all flex items-center gap-1.5"
        >
          🎒 Inventory ({inventory.reduce((acc, i) => acc + i.quantity, 0)})
        </button>

        <button
          onClick={handleLogout}
          className="bg-[#d7ccc8] hover:bg-[#bcaaa4] text-[#5d4037] border-2 border-[#8d6e63] rounded-xl px-3 py-2 text-xs font-bold shadow-lg transition-all"
        >
          Logout
        </button>
      </div>

      {/* Quest Log Modal */}
      {showQuestLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#f5f0e6] rounded-2xl border-4 border-[#8d6e63] p-6 shadow-2xl">
            <button
              onClick={() => setShowQuestLog(false)}
              className="absolute top-4 right-4 text-[#8d6e63] hover:text-[#5d4037] text-xl font-bold"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-[#5d4037] mb-4 flex items-center gap-2">
              📜 Quest Log
            </h3>
            {activeQuests.length === 0 ? (
              <p className="text-sm text-[#8d6e63] italic">No active quests. Talk to Arthur or villagers in Willowmere!</p>
            ) : (
              <ul className="space-y-3">
                {activeQuests.map((qId) => (
                  <li key={qId} className="bg-white p-3 rounded-lg border border-[#d7ccc8]">
                    <p className="font-bold text-sm text-[#5d4037]">
                      {qId === 'quest_tool_repair'
                        ? "Arthur's Scrap Iron Task"
                        : qId === 'quest_flower_hunt'
                        ? "Lily's Wildflower Collection"
                        : "Village Quest"}
                    </p>
                    <p className="text-xs text-[#8d6e63] mt-1">Status: Active</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#f5f0e6] rounded-2xl border-4 border-[#8d6e63] p-6 shadow-2xl">
            <button
              onClick={() => setShowInventory(false)}
              className="absolute top-4 right-4 text-[#8d6e63] hover:text-[#5d4037] text-xl font-bold"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-[#5d4037] mb-4 flex items-center gap-2">
              🎒 Inventory
            </h3>
            {inventory.length === 0 ? (
              <p className="text-sm text-[#8d6e63] italic">Your bag is empty. Explore Willowmere to pick up flowers and items!</p>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {inventory.map((item) => (
                  <div key={item.itemId} className="bg-white p-2 rounded-lg border-2 border-[#d7ccc8] text-center">
                    <div className="w-8 h-8 mx-auto mb-1 bg-[#e8f5e9] rounded flex items-center justify-center text-lg">
                      {item.itemId.includes('flower') ? '🌻' : item.itemId.includes('iron') ? '⚙️' : '📦'}
                    </div>
                    <p className="text-[10px] font-bold text-[#5d4037] truncate">
                      {item.itemId.replace('item_', '').replace('_', ' ')}
                    </p>
                    <p className="text-[10px] text-[#8d6e63]">x{item.quantity}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Controls hint */}
      <div className="fixed bottom-4 left-4 z-40 hidden sm:block">
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

      {/* Mobile Touch Overlay Controls */}
      <div className="fixed bottom-4 right-4 z-40 sm:hidden flex items-center gap-4">
        <div className="grid grid-cols-3 gap-1 bg-[#8d6e63]/80 p-2 rounded-full shadow-2xl backdrop-blur">
          <div />
          <button className="w-10 h-10 bg-[#f5f0e6] rounded-full font-bold text-[#5d4037] active:bg-[#558b2f] active:text-white">↑</button>
          <div />
          <button className="w-10 h-10 bg-[#f5f0e6] rounded-full font-bold text-[#5d4037] active:bg-[#558b2f] active:text-white">←</button>
          <button className="w-10 h-10 bg-[#558b2f] rounded-full font-bold text-white shadow">E</button>
          <button className="w-10 h-10 bg-[#f5f0e6] rounded-full font-bold text-[#5d4037] active:bg-[#558b2f] active:text-white">→</button>
          <div />
          <button className="w-10 h-10 bg-[#f5f0e6] rounded-full font-bold text-[#5d4037] active:bg-[#558b2f] active:text-white">↓</button>
          <div />
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