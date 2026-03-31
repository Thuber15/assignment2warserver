export type AuthRequest = {
  username: string;
  password: string;
};

export type AuthResponse = {
  message: string;
  token?: string;
};
