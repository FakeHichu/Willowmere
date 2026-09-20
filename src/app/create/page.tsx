'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CharacterCreator } from '@/ui/components/CharacterCreator';
import type { CharacterCustomization } from '@/types';

export default function CreatePage() {
  const router = useRouter();

  const handleComplete = (customization: CharacterCustomization) => {
    // Store customization in localStorage for now
    localStorage.setItem('willowmere_character', JSON.stringify(customization));
    router.push('/play');
  };

  return <CharacterCreator onComplete={handleComplete} />;
}
