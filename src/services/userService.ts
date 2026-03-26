import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../config/database";

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
}

export interface UserRecord {
  id: number;
  username: string;
  passwordHash: string;
}

export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  const [rows] = await db.query<UserRow[]>(
    "SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1",
    [username]
  );

  if (rows.length === 0) {
    return null;
  }

  const user = rows[0];
  return { id: user.id, username: user.username, passwordHash: user.password_hash };
}

export async function createUser(username: string, passwordHash: string): Promise<number> {
  const [result] = await db.execute<ResultSetHeader>(
    "INSERT INTO users (username, password_hash) VALUES (?, ?)",
    [username, passwordHash]
  );

  return result.insertId;
}
