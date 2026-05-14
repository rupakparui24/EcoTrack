import { Router } from "express";
import {
  addProjectMember,
  createProject,
  deleteProject,
  getProject,
  listProjectMembers,
  listProjects,
  removeProjectMember,
  updateProject
} from "../controllers/project.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/error.middleware";
import { requireAdmin, requireProjectAccess } from "../middleware/role.middleware";
import {
  addProjectMemberSchema,
  projectSchema
} from "../validators/project.validator";
import { validateBody } from "../validators/validate";

export const projectRoutes = Router();

projectRoutes.use(authMiddleware);

projectRoutes.get("/", asyncHandler(listProjects));
projectRoutes.post("/", requireAdmin, validateBody(projectSchema), asyncHandler(createProject));
projectRoutes.get("/:id", asyncHandler(getProject));
projectRoutes.put("/:id", requireAdmin, validateBody(projectSchema), asyncHandler(updateProject));
projectRoutes.delete("/:id", requireAdmin, asyncHandler(deleteProject));
projectRoutes.get("/:id/members", requireProjectAccess, asyncHandler(listProjectMembers));
projectRoutes.post(
  "/:id/members",
  requireAdmin,
  validateBody(addProjectMemberSchema),
  asyncHandler(addProjectMember)
);
projectRoutes.delete(
  "/:id/members/:userId",
  requireAdmin,
  asyncHandler(removeProjectMember)
);

