import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../config/database";
import { Card } from "../types/card";
import { GameHistoryItem, PublicGameState, StoredGameState } from "../types/game";
import { createDeck, shuffleDeck, splitDeck } from "../utils/cards";

type JsonValue = string | Card[] | Card | null;

interface CurrentGameRow extends RowDataPacket {
  id: number;
  user_id: number;
  player_deck: JsonValue;
  computer_deck: JsonValue;
  pot: JsonValue;
  rounds: number;
  last_player_card: JsonValue;
  last_computer_card: JsonValue;
  last_result: string;
  is_finished: number;
  winner: string | null;
  updated_at: string;
}

interface HistoryRow extends RowDataPacket {
  id: number;
  rounds: number;
  result: string;
  finished_at: string;
}

function parseCardArray(value: JsonValue): Card[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === "string") {
    return JSON.parse(value) as Card[];
  }
  return [];
}

function parseCard(value: JsonValue): Card | null {
  if (value === null) {
    return null;
  }
  if (typeof value === "string") {
    return JSON.parse(value) as Card;
  }
  if (Array.isArray(value)) {
    return null;
  }
  return value;
}

function mapCurrentGame(row: CurrentGameRow): StoredGameState {
  return {
    id: row.id,
    userId: row.user_id,
    playerDeck: parseCardArray(row.player_deck),
    computerDeck: parseCardArray(row.computer_deck),
    pot: parseCardArray(row.pot),
    rounds: row.rounds,
    lastPlayerCard: parseCard(row.last_player_card),
    lastComputerCard: parseCard(row.last_computer_card),
    lastResult: row.last_result,
    isFinished: row.is_finished === 1,
    winner: row.winner,
    updatedAt: row.updated_at
  };
}

export function toPublicGameState(game: StoredGameState): PublicGameState {
  return {
    rounds: game.rounds,
    playerCardCount: game.playerDeck.length,
    computerCardCount: game.computerDeck.length,
    lastPlayerCard: game.lastPlayerCard,
    lastComputerCard: game.lastComputerCard,
    lastResult: game.lastResult,
    isFinished: game.isFinished,
    winner: game.winner
  };
}

export async function getCurrentGame(userId: number): Promise<StoredGameState | null> {
  const [rows] = await db.query<CurrentGameRow[]>(
    "SELECT * FROM current_games WHERE user_id = ? LIMIT 1",
    [userId]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapCurrentGame(rows[0]);
}

export async function deleteCurrentGame(userId: number): Promise<void> {
  await db.execute("DELETE FROM current_games WHERE user_id = ?", [userId]);
}

export async function startNewGame(userId: number): Promise<StoredGameState> {
  await deleteCurrentGame(userId);

  const shuffledDeck = shuffleDeck(createDeck());
  const { playerDeck, computerDeck } = splitDeck(shuffledDeck);

  await db.execute<ResultSetHeader>(
    `INSERT INTO current_games
      (user_id, player_deck, computer_deck, pot, rounds, last_player_card, last_computer_card, last_result, is_finished, winner)
     VALUES (?, ?, ?, ?, 0, NULL, NULL, 'ready', 0, NULL)`,
    [userId, JSON.stringify(playerDeck), JSON.stringify(computerDeck), JSON.stringify([])]
  );

  const game = await getCurrentGame(userId);
  if (!game) {
    throw new Error("Failed to create game");
  }

  return game;
}

async function saveFinishedGame(userId: number, rounds: number, result: "won" | "lost"): Promise<void> {
  await db.execute(
    "INSERT INTO game_history (user_id, rounds, result, finished_at) VALUES (?, ?, ?, NOW())",
    [userId, rounds, result]
  );
}

async function persistGame(game: StoredGameState): Promise<void> {
  await db.execute(
    `UPDATE current_games
     SET player_deck = ?, computer_deck = ?, pot = ?, rounds = ?, last_player_card = ?,
         last_computer_card = ?, last_result = ?, is_finished = ?, winner = ?
     WHERE id = ?`,
    [
      JSON.stringify(game.playerDeck),
      JSON.stringify(game.computerDeck),
      JSON.stringify(game.pot),
      game.rounds,
      game.lastPlayerCard ? JSON.stringify(game.lastPlayerCard) : null,
      game.lastComputerCard ? JSON.stringify(game.lastComputerCard) : null,
      game.lastResult,
      game.isFinished ? 1 : 0,
      game.winner,
      game.id
    ]
  );
}

function drawCard(deck: Card[]): Card {
  const card = deck.shift();
  if (!card) {
    throw new Error("Tried to draw from an empty deck");
  }
  return card;
}

function resolveWar(game: StoredGameState): void {
  while (true) {
    if (game.playerDeck.length === 0 || game.computerDeck.length === 0) {
      break;
    }

    if (game.playerDeck.length < 2) {
      while (game.playerDeck.length > 0) {
        game.pot.push(drawCard(game.playerDeck));
      }
      break;
    }

    if (game.computerDeck.length < 2) {
      while (game.computerDeck.length > 0) {
        game.pot.push(drawCard(game.computerDeck));
      }
      break;
    }

    game.pot.push(drawCard(game.playerDeck));
    game.pot.push(drawCard(game.computerDeck));

    const playerWarCard = drawCard(game.playerDeck);
    const computerWarCard = drawCard(game.computerDeck);
    game.lastPlayerCard = playerWarCard;
    game.lastComputerCard = computerWarCard;
    game.pot.push(playerWarCard, computerWarCard);

    if (playerWarCard.value > computerWarCard.value) {
      game.playerDeck.push(...game.pot);
      game.pot = [];
      game.lastResult = "player won war";
      return;
    }

    if (computerWarCard.value > playerWarCard.value) {
      game.computerDeck.push(...game.pot);
      game.pot = [];
      game.lastResult = "computer won war";
      return;
    }

    game.lastResult = "war tied again";
  }
}

export async function playRound(userId: number): Promise<StoredGameState> {
  const game = await getCurrentGame(userId);
  if (!game) {
    throw new Error("No active game found");
  }

  if (game.isFinished) {
    return game;
  }

  if (game.playerDeck.length === 0 || game.computerDeck.length === 0) {
    game.isFinished = true;
    game.winner = game.playerDeck.length > 0 ? "player" : "computer";
    game.lastResult = game.winner === "player" ? "player won game" : "computer won game";
  } else {
    const playerCard = drawCard(game.playerDeck);
    const computerCard = drawCard(game.computerDeck);
    game.lastPlayerCard = playerCard;
    game.lastComputerCard = computerCard;
    game.pot.push(playerCard, computerCard);
    game.rounds += 1;

    if (playerCard.value > computerCard.value) {
      game.playerDeck.push(...game.pot);
      game.pot = [];
      game.lastResult = "player won round";
    } else if (computerCard.value > playerCard.value) {
      game.computerDeck.push(...game.pot);
      game.pot = [];
      game.lastResult = "computer won round";
    } else {
      game.lastResult = "war";
      resolveWar(game);
    }
  }

  if (game.playerDeck.length === 52 || game.computerDeck.length === 52 || game.playerDeck.length === 0 || game.computerDeck.length === 0) {
    game.isFinished = true;
    game.winner = game.playerDeck.length > game.computerDeck.length ? "player" : "computer";
    game.lastResult = game.winner === "player" ? "player won game" : "computer won game";
  }

  await persistGame(game);

  if (game.isFinished) {
    await saveFinishedGame(userId, game.rounds, game.winner === "player" ? "won" : "lost");
  }

  return game;
}

export async function getHistory(userId: number): Promise<GameHistoryItem[]> {
  const [rows] = await db.query<HistoryRow[]>(
    "SELECT id, rounds, result, finished_at FROM game_history WHERE user_id = ? ORDER BY finished_at DESC",
    [userId]
  );

  return rows.map((row) => ({
    id: row.id,
    rounds: row.rounds,
    result: row.result,
    finishedAt: row.finished_at
  }));
}
