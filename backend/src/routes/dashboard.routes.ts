import { Router } from "express";
import { getDashboardSummary } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/error.middleware";

export const dashboardRoutes = Router();

dashboardRoutes.get("/summary", authMiddleware, asyncHandler(getDashboardSummary));

