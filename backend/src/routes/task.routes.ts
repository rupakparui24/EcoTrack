import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
  updateTaskStatus
} from "../controllers/task.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/error.middleware";
import { requireAdmin, requireTaskAccess } from "../middleware/role.middleware";
import {
  taskSchema,
  updateTaskSchema,
  updateTaskStatusSchema
} from "../validators/task.validator";
import { validateBody } from "../validators/validate";

export const taskRoutes = Router();

taskRoutes.use(authMiddleware);

taskRoutes.get("/", asyncHandler(listTasks));
taskRoutes.post("/", requireAdmin, validateBody(taskSchema), asyncHandler(createTask));
taskRoutes.get("/:id", requireTaskAccess, asyncHandler(getTask));
taskRoutes.put(
  "/:id",
  requireAdmin,
  validateBody(updateTaskSchema),
  asyncHandler(updateTask)
);
taskRoutes.patch(
  "/:id/status",
  validateBody(updateTaskStatusSchema),
  requireTaskAccess,
  asyncHandler(updateTaskStatus)
);
taskRoutes.delete("/:id", requireAdmin, asyncHandler(deleteTask));

