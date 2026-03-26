import { Router } from "express";
import { currentGame, history, playCurrentRound, startGame } from "../controllers/gameController";
import { requireAuth } from "../middleware/authMiddleware";

const gameRoutes = Router();

gameRoutes.use(requireAuth);
gameRoutes.post("/start", startGame);
gameRoutes.get("/current", currentGame);
gameRoutes.post("/current/play-round", playCurrentRound);
gameRoutes.get("/history", history);

export default gameRoutes;
