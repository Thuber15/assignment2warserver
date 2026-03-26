import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  dbHost: required("DB_HOST"),
  dbPort: Number(process.env.DB_PORT ?? 3306),
  dbUser: required("DB_USER"),
  dbPassword: required("DB_PASSWORD"),
  dbName: required("DB_NAME"),
  jwtSecret: required("JWT_SECRET")
};
