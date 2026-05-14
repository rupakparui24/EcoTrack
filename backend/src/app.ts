import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { authRoutes } from "./routes/auth.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";
import { projectRoutes } from "./routes/project.routes";
import { taskRoutes } from "./routes/task.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { successResponse } from "./utils/response";

export const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true
  })
);
app.use(express.json());

app.get("/health", (_req, res) => successResponse(res, "EcoTrack API is healthy"));
app.get("/api/health", (_req, res) => successResponse(res, "EcoTrack API is healthy"));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

