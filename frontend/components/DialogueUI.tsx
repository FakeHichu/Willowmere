'use client';

import { useState, useEffect } from 'react';
import type { DialogueTree, DialogueNode, DialogueChoice } from '@shared/types';
import { getDialogueTreeById } from '@data/dialogue';
import { getNpcById } from '@data/npcs';

interface DialogueUIProps {
  npcId: string;
  onClose: () => void;
  onQuestAccept?: (questId: string) => void;
}

export function DialogueUI({ npcId, onClose, onQuestAccept }: DialogueUIProps) {
  const [dialogueTree, setDialogueTree] = useState<DialogueTree | null>(null);
  const [currentNode, setCurrentNode] = useState<DialogueNode | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  const npc = getNpcById(npcId);

  useEffect(() => {
    const tree = getDialogueTreeById(`dialogue_${npcId.replace('npc_', '')}`);
    if (tree) {
      setDialogueTree(tree);
      const startNode = tree.nodes.find(n => n.id === 'greeting');
      setCurrentNode(startNode || null);
      setIsVisible(true);
    }
  }, [npcId]);

  useEffect(() => {
    // Handle keyboard input for dialogue
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleChoice = (choice: DialogueChoice) => {
    // Handle action if present
    if (choice.action) {
      handleAction(choice.action);
    }

    if (choice.nextNodeId === null) {
      handleClose();
      return;
    }

    const nextNode = dialogueTree?.nodes.find(n => n.id === choice.nextNodeId);
    if (nextNode) {
      setCurrentNode(nextNode);
      setTextIndex(0);
    }
  };

  const handleAction = (action: { type: string; payload: Record<string, unknown> }) => {
    switch (action.type) {
      case 'accept_quest':
        if (action.payload.questId && onQuestAccept) {
          onQuestAccept(action.payload.questId as string);
        }
        break;
      case 'complete_quest':
        // Handle quest completion
        break;
      case 'give_item':
        // Handle item giving
        break;
      default:
        console.log('Unknown action:', action.type);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!dialogueTree || !currentNode || !npc) return null;

  return (
    <div
      className={`fixed inset-0 flex items-end justify-center p-8 z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialogue Box */}
      <div className="relative w-full max-w-4xl bg-[#f5f0e6] rounded-2xl border-4 border-[#8d6e63] shadow-2xl overflow-hidden">
        {/* Header with NPC info */}
        <div className="flex items-center gap-4 p-4 bg-[#8d6e63] text-white">
          {/* NPC Portrait */}
          <div className="w-16 h-16 rounded-full bg-[#6d4c41] flex items-center justify-center text-2xl font-bold">
            {npc.name.charAt(0)}
          </div>

          <div>
            <h3 className="text-xl font-bold">{npc.name}</h3>
            <p className="text-sm text-[#d7ccc8]">{npc.role}</p>
          </div>

          <button
            onClick={handleClose}
            className="ml-auto p-2 hover:bg-[#6d4c41] rounded-lg transition-colors"
            aria-label="Close dialogue"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Dialogue Content */}
        <div className="p-6">
          <p className="text-lg text-[#5d4037] leading-relaxed mb-6">
            {currentNode.text}
          </p>

          {/* Choices */}
          {currentNode.choices && currentNode.choices.length > 0 && (
            <div className="space-y-3">
              {currentNode.choices.map((choice, index) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice)}
                  className="w-full text-left p-4 bg-white rounded-lg border-2 border-[#d7ccc8] hover:border-[#8d6e63] hover:bg-[#efebe9] transition-all group"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#8d6e63] text-white flex items-center justify-center text-sm font-bold group-hover:bg-[#558b2f] transition-colors">
                      {index + 1}
                    </span>
                    <span className="text-[#5d4037] font-medium">{choice.text}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Continue prompt */}
          {!currentNode.choices && (
            <button
              onClick={handleClose}
              className="w-full p-4 bg-[#558b2f] text-white rounded-lg hover:bg-[#689f38] transition-colors font-medium"
            >
              Continue
            </button>
          )}
        </div>

        {/* Keyboard hint */}
        <div className="px-6 pb-4 text-sm text-[#8d6e63]">
          Press <kbd className="px-2 py-1 bg-[#d7ccc8] rounded text-xs font-mono">ESC</kbd> to close
        </div>
      </div>
    </div>
  );
}
