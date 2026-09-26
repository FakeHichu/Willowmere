'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CharacterCreator } from '@frontend/components/CharacterCreator';
import { AuthModal } from '@frontend/components/AuthModal';
import type { CharacterCustomization } from '@shared/types';

export default function CreatePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [customizationToSave, setCustomizationToSave] = useState<CharacterCustomization | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  const handleComplete = async (customization: CharacterCustomization) => {
    if (isAuthenticated) {
      // User is already logged in -> update customization in PostgreSQL
      try {
        const res = await fetch('/api/player', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customization }),
        });
        if (res.ok) {
          router.push('/play');
          return;
        }
      } catch (err) {
        console.error('Failed to update character customization:', err);
      }
    }

    // Unauthenticated user -> prompt register/login modal
    setCustomizationToSave(customization);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    router.push('/play');
  };

  return (
    <>
      <CharacterCreator onComplete={handleComplete} />

      {showAuthModal && customizationToSave && (
        <AuthModal
          customization={customizationToSave}
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}
