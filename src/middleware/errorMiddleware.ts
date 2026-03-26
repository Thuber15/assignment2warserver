import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): Response {
  logger.error({
    message: error.message,
    stack: error.stack,
    method: req.method,
    path: req.originalUrl,
  });

  return res.status(500).json({ message: "Internal server error" });
}
