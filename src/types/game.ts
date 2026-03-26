import { Card } from "./card";

export interface StoredGameState {
  id: number;
  userId: number;
  playerDeck: Card[];
  computerDeck: Card[];
  pot: Card[];
  rounds: number;
  lastPlayerCard: Card | null;
  lastComputerCard: Card | null;
  lastResult: string;
  isFinished: boolean;
  winner: string | null;
  updatedAt: string;
}

export interface PublicGameState {
  rounds: number;
  playerCardCount: number;
  computerCardCount: number;
  lastPlayerCard: Card | null;
  lastComputerCard: Card | null;
  lastResult: string;
  isFinished: boolean;
  winner: string | null;
}

export interface GameHistoryItem {
  id: number;
  rounds: number;
  result: string;
  finishedAt: string;
}
