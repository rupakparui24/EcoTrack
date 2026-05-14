import { Request, Response } from "express";
import { Priority, Role, TaskCategory, TaskStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../middleware/error.middleware";
import { successResponse } from "../utils/response";

const taskInclude = {
  project: { select: { id: true, name: true, location: true } },
  assignedTo: { select: { id: true, name: true, email: true, role: true } },
  createdBy: { select: { id: true, name: true, email: true, role: true } }
};

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

async function ensureProjectOwner(projectId: string, adminId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (project.createdById !== adminId) {
    throw new AppError("Only the zone admin can manage tasks for this project", 403);
  }

  return project;
}

async function ensureAssigneeInProject(projectId: string, assignedToId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: assignedToId } }
  });

  if (!membership) {
    throw new AppError("Assigned user must be a member of this waste zone", 422);
  }
}

function taskWhereForUser(user: Express.UserPayload) {
  if (user.role === Role.ADMIN) {
    return { project: { createdById: user.id } };
  }

  return { assignedToId: user.id };
}

export async function listTasks(req: Request, res: Response) {
  const user = req.user!;
  const { status, priority, category, overdue, projectId } = req.query;

  const where: Prisma.TaskWhereInput = {
    ...taskWhereForUser(user)
  };

  if (typeof status === "string" && status) {
    if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
      throw new AppError("Invalid status filter", 422);
    }
    where.status = status as TaskStatus;
  }

  if (typeof priority === "string" && priority) {
    if (!Object.values(Priority).includes(priority as Priority)) {
      throw new AppError("Invalid priority filter", 422);
    }
    where.priority = priority as Priority;
  }

  if (typeof category === "string" && category) {
    if (!Object.values(TaskCategory).includes(category as TaskCategory)) {
      throw new AppError("Invalid category filter", 422);
    }
    where.category = category as TaskCategory;
  }

  if (typeof projectId === "string" && projectId) where.projectId = projectId;
  if (overdue === "true") {
    where.dueDate = { lt: startOfToday() };
    where.status = { not: TaskStatus.DONE };
  }

  const tasks = await prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }]
  });

  return successResponse(res, "Waste tasks fetched successfully", tasks);
}

export async function getTask(req: Request, res: Response) {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: taskInclude
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return successResponse(res, "Waste task fetched successfully", task);
}

export async function createTask(req: Request, res: Response) {
  const user = req.user!;
  const { projectId, assignedToId, dueDate, ...data } = req.body;

  await ensureProjectOwner(projectId, user.id);
  await ensureAssigneeInProject(projectId, assignedToId);

  const task = await prisma.task.create({
    data: {
      ...data,
      dueDate,
      projectId,
      assignedToId,
      createdById: user.id
    },
    include: taskInclude
  });

  return successResponse(res, "Waste task created successfully", task, 201);
}

export async function updateTask(req: Request, res: Response) {
  const existingTask = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: { project: true }
  });

  if (!existingTask) {
    throw new AppError("Task not found", 404);
  }

  await ensureProjectOwner(existingTask.projectId, req.user!.id);

  const nextProjectId = req.body.projectId ?? existingTask.projectId;
  const nextAssigneeId = req.body.assignedToId ?? existingTask.assignedToId;

  if (req.body.projectId) {
    await ensureProjectOwner(req.body.projectId, req.user!.id);
  }

  await ensureAssigneeInProject(nextProjectId, nextAssigneeId);

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: req.body,
    include: taskInclude
  });

  return successResponse(res, "Waste task updated successfully", task);
}

export async function updateTaskStatus(req: Request, res: Response) {
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
    include: taskInclude
  });

  return successResponse(res, "Task status updated successfully", task);
}

export async function deleteTask(req: Request, res: Response) {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id }
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  await ensureProjectOwner(task.projectId, req.user!.id);
  await prisma.task.delete({ where: { id: req.params.id } });

  return successResponse(res, "Waste task deleted successfully");
}
