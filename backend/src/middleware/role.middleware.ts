import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { errorResponse } from "../utils/response";

function getProjectId(req: Request) {
  return req.params.projectId || req.params.id || req.body.projectId;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== Role.ADMIN) {
    return errorResponse(res, "Only admin users can perform this action", 403);
  }

  next();
}

export async function requireProjectAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const projectId = getProjectId(req);
  const user = req.user;

  if (!user || !projectId) {
    return errorResponse(res, "Project access could not be verified", 403);
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true }
  });

  if (!project) {
    return errorResponse(res, "Project not found", 404);
  }

  const isProjectAdmin = user.role === Role.ADMIN && project.createdById === user.id;
  const isProjectMember = project.members.some((member) => member.userId === user.id);

  if (!isProjectAdmin && !isProjectMember) {
    return errorResponse(res, "You do not have access to this waste zone", 403);
  }

  next();
}

export async function requireTaskAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const taskId = req.params.id;

  if (!user || !taskId) {
    return errorResponse(res, "Task access could not be verified", 403);
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  });

  if (!task) {
    return errorResponse(res, "Task not found", 404);
  }

  const isProjectAdmin = user.role === Role.ADMIN && task.project.createdById === user.id;
  const isAssignedMember = user.role === Role.MEMBER && task.assignedToId === user.id;

  if (!isProjectAdmin && !isAssignedMember) {
    return errorResponse(res, "You do not have access to this task", 403);
  }

  next();
}

