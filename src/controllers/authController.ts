import { Request, Response } from "express";
import { createUser, findUserByUsername } from "../services/userService";
import { comparePassword, hashPassword, signToken } from "../utils/auth";
import { sendError } from "../utils/http";

interface AuthBody {
  username?: string;
  password?: string;
}

function validateBody(
  body: AuthBody,
): { username: string; password: string } | null {
  if (typeof body.username !== "string" || typeof body.password !== "string") {
    return null;
  }

  const username = body.username.trim();
  const password = body.password.trim();

  if (username.length < 3 || password.length < 6) {
    return null;
  }

  return { username, password };
}

export async function registerUser(req: Request, res: Response): Promise<void> {
  const values = validateBody(req.body as AuthBody);
  if (!values) {
    sendError(
      res,
      400,
      "Username must be at least 3 characters and password at least 6 characters",
    );
    return;
  }

  const existingUser = await findUserByUsername(values.username);
  if (existingUser) {
    sendError(res, 409, "Username already exists");
    return;
  }

  const passwordHash = await hashPassword(values.password);
  const userId = await createUser(values.username, passwordHash);
  const token = signToken({ userId, username: values.username });

  res.status(201).json({
    message: "Registered successfully",
    token,
    user: { id: userId, username: values.username },
  });
}

export async function loginUser(req: Request, res: Response): Promise<void> {
  const values = validateBody(req.body as AuthBody);
  if (!values) {
    sendError(res, 400, "Username and password are required");
    return;
  }

  const user = await findUserByUsername(values.username);
  if (!user) {
    sendError(res, 401, "Invalid credentials");
    return;
  }

  const passwordMatches = await comparePassword(
    values.password,
    user.passwordHash,
  );
  if (!passwordMatches) {
    sendError(res, 401, "Invalid credentials");
    return;
  }

  const token = signToken({ userId: user.id, username: user.username });

  res.json({
    message: "Login successful",
    token,
    user: { id: user.id, username: user.username },
  });
}

export { registerUser as register, loginUser as login };
