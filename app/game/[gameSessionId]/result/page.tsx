"use client";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { apiGet } from '@/lib/apiClient';
import { getTimeLeft } from '@/utils/utils';
import { SessionPlayer, SessionData, EndedSessionData, TopPlayer } from '@/interfaces/game';

export default function ResultPage() {
  const { gameSessionId } = useParams();
  const [endedSession, setEndedSession] = useState<EndedSessionData | null>(null);
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [nextSessionCountdown, setNextSessionCountdown] = useState(0);

  // Fetch ended session and top players
  useEffect(() => {
    console.log('gameSessionId=====', gameSessionId)
    if (!gameSessionId) return;
    apiGet<EndedSessionData>(`/ended-session/${gameSessionId}`)
      .then((data) => {
        console.log('EndedSessionData=====', data)
        setEndedSession(data);
        setNextSessionCountdown(getTimeLeft(data.nextSessionStart));
      });
    apiGet<TopPlayer[]>(`/game/top-players/${gameSessionId}`).then((data) => {
      console.log('TopPlayer=====', data)
      setTopPlayers(data);
    });
  }, [gameSessionId]);

  // Countdown for next session
  useEffect(() => {
    if (nextSessionCountdown <= 0) return;
    const interval = setInterval(() => {
      setNextSessionCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [nextSessionCountdown]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-100 to-blue-100">
      {/* Main content area */}
      <div className="flex-[2] flex flex-col items-center justify-center p-4 md:p-8">
        {/* Stacked result display */}
        <div className="flex flex-col items-center justify-center mb-8 gap-2">
          <div className="text-2xl font-bold text-black ">Result</div>
          <div className="text-4xl font-extrabold text-black">{endedSession?.winningNumber ?? '-'}</div>
          <div className="text-base text-black mt-5">Total players : {endedSession?.totalPlayers ?? 0}</div>
          <div className="text-base text-black">Total wins: {endedSession?.totalWins ?? 0}</div>
          <div className="text-base text-red-600 mt-4">The next session starts in {nextSessionCountdown}</div>
        </div>
      </div>
      {/* Aside column (bottom on small screens, right on medium+) */}
      <aside className="flex-1 w-full min-h-[200px] md:min-h-screen bg-gray-300/80 flex flex-col items-center justify-start p-4 md:p-6 shadow-lg">
        <div className="w-full mt-8">
          <h3 className="text-lg font-bold text-black mb-2">Winners</h3>
          <ul className="list-disc pl-5">
            {topPlayers.length === 0 ? (
              <li className="text-black text-base mb-1">0</li>
            ) : (
              topPlayers.map(winner => (
                <li key={winner.id} className="text-black text-base mb-1">{winner.username} ({winner.wins} wins)</li>
              ))
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
} 