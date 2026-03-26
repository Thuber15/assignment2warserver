import { Request, Response } from "express";
import {
  getCurrentGame,
  getHistory,
  playRound,
  startNewGame,
  toPublicGameState,
} from "../services/gameService";
import { sendError } from "../utils/http";

function getUserId(req: Request): number | null {
  return req.user?.userId ?? null;
}

export async function startGame(
  req: Request,
  res: Response,
): Promise<Response> {
  const userId = getUserId(req);
  if (userId === null) {
    return sendError(res, 401, "Unauthorized");
  }

  const game = await startNewGame(userId);
  return res.status(201).json({ game: toPublicGameState(game) });
}

export async function currentGame(
  req: Request,
  res: Response,
): Promise<Response> {
  const userId = getUserId(req);
  if (userId === null) {
    return sendError(res, 401, "Unauthorized");
  }

  const game = await getCurrentGame(userId);
  if (!game) {
    return sendError(res, 404, "No active game found");
  }

  return res.json({ game: toPublicGameState(game) });
}

export async function playCurrentRound(
  req: Request,
  res: Response,
): Promise<Response> {
  const userId = getUserId(req);
  if (userId === null) {
    return sendError(res, 401, "Unauthorized");
  }

  try {
    const game = await playRound(userId);
    return res.json({ game: toPublicGameState(game) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to play round";
    return sendError(res, 400, message);
  }
}

export async function history(req: Request, res: Response): Promise<Response> {
  const userId = getUserId(req);
  if (userId === null) {
    return sendError(res, 401, "Unauthorized");
  }

  const games = await getHistory(userId);
  return res.json({ games });
}
