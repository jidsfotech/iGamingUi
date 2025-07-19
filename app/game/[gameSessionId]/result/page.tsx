"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { apiGet } from '@/lib/apiClient';
import { getTimeLeft } from '@/utils/utils';
import { EndedSessionData, TopPlayer } from '@/interfaces/game';

export default function ResultPage() {
  const { gameSessionId } = useParams();
  const [endedSession, setEndedSession] = useState<EndedSessionData | null>(null);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [nextSessionCountdown, setNextSessionCountdown] = useState(0);
  const [holdTimer, setHoldTimer] = useState(10); // Hold on result screen for at least 10 seconds

  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      router.replace('/auth');
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch ended session and top players
  useEffect(() => {
    if (!gameSessionId) return;

    apiGet<EndedSessionData>(`game/ended-session/${gameSessionId}`)
      .then((data) => {
        setEndedSession(data);
        setNextSessionCountdown(getTimeLeft(data.nextSessionStart));
      });

    apiGet<TopPlayer[]>(`/game/top-players/${gameSessionId}`).then((data) => {
      setTopPlayers(data);
    });
  }, [gameSessionId]);

  // Countdown for next session and hold timer
  useEffect(() => {
    const interval = setInterval(() => {
      setNextSessionCountdown((prev) => Math.max(prev - 1, 0));
      setHoldTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle redirect when both timers reach 0
  useEffect(() => {
    if (nextSessionCountdown <= 0 && holdTimer <= 0) {
      router.replace('/');
    }
  }, [nextSessionCountdown, holdTimer]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-100 to-blue-100">
      {/* Main content area */}
      <div className="flex-[2] flex flex-col items-center justify-center p-4 md:p-8">
        <div className="flex flex-col items-center justify-center mb-8 gap-2">
          <div className="text-2xl font-bold text-black">Result</div>
          <div className="text-4xl font-extrabold text-black">
            {endedSession?.winningNumber ?? '-'}
          </div>
          <div className="text-base text-black mt-5">
            Total players: {endedSession?.totalPlayers ?? 0}
          </div>
          <div className="text-base text-black">
            Total wins: {endedSession?.totalWins ?? 0}
          </div>
          <div className="text-base text-red-600 mt-4">
            Redirecting to the home page in {Math.max(nextSessionCountdown, holdTimer)} seconds...
          </div>
        </div>
      </div>

      {/* Aside column */}
      <aside className="flex-1 w-full min-h-[200px] md:min-h-screen bg-gray-300/80 flex flex-col items-center justify-start p-4 md:p-6 shadow-lg">
        <div className="w-full mt-8">
          <h3 className="text-lg font-bold text-black mb-2">Winners</h3>
          <ul className="list-disc pl-5">
            {topPlayers.length === 0 ? (
              <li className="text-black text-base mb-1">0</li>
            ) : (
              topPlayers.map((winner) => (
                <li key={winner.id} className="text-black text-base mb-1">
                  {winner.username} ({winner.wins} wins)
                </li>
              ))
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
}