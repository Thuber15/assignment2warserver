import type { AuthRequest, AuthResponse } from "../types/authTypes";

const BASE_URL = "http://localhost:3000";

export async function registerUser(data: AuthRequest): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/user/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: AuthResponse = await response.json();
  return result;
}

export async function loginUser(data: AuthRequest): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: AuthResponse = await response.json();
  return result;
}
