"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../lib/apiClient';

interface AuthRes { username: string; access_token: string; }

export default function AuthPage() {
  const [userName, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loadingAction, setLoadingAction] = useState<'login' | 'register' | null>(null);
  const router = useRouter();

  const handleAuth = (action: 'login' | 'register') => async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError('Username is required');
      return;
    }

    setError('');
    setLoadingAction(action);
    try {
      const { access_token, username } =
        (await apiClient.post(`/auth/${action}`, { username: userName })) as AuthRes;

      if (access_token && username) {
        localStorage.setItem('token', access_token);
        localStorage.setItem('username', username);
        router.push('/');
      } else {
        setError('Unexpected response from server');
      }
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Authentication failed');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 px-4">
      <form className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-sm border-4 border-gray-700 text-black" onSubmit={handleAuth('login')}>
        <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-center text-black tracking-wide">
          Login or Register
        </h2>

        <input
          type="text"
          className="border-2 border-black outline-none focus:ring-2 focus:ring-black p-3 w-full mb-6 rounded-lg text-black placeholder-gray-500 bg-gray-50 transition-all duration-150"
          placeholder="Enter username"
          value={userName}
          onChange={e => setUsername(e.target.value)}
          disabled={loadingAction !== null}
        />

        {error && <div className="text-red-500 mb-4 text-sm text-center">{error}</div>}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            className="bg-gray-800 text-white px-5 py-3 rounded-lg w-full sm:w-1/2 font-semibold hover:bg-black transition-colors duration-150 shadow-md"
            disabled={loadingAction !== null}
          >
            {loadingAction === 'login' ? 'Logging in...' : 'Login'}
          </button>

          <button
            type="button"
            className="bg-gray-500 text-white px-5 py-3 rounded-lg w-full sm:w-1/2 font-semibold hover:bg-gray-700 transition-colors duration-150 shadow-md"
            onClick={handleAuth('register')}
            disabled={loadingAction !== null}
          >
            {loadingAction === 'register' ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
}