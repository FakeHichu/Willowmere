'use client';

import { useState } from 'react';
import type { CharacterCustomization } from '@shared/types';

interface AuthModalProps {
  customization: CharacterCustomization;
  onSuccess: () => void;
  onClose?: () => void;
  initialMode?: 'register' | 'login';
}

export function AuthModal({ customization, onSuccess, onClose, initialMode = 'register' }: AuthModalProps) {
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            email,
            password,
            customization,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Registration failed.');
        }
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            password,
            customization,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Login failed. Please check your credentials.');
        }
      }

      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#f5f0e6] rounded-2xl border-4 border-[#8d6e63] p-6 shadow-2xl">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#8d6e63] hover:text-[#5d4037] text-xl font-bold"
          >
            ✕
          </button>
        )}

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#5d4037]">
            {mode === 'register' ? 'Join Willowmere' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-[#8d6e63] mt-1">
            {mode === 'register'
              ? 'Create an account to save your character & adventure'
              : 'Sign in to return to Willowmere'}
          </p>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex rounded-lg bg-[#d7ccc8] p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
              mode === 'register' ? 'bg-[#558b2f] text-white shadow' : 'text-[#5d4037] hover:text-black'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
              mode === 'login' ? 'bg-[#558b2f] text-white shadow' : 'text-[#5d4037] hover:text-black'
            }`}
          >
            Sign In
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#5d4037] mb-1">
              {mode === 'register' ? 'Username' : 'Username or Email'}
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={mode === 'register' ? 'Choose a unique username' : 'Enter username or email'}
              className="w-full px-3 py-2 border-2 border-[#d7ccc8] rounded-lg focus:border-[#558b2f] focus:outline-none text-[#5d4037] text-sm bg-white"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-[#5d4037] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 border-2 border-[#d7ccc8] rounded-lg focus:border-[#558b2f] focus:outline-none text-[#5d4037] text-sm bg-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#5d4037] mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border-2 border-[#d7ccc8] rounded-lg focus:border-[#558b2f] focus:outline-none text-[#5d4037] text-sm bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-[#558b2f] hover:bg-[#689f38] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Saving...' : mode === 'register' ? 'Start Adventure' : 'Enter Willowmere'}
          </button>
        </form>
      </div>
    </div>
  );
}
