import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorMiddleware";
import { requestLogger } from "./middleware/requestLogger";
import authRoutes from "./routes/authRoutes";
import gameRoutes from "./routes/gameRoutes";

const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.use(errorHandler);

export default app;
