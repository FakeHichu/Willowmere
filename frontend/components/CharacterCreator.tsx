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
  clothingColors,
} from '@data/characters';

interface CharacterCreatorProps {
  onComplete: (customization: CharacterCustomization) => void;
  isLoading?: boolean;
}

export function CharacterCreator({ onComplete, isLoading = false }: CharacterCreatorProps) {
  const [customization, setCustomization] = useState<CharacterCustomization>(defaultCustomization);
  const [activeTab, setActiveTab] = useState<'body' | 'hair' | 'clothing' | 'accessories'>('body');

  const updateCustomization = (key: keyof CharacterCustomization, value: string | null) => {
    setCustomization((prev) => ({ ...prev, [key]: value }));
  };

  const handleRandomize = () => {
    const randomSkin = skinTones[Math.floor(Math.random() * skinTones.length)].id;
    const randomHair = hairstyles[Math.floor(Math.random() * hairstyles.length)].id;
    const randomHairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
    const randomTop = tops[Math.floor(Math.random() * tops.length)].id;
    const randomTopColor = clothingColors[Math.floor(Math.random() * clothingColors.length)];
    const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)].id;
    const randomBottomColor = clothingColors[Math.floor(Math.random() * clothingColors.length)];
    const randomShoes = shoes[Math.floor(Math.random() * shoes.length)].id;
    const randomShoesColor = clothingColors[Math.floor(Math.random() * clothingColors.length)];
    const randomAccessoryObj = Math.random() > 0.4 ? accessories[Math.floor(Math.random() * accessories.length)].id : null;

    setCustomization({
      skinTone: randomSkin,
      hair: randomHair,
      hairColor: randomHairColor,
      top: randomTop,
      topColor: randomTopColor,
      bottom: randomBottom,
      bottomColor: randomBottomColor,
      shoes: randomShoes,
      shoesColor: randomShoesColor,
      accessory: randomAccessoryObj,
    });
  };

  const skinColor = skinTones.find((s) => s.id === customization.skinTone)?.hex || '#e8c4a2';

  const renderSkinToneSelector = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-bold text-[#5d4037] text-sm mb-1 flex items-center gap-2">
          <span>🎨</span> Skin Tone & Complexion
        </h4>
        <p className="text-xs text-[#8d6e63] mb-4">Choose your character&apos;s natural skin tone</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {skinTones.map((skin) => {
            const isSelected = customization.skinTone === skin.id;
            return (
              <button
                key={skin.id}
                type="button"
                onClick={() => updateCustomization('skinTone', skin.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left shadow-sm ${
                  isSelected
                    ? 'border-[#558b2f] bg-[#c8e6c9]/40 ring-4 ring-[#558b2f]/20 scale-[1.02]'
                    : 'border-[#d7ccc8] bg-white hover:border-[#8d6e63]'
                }`}
              >
                <span
                  className="w-8 h-8 rounded-full border border-black/10 shadow-inner flex-shrink-0"
                  style={{ backgroundColor: skin.hex }}
                />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-[#5d4037] truncate">{skin.name}</p>
                  <p className="text-[10px] text-[#8d6e63] font-mono">{skin.hex}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderHairSelector = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-bold text-[#5d4037] text-sm mb-1 flex items-center gap-2">
          <span>✂️</span> Hairstyle
        </h4>
        <p className="text-xs text-[#8d6e63] mb-3">Select your haircut</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {hairstyles.map((hair) => {
            const isSelected = customization.hair === hair.id;
            return (
              <button
                key={hair.id}
                type="button"
                onClick={() => updateCustomization('hair', hair.id)}
                className={`px-4 py-3 rounded-xl border-2 text-xs font-bold transition-all text-center ${
                  isSelected
                    ? 'border-[#558b2f] bg-[#558b2f] text-white shadow-md'
                    : 'border-[#d7ccc8] bg-white text-[#5d4037] hover:border-[#8d6e63]'
                }`}
              >
                {hair.name}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-[#5d4037] text-sm mb-1 flex items-center gap-2">
          <span>🎨</span> Hair Color
        </h4>
        <p className="text-xs text-[#8d6e63] mb-3">Choose a hair color</p>
        <div className="flex flex-wrap gap-2.5">
          {hairColors.map((color) => {
            const isSelected = customization.hairColor === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => updateCustomization('hairColor', color)}
                className={`w-9 h-9 rounded-xl border-2 transition-all shadow-sm ${
                  isSelected
                    ? 'border-[#558b2f] ring-4 ring-[#558b2f]/30 scale-110'
                    : 'border-[#d7ccc8] hover:border-[#8d6e63] hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderClothingSelector = () => (
    <div className="space-y-6">
      {/* Top section */}
      <div>
        <h4 className="font-bold text-[#5d4037] text-sm mb-1 flex items-center gap-2">
          <span>👔</span> Shirt / Top
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {tops.map((top) => {
            const isSelected = customization.top === top.id;
            return (
              <button
                key={top.id}
                type="button"
                onClick={() => updateCustomization('top', top.id)}
                className={`px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                  isSelected
                    ? 'border-[#558b2f] bg-[#558b2f] text-white shadow-md'
                    : 'border-[#d7ccc8] bg-white text-[#5d4037] hover:border-[#8d6e63]'
                }`}
              >
                {top.name}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {clothingColors.slice(0, 14).map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => updateCustomization('topColor', color)}
              className={`w-7 h-7 rounded-lg border-2 transition-all ${
                customization.topColor === color
                  ? 'border-[#558b2f] ring-4 ring-[#558b2f]/30 scale-110'
                  : 'border-[#d7ccc8] hover:border-[#8d6e63]'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div>
        <h4 className="font-bold text-[#5d4037] text-sm mb-1 flex items-center gap-2">
          <span>👖</span> Pants / Bottom
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {bottoms.map((bottom) => {
            const isSelected = customization.bottom === bottom.id;
            return (
              <button
                key={bottom.id}
                type="button"
                onClick={() => updateCustomization('bottom', bottom.id)}
                className={`px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                  isSelected
                    ? 'border-[#558b2f] bg-[#558b2f] text-white shadow-md'
                    : 'border-[#d7ccc8] bg-white text-[#5d4037] hover:border-[#8d6e63]'
                }`}
              >
                {bottom.name}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {['#8B4513', '#556B2F', '#D4A76A', '#2F4F4F', '#4682B4', '#F5DEB3', '#3E2723', '#263238'].map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => updateCustomization('bottomColor', color)}
              className={`w-7 h-7 rounded-lg border-2 transition-all ${
                customization.bottomColor === color
                  ? 'border-[#558b2f] ring-4 ring-[#558b2f]/30 scale-110'
                  : 'border-[#d7ccc8] hover:border-[#8d6e63]'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Shoes section */}
      <div>
        <h4 className="font-bold text-[#5d4037] text-sm mb-1 flex items-center gap-2">
          <span>👞</span> Shoes
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {shoes.map((shoe) => {
            const isSelected = customization.shoes === shoe.id;
            return (
              <button
                key={shoe.id}
                type="button"
                onClick={() => updateCustomization('shoes', shoe.id)}
                className={`px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                  isSelected
                    ? 'border-[#558b2f] bg-[#558b2f] text-white shadow-md'
                    : 'border-[#d7ccc8] bg-white text-[#5d4037] hover:border-[#8d6e63]'
                }`}
              >
                {shoe.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderAccessorySelector = () => (
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-[#5d4037] text-sm mb-1 flex items-center gap-2">
          <span>👑</span> Accessories & Hats
        </h4>
        <p className="text-xs text-[#8d6e63] mb-4">Add a special hat or glasses to your avatar</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => updateCustomization('accessory', null)}
            className={`px-4 py-3 rounded-2xl border-2 text-xs font-bold transition-all text-center ${
              !customization.accessory
                ? 'border-[#558b2f] bg-[#558b2f] text-white shadow-md'
                : 'border-[#d7ccc8] bg-white text-[#5d4037] hover:border-[#8d6e63]'
            }`}
          >
            🚫 None
          </button>
          {accessories.map((acc) => {
            const isSelected = customization.accessory === acc.id;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => updateCustomization('accessory', acc.id)}
                className={`px-4 py-3 rounded-2xl border-2 text-xs font-bold transition-all text-center ${
                  isSelected
                    ? 'border-[#558b2f] bg-[#558b2f] text-white shadow-md'
                    : 'border-[#d7ccc8] bg-white text-[#5d4037] hover:border-[#8d6e63]'
                }`}
              >
                ✨ {acc.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1b2a1c] via-[#2d3a2b] to-[#1a231b] py-10 px-4 text-[#5d4037] select-none flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header Title */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs tracking-widest uppercase mb-3 border border-emerald-500/30 shadow-sm">
            Cottagecore Avatar Studio
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-amber-50 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Customize Your Traveler
          </h1>
          <p className="text-emerald-200/80 text-sm max-w-lg mx-auto">
            Design your villager avatar before stepping into the world of Willowmere
          </p>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid md:grid-cols-[320px_1fr] gap-8 items-start">
          {/* LEFT COLUMN: Character Avatar Live Stage */}
          <div className="bg-[#f5f0e6] rounded-3xl border-4 border-[#8d6e63] p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#8d6e63] uppercase tracking-wider">Live Preview</span>
              <button
                type="button"
                onClick={handleRandomize}
                className="px-3 py-1.5 bg-[#8d6e63] hover:bg-[#6d4c41] text-white rounded-xl text-xs font-bold transition-all shadow hover:scale-105"
              >
                🎲 Randomize
              </button>
            </div>

            {/* Avatar Stage Grass Platform */}
            <div className="w-full h-80 rounded-2xl bg-gradient-to-b from-[#e8f5e9] to-[#c8e6c9] border-2 border-[#8d6e63]/30 flex items-center justify-center relative shadow-inner overflow-hidden">
              {/* Grassy ground platform shadow */}
              <div className="absolute bottom-8 w-44 h-12 bg-[#7cb342] rounded-full blur-[2px] opacity-80" />
              <div className="absolute bottom-6 w-52 h-16 bg-[#558b2f]/30 rounded-full blur-[10px]" />

              {/* Character Model Representation */}
              <div className="relative z-10 scale-150 transform translate-y-2">
                {/* Legs / Bottom */}
                <div
                  className="absolute w-7 h-10 rounded-b shadow-sm transition-colors duration-200"
                  style={{
                    backgroundColor: customization.bottomColor,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bottom: '-24px',
                  }}
                />
                {/* Body / Top */}
                <div
                  className="w-10 h-12 rounded-t-md shadow transition-colors duration-200"
                  style={{ backgroundColor: customization.topColor }}
                />
                {/* Head */}
                <div
                  className="w-8 h-8 rounded-full absolute -top-5 left-1/2 -translate-x-1/2 shadow-sm transition-colors duration-200"
                  style={{ backgroundColor: skinColor }}
                />
                {/* Hair */}
                <div
                  className="w-9 h-4 rounded-t-full absolute -top-7 left-1/2 -translate-x-1/2 transition-colors duration-200"
                  style={{ backgroundColor: customization.hairColor }}
                />
                {/* Eyes */}
                <div className="w-1.5 h-1.5 bg-[#3e2723] rounded-full absolute -top-3 left-2.5" />
                <div className="w-1.5 h-1.5 bg-[#3e2723] rounded-full absolute -top-3 right-2.5" />
                {/* Shoes */}
                <div
                  className="w-4 h-2.5 rounded-b absolute -bottom-3 left-1 shadow-sm"
                  style={{ backgroundColor: customization.shoesColor }}
                />
                <div
                  className="w-4 h-2.5 rounded-b absolute -bottom-3 right-1 shadow-sm"
                  style={{ backgroundColor: customization.shoesColor }}
                />
              </div>
            </div>

            <p className="text-[11px] text-[#8d6e63] mt-4 font-semibold text-center leading-normal">
              Your customized character will save directly to your PostgreSQL account profile.
            </p>
          </div>

          {/* RIGHT COLUMN: Customization Controls Card */}
          <div className="bg-[#f5f0e6] rounded-3xl border-4 border-[#8d6e63] p-6 shadow-2xl flex flex-col">
            {/* Category Navigation Tabs */}
            <div className="grid grid-cols-4 gap-2 mb-6 bg-[#d7ccc8] p-1.5 rounded-2xl shadow-inner">
              {(['body', 'hair', 'clothing', 'accessories'] as const).map((tab) => {
                const isActive = activeTab === tab;
                const tabIcons = { body: '👤', hair: '✂️', clothing: '👔', accessories: '👑' };
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-[#558b2f] text-white shadow-lg scale-102'
                        : 'text-[#5d4037] hover:bg-[#efebe9]'
                    }`}
                  >
                    <span>{tabIcons[tab]}</span>
                    <span className="hidden sm:inline">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Tab Panel Content */}
            <div className="min-h-[280px] flex-1">
              {activeTab === 'body' && renderSkinToneSelector()}
              {activeTab === 'hair' && renderHairSelector()}
              {activeTab === 'clothing' && renderClothingSelector()}
              {activeTab === 'accessories' && renderAccessorySelector()}
            </div>

            {/* Confirm & Save Button */}
            <div className="mt-8 pt-6 border-t-2 border-[#d7ccc8]">
              <button
                type="button"
                onClick={() => onComplete(customization)}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all ${
                  isLoading
                    ? 'bg-[#9ccc65] text-white cursor-not-allowed'
                    : 'bg-[#558b2f] text-white hover:bg-[#689f38] shadow-lg'
                }`}
              >
                {isLoading ? 'Creating Character...' : '🏡 Save & Enter Village'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}