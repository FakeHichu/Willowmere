'use client';

import { useState } from 'react';
import type { CharacterCustomization } from '@shared/types';
import {
  skinTones,
  hairColors,
  hairstyles,
  tops,
  bottoms,
  shoes,
  accessories,
  defaultCustomization,
  clothingColors
} from '@data/characters';

interface CharacterCreatorProps {
  onComplete: (customization: CharacterCustomization) => void;
}

export function CharacterCreator({ onComplete }: CharacterCreatorProps) {
  const [customization, setCustomization] = useState<CharacterCustomization>(defaultCustomization);
  const [activeTab, setActiveTab] = useState<'body' | 'hair' | 'clothing' | 'accessories'>('body');

  const updateCustomization = (key: keyof CharacterCustomization, value: string | null) => {
    setCustomization(prev => ({ ...prev, [key]: value }));
  };

  const renderSkinToneSelector = () => (
    <div className="space-y-2">
      <h4 className="font-medium text-[#5d4037]">Skin Tone</h4>
      <div className="flex flex-wrap gap-2">
        {skinTones.map(skin => (
          <button
            key={skin.id}
            onClick={() => updateCustomization('skinTone', skin.id)}
            className={`w-10 h-10 rounded-lg border-2 transition-all ${
              customization.skinTone === skin.id
                ? 'border-[#558b2f] ring-2 ring-[#558b2f] ring-offset-2'
                : 'border-[#d7ccc8] hover:border-[#8d6e63]'
            }`}
            style={{ backgroundColor: skin.hex }}
            title={skin.name}
          />
        ))}
      </div>
    </div>
  );

  const renderHairSelector = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium text-[#5d4037]">Hairstyle</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {hairstyles.map(hair => (
            <button
              key={hair.id}
              onClick={() => updateCustomization('hair', hair.id)}
              className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                customization.hair === hair.id
                  ? 'border-[#558b2f] bg-[#c8e6c9] text-[#2e7d32]'
                  : 'border-[#d7ccc8] hover:border-[#8d6e63] text-[#5d4037]'
              }`}
            >
              {hair.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-[#5d4037]">Hair Color</h4>
        <div className="flex flex-wrap gap-2">
          {hairColors.map(color => (
            <button
              key={color}
              onClick={() => updateCustomization('hairColor', color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                customization.hairColor === color
                  ? 'border-[#558b2f] ring-2 ring-[#558b2f] ring-offset-2'
                  : 'border-[#d7ccc8] hover:border-[#8d6e63]'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderClothingSelector = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium text-[#5d4037]">Top</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tops.map(top => (
            <button
              key={top.id}
              onClick={() => updateCustomization('top', top.id)}
              className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                customization.top === top.id
                  ? 'border-[#558b2f] bg-[#c8e6c9] text-[#2e7d32]'
                  : 'border-[#d7ccc8] hover:border-[#8d6e63] text-[#5d4037]'
              }`}
            >
              {top.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {clothingColors.slice(0, 12).map(color => (
            <button
              key={color}
              onClick={() => updateCustomization('topColor', color)}
              className={`w-7 h-7 rounded-lg border-2 transition-all ${
                customization.topColor === color
                  ? 'border-[#558b2f] ring-2 ring-[#558b2f] ring-offset-1'
                  : 'border-[#d7ccc8] hover:border-[#8d6e63]'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-[#5d4037]">Bottom</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {bottoms.map(bottom => (
            <button
              key={bottom.id}
              onClick={() => updateCustomization('bottom', bottom.id)}
              className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                customization.bottom === bottom.id
                  ? 'border-[#558b2f] bg-[#c8e6c9] text-[#2e7d32]'
                  : 'border-[#d7ccc8] hover:border-[#8d6e63] text-[#5d4037]'
              }`}
            >
              {bottom.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {['#8B4513', '#556B2F', '#D4A76A', '#2F4F4F', '#4682B4', '#F5DEB3'].map(color => (
            <button
              key={color}
              onClick={() => updateCustomization('bottomColor', color)}
              className={`w-7 h-7 rounded-lg border-2 transition-all ${
                customization.bottomColor === color
                  ? 'border-[#558b2f] ring-2 ring-[#558b2f] ring-offset-1'
                  : 'border-[#d7ccc8] hover:border-[#8d6e63]'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-[#5d4037]">Shoes</h4>
        <div className="grid grid-cols-2 gap-2">
          {shoes.map(shoe => (
            <button
              key={shoe.id}
              onClick={() => updateCustomization('shoes', shoe.id)}
              className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                customization.shoes === shoe.id
                  ? 'border-[#558b2f] bg-[#c8e6c9] text-[#2e7d32]'
                  : 'border-[#d7ccc8] hover:border-[#8d6e63] text-[#5d4037]'
              }`}
            >
              {shoe.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAccessorySelector = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium text-[#5d4037]">Accessory</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => updateCustomization('accessory', null)}
            className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
              !customization.accessory
                ? 'border-[#558b2f] bg-[#c8e6c9] text-[#2e7d32]'
                : 'border-[#d7ccc8] hover:border-[#8d6e63] text-[#5d4037]'
            }`}
          >
            None
          </button>
          {accessories.map(acc => (
            <button
              key={acc.id}
              onClick={() => updateCustomization('accessory', acc.id)}
              className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                customization.accessory === acc.id
                  ? 'border-[#558b2f] bg-[#c8e6c9] text-[#2e7d32]'
                  : 'border-[#d7ccc8] hover:border-[#8d6e63] text-[#5d4037]'
              }`}
            >
              {acc.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Preview character colors
  const skinColor = skinTones.find(s => s.id === customization.skinTone)?.hex || '#e8c4a2';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f5e9] to-[#f5f0e6] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#5d4037] mb-2">Create Your Character</h1>
          <p className="text-[#8d6e63]">Customize your appearance before entering the village</p>
        </div>

        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          {/* Character Preview */}
          <div className="bg-white rounded-2xl border-4 border-[#8d6e63] p-6 shadow-xl">
            <h3 className="text-center text-[#5d4037] font-medium mb-4">Preview</h3>
            <div
              className="w-48 h-64 mx-auto rounded-xl flex items-center justify-center relative"
              style={{ backgroundColor: '#f5f0e6' }}
            >
              {/* Simple character preview */}
              <div className="relative">
                {/* Legs */}
                <div
                  className="absolute w-6 h-8 rounded"
                  style={{
                    backgroundColor: customization.bottomColor,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: '-20px'
                  }}
                />
                {/* Body */}
                <div
                  className="w-8 h-10 rounded"
                  style={{ backgroundColor: customization.topColor }}
                />
                {/* Head */}
                <div
                  className="w-6 h-6 rounded-full absolute -top-4 left-1/2 -translate-x-1/2"
                  style={{ backgroundColor: skinColor }}
                />
                {/* Hair */}
                <div
                  className="w-8 h-3 rounded absolute -top-6 left-1/2 -translate-x-1/2"
                  style={{ backgroundColor: customization.hairColor }}
                />
                {/* Eyes */}
                <div className="w-1 h-1 bg-black rounded-full absolute -top-2 left-3" />
                <div className="w-1 h-1 bg-black rounded-full absolute -top-2 left-5" />
                {/* Shoes */}
                <div
                  className="w-3 h-2 rounded absolute -bottom-2 left-2"
                  style={{ backgroundColor: customization.shoesColor }}
                />
                <div
                  className="w-3 h-2 rounded absolute -bottom-2 right-2"
                  style={{ backgroundColor: customization.shoesColor }}
                />
              </div>
            </div>
          </div>

          {/* Customization Panel */}
          <div className="bg-white rounded-2xl border-4 border-[#8d6e63] p-6 shadow-xl">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {(['body', 'hair', 'clothing', 'accessories'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-[#558b2f] text-white shadow-lg'
                      : 'bg-[#f5f0e6] text-[#5d4037] hover:bg-[#efebe9]'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {activeTab === 'body' && renderSkinToneSelector()}
              {activeTab === 'hair' && renderHairSelector()}
              {activeTab === 'clothing' && renderClothingSelector()}
              {activeTab === 'accessories' && renderAccessorySelector()}
            </div>

            {/* Confirm Button */}
            <div className="mt-8 pt-6 border-t-2 border-[#e8e0d0]">
              <button
                onClick={() => onComplete(customization)}
                className="w-full py-4 bg-[#558b2f] text-white rounded-xl font-bold text-lg hover:bg-[#689f38] transition-colors shadow-lg hover:shadow-xl"
              >
                Enter Village
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
