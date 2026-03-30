import { Request, Response } from "express";
import type { AuthenticatedRequestUser } from "../types/auth";
import {
  getCurrentGame,
  getHistory,
  playRound,
  startNewGame,
  toPublicGameState,
} from "../services/gameService";
import { sendError } from "../utils/http";

type AuthRequest = Request & { user?: AuthenticatedRequestUser };

function getUserId(req: AuthRequest): number | null {
  return req.user?.userId ?? null;
}

export async function startGame(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const userId = getUserId(req);
  if (userId === null) {
    sendError(res, 401, "Unauthorized");
    return;
  }

  const game = await startNewGame(userId);
  res.status(201).json({ game: toPublicGameState(game) });
}

export async function currentGame(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const userId = getUserId(req);
  if (userId === null) {
    sendError(res, 401, "Unauthorized");
    return;
  }

  const game = await getCurrentGame(userId);
  if (!game) {
    sendError(res, 404, "No active game found");
    return;
  }

  res.json({ game: toPublicGameState(game) });
}

export async function playCurrentRound(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const userId = getUserId(req);
  if (userId === null) {
    sendError(res, 401, "Unauthorized");
    return;
  }

  try {
    const game = await playRound(userId);
    res.json({ game: toPublicGameState(game) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to play round";
    sendError(res, 400, message);
  }
}

export async function history(req: AuthRequest, res: Response): Promise<void> {
  const userId = getUserId(req);
  if (userId === null) {
    sendError(res, 401, "Unauthorized");
    return;
  }

  const games = await getHistory(userId);
  res.json({ games });
}
