import { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequestUser } from "../types/auth";
import { verifyToken } from "../utils/auth";
import { sendError } from "../utils/http";

type AuthRequest = Request & { user?: AuthenticatedRequestUser };

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, 401, "Missing or invalid authorization header");
    return;
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.userId, username: payload.username };
    next();
  } catch {
    sendError(res, 401, "Invalid token");
    return;
  }
}
