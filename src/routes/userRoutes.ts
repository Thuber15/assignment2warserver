import { Router } from "express";
import { loginUser, registerUser } from "../controllers/authController";

const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/", loginUser);

export default userRoutes;
