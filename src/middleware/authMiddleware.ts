import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/auth";
import { sendError } from "../utils/http";

export function requireAuth(req: Request, res: Response, next: NextFunction): Response | void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, "Missing or invalid authorization header");
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.userId, username: payload.username };
    next();
  } catch {
    return sendError(res, 401, "Invalid token");
  }
}
