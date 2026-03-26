import { Response } from "express";

export function sendError(res: Response, statusCode: number, message: string): Response {
  return res.status(statusCode).json({ message });
}
