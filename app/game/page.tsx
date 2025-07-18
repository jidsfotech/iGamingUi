"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '../../lib/apiClient';
import apiClient from '../../lib/apiClient';
import { getTimeLeft } from '../../utils/utils';
import { SessionPlayer, SessionData } from '../../interfaces/game';

export default function GamePage() {
  const [selectedNumber, setSelectedNumber] = useState('');
  const [inputDisabled, setInputDisabled] = useState(false);
  const [timer, setTimer] = useState(20);
  const [usersJoined, setUsersJoined] = useState(0);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch session info on mount
  useEffect(() => {
    setLoading(true);
    apiGet<SessionData>('/game/session')
      .then((data) => {
        setSessionId(data.id);
        setUsersJoined(data.players.length);
        setTimer(getTimeLeft(data.endTime));
      })
      .catch(() => {
        setUsersJoined(0);
        setTimer(0);
      })
      .finally(() => setLoading(false));
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (timer <= 0) {
      if (sessionId) {
        router.push(`/game/${sessionId}/result`);
      }
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, sessionId, router]);

  // Handle number input and join
  const handleInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^1-9]/g, '');
    setSelectedNumber(value);
    if (value) {
      setInputDisabled(true);
      try {
        await apiClient.post('/game/player-select', { number: Number(value) });
      } catch (err) {
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 relative">
      {/* Top right timer */}
      <div className="absolute top-6 right-10 text-black text-lg font-semibold text-center">
        <div>Countdown</div>
        <div className="text-3xl font-bold">{timer}</div>
      </div>
      <form className="flex flex-col items-center w-full max-w-md">
        <label className="mb-4 text-xl font-semibold text-black">Pick a random number from 1 - 9</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[1-9]"
          min={1}
          max={9}
          value={selectedNumber}
          onChange={handleInput}
          className="text-black text-2xl font-bold text-center border border-gray-300 rounded-lg mb-2 w-100 h-20 bg-white focus:outline-none focus:ring-0 appearance-none"
          disabled={inputDisabled}
        />
        <style jsx global>{`
          input[type='number']::-webkit-outer-spin-button,
          input[type='number']::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type='number'] {
            -moz-appearance: textfield;
          }
        `}</style>
        <div className="mt-2 text-lg text-green-600 font-semibold">{usersJoined} users joined so far</div>
      </form>
    </div>
  );
} 