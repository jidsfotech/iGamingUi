"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient, { apiGet } from "../lib/apiClient";
import { getTimeLeft } from "../utils/utils";
import { SessionData, SessionPlayer } from "../interfaces/game";

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [userInfo, setUserInfo] = useState<SessionPlayer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [nextSessionCountdown, setNextSessionCountdown] = useState(10);
  const [checkingForNextSession, setCheckingForNextSession] = useState(false);

  const router = useRouter();
  const username =
    typeof window !== "undefined"
      ? localStorage.getItem("username") || "User"
      : "User";

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      router.replace("/auth");
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  // Initial fetch of session
  useEffect(() => {
    if (!isAuthenticated) return;

    apiGet<SessionData>("/game/session")
      .then((data) => {
        if (data.sessionActive) {
          setSessionActive(true);
          setTimeLeft(getTimeLeft(data.endTime));
        } else {
          setSessionActive(false);
          setNextSessionCountdown(10);
        }

        const user = data.players.find(
          (p: SessionPlayer) => p.username === username
        );
        setUserInfo(user || null);
        setError(null);
      })
      .catch((err) => {
        setError(err?.data?.message || err?.message || "Failed to fetch session");
        setSessionActive(false);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, username]);

  // Countdown for current session
  useEffect(() => {
    if (!sessionActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSessionActive(false);
          setNextSessionCountdown(10);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionActive]);

  // Countdown for next session start
  useEffect(() => {
    if (sessionActive || loading) return;

    if (nextSessionCountdown <= 0) {
      setCheckingForNextSession(true);
      return;
    }

    const timer = setInterval(() => {
      setNextSessionCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [nextSessionCountdown, sessionActive, loading]);

  useEffect(() => {
    if (!checkingForNextSession) return;

    const poll = setInterval(() => {
      apiGet<SessionData>("/game/session")
        .then((data) => {
          if (data.sessionActive) {
            clearInterval(poll);
            setSessionActive(true);
            setCheckingForNextSession(false);
            setTimeLeft(getTimeLeft(data.endTime));

            const user = data.players.find(
              (p: SessionPlayer) => p.username === username
            );
            setUserInfo(user || null);
          }
        })
        .catch(() => {
          // Keep polling silently
        });
    }, 3000);

    return () => clearInterval(poll);
  }, [checkingForNextSession, username]);

  // Join game handler
  const handleJoinGameSession = () => {
    apiClient
      .post("/game/join")
      .then(() => {
        router.push("/game");
      })
      .catch((err: any) => {
        setError(err?.data?.message || err?.message || "Failed to join session");
      });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 relative">
      <div className="absolute top-6 right-10 text-lg font-semibold text-black bg-transparent z-10">
        Hi {username}
      </div>

      <div className="flex gap-8 mb-8">
        <span className="text-lg font-semibold text-black">
          Total Wins: {userInfo?.wins ?? 0}
        </span>
        <span className="text-lg font-semibold text-black">
          Total Losses: {userInfo?.looses ?? 0}
        </span>
      </div>

      <button
        className="bg-black text-white px-8 py-4 rounded-lg text-xl font-bold shadow-lg mb-6 \
        disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
        disabled={!sessionActive || loading}
        onClick={handleJoinGameSession}
      >
        Join Session
      </button>

      {sessionActive && (
        <div className="text-red-600 text-lg font-semibold text-center">
          Session ends in {timeLeft} seconds
        </div>
      )}

      {!sessionActive && !loading && (
        <div className="text-gray-500 text-lg font-semibold text-center mt-4">
          {nextSessionCountdown > 0
            ? `Next session starts in ${nextSessionCountdown} seconds`
            : "Waiting for the next session to start..."}
        </div>
      )}

      {error && (
        <div className="text-red-500 mt-4 font-semibold">{error}</div>
      )}
    </div>
  );
}
