import { Router } from "express";
import { login, me, signup } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/error.middleware";
import { loginSchema, signupSchema } from "../validators/auth.validator";
import { validateBody } from "../validators/validate";

export const authRoutes = Router();

authRoutes.post("/signup", validateBody(signupSchema), asyncHandler(signup));
authRoutes.post("/login", validateBody(loginSchema), asyncHandler(login));
authRoutes.get("/me", authMiddleware, asyncHandler(me));

