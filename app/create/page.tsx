'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CharacterCreator } from '@frontend/components/CharacterCreator';
import type { CharacterCustomization } from '@shared/types';

export default function CreatePage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async (customization: CharacterCustomization) => {
    setIsRegistering(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `player_${Date.now().toString(36)}`, // Auto-generate for now
          email: `player_${Date.now().toString(36)}@example.com`,
          password: 'password123', // In real app, user would enter this
          customization,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/play');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f5e9] to-[#f5f0e6] py-8 px-4">
      {error && (
        <div className="max-w-6xl mx-auto mb-6 p-4 bg-red-100 border-2 border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      <CharacterCreator onComplete={handleComplete} isLoading={isRegistering} />
    </div>
  );
}
