export interface SessionPlayer {
  id: number;
  username: string;
  selectedNumber: number;
  wins?: number;
  looses?: number;
}

export interface SessionData {
  id: number;
  sessionActive: boolean;
  startTime: string;
  endTime: string;
  players: SessionPlayer[];
}

export interface EndedSessionData {
  id: number;
  winningNumber: number;
  totalPlayers: number;
  totalWins: number;
  endTime: string;
  selectedNumber: string;
  nextSessionStart: string;
}

export interface TopPlayer {
  id: number;
  username: string;
  wins: number;
} 