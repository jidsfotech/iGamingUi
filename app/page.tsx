"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient, { apiGet } from '../lib/apiClient';
import { getTimeLeft } from '../utils/utils';
import { SessionPlayer, SessionData } from '../interfaces/game';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [session, setSession] = useState<SessionData | null>(null);
  const [userInfo, setUserInfo] = useState<SessionPlayer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const username = typeof window !== 'undefined' ? localStorage.getItem('username') || 'User' : 'User';

  useEffect(() => {
    // Check for JWT token in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      router.replace('/auth');
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch current session
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);

    apiGet<SessionData>('/game/session')
      .then((data) => {
        if (data.sessionActive) {
          setSession(data);
          setSessionActive(true);
        }
        // Find user info
        const user = data.players.find((p: SessionPlayer) => p.username === username);
        setUserInfo(user || null);
        // Calculate time left
        setTimeLeft(getTimeLeft(data.endTime));
        setError(null);
      })
      .catch((err) => {
        setError(err?.data?.message || err?.message || 'Failed to fetch session');
        setSessionActive(false);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, username]);

  // Countdown timer logic
  useEffect(() => {
    if (!sessionActive || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) setSessionActive(false);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionActive, timeLeft]);

  // Toast for error
  useEffect(() => {
    if (error) {
      alert(error);
    }
  }, [error]);

  const handleJoinGameSession = () => {
    try {
      apiClient.post('/game/join');
      router.push('/game');
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to join session');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 relative">
      <div className="absolute top-6 right-10 text-lg font-semibold text-black bg-transparent z-10">
        Hi {username}
      </div>
      <div className="flex gap-8 mb-8">
        <span className="text-lg font-semibold text-black">Total Wins: {userInfo?.wins ?? 0}</span>
        <span className="text-lg font-semibold text-black">Total Losses: {userInfo?.losses ?? 0}</span>
      </div>
      <button
        className="bg-black text-white px-8 py-4 rounded-lg text-xl font-bold shadow-lg mb-6 \
        disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
        disabled={!sessionActive || loading}
        onClick={() => handleJoinGameSession()}
      >
        Join Session
      </button>
      {sessionActive && (
        <div className="text-red-600 text-lg font-semibold text-center">
          There's an active session you can join in {timeLeft} secs
        </div>
      )}
      {!sessionActive && !loading && (
        <div className="text-gray-500 text-lg font-semibold text-center mt-4">
          No active session at the moment.
        </div>
      )}
    </div>
  );
}
