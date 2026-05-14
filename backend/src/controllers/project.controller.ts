import { Request, Response } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../middleware/error.middleware";
import { successResponse } from "../utils/response";

function normalizeOptional(value?: string) {
  return value?.trim() ? value.trim() : null;
}

async function ensureProjectAdmin(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (project.createdById !== userId) {
    throw new AppError("Only the zone admin can manage this project", 403);
  }

  return project;
}

async function canAccessProject(projectId: string, user: Express.UserPayload) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      createdBy: { select: { id: true, name: true, email: true, role: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } }
        },
        orderBy: { createdAt: "asc" }
      },
      tasks: {
        include: {
          assignedTo: { select: { id: true, name: true, email: true, role: true } },
          createdBy: { select: { id: true, name: true, email: true, role: true } },
          project: { select: { id: true, name: true, location: true } }
        },
        orderBy: { dueDate: "asc" }
      }
    }
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const isAdminOwner = user.role === Role.ADMIN && project.createdById === user.id;
  const isMember = project.members.some((member) => member.userId === user.id);

  if (!isAdminOwner && !isMember) {
    throw new AppError("You do not have access to this waste zone", 403);
  }

  if (user.role === Role.MEMBER) {
    return {
      ...project,
      tasks: project.tasks.filter((task) => task.assignedToId === user.id)
    };
  }

  return project;
}

export async function listProjects(req: Request, res: Response) {
  const user = req.user!;

  const where =
    user.role === Role.ADMIN
      ? { createdById: user.id }
      : { members: { some: { userId: user.id } } };

  const projects = await prisma.project.findMany({
    where,
    include: {
      _count: {
        select: { members: true, tasks: true }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return successResponse(res, "Waste zones fetched successfully", projects);
}

export async function getProject(req: Request, res: Response) {
  const project = await canAccessProject(req.params.id, req.user!);
  return successResponse(res, "Waste zone fetched successfully", project);
}

export async function createProject(req: Request, res: Response) {
  const user = req.user!;
  const { name, description, location } = req.body;

  const project = await prisma.project.create({
    data: {
      name,
      description: normalizeOptional(description),
      location: normalizeOptional(location),
      createdById: user.id,
      members: {
        create: { userId: user.id }
      }
    },
    include: {
      _count: { select: { members: true, tasks: true } }
    }
  });

  return successResponse(res, "Waste zone created successfully", project, 201);
}

export async function updateProject(req: Request, res: Response) {
  await ensureProjectAdmin(req.params.id, req.user!.id);

  const { name, description, location } = req.body;
  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: {
      name,
      description: normalizeOptional(description),
      location: normalizeOptional(location)
    }
  });

  return successResponse(res, "Waste zone updated successfully", project);
}

export async function deleteProject(req: Request, res: Response) {
  await ensureProjectAdmin(req.params.id, req.user!.id);

  await prisma.project.delete({ where: { id: req.params.id } });
  return successResponse(res, "Waste zone deleted successfully");
}

export async function listProjectMembers(req: Request, res: Response) {
  await canAccessProject(req.params.id, req.user!);

  const members = await prisma.projectMember.findMany({
    where: { projectId: req.params.id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } }
    },
    orderBy: { createdAt: "asc" }
  });

  return successResponse(res, "Project members fetched successfully", members);
}

export async function addProjectMember(req: Request, res: Response) {
  await ensureProjectAdmin(req.params.id, req.user!.id);

  const { userId, email } = req.body;
  const memberUser = await prisma.user.findFirst({
    where: userId ? { id: userId } : { email }
  });

  if (!memberUser) {
    throw new AppError("No user found for the provided member details", 404);
  }

  const membership = await prisma.projectMember.upsert({
    where: {
      projectId_userId: {
        projectId: req.params.id,
        userId: memberUser.id
      }
    },
    update: {},
    create: {
      projectId: req.params.id,
      userId: memberUser.id
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } }
    }
  });

  return successResponse(res, "Member added to waste zone successfully", membership, 201);
}

export async function removeProjectMember(req: Request, res: Response) {
  const project = await ensureProjectAdmin(req.params.id, req.user!.id);

  if (req.params.userId === project.createdById) {
    throw new AppError("The zone creator cannot be removed from their own project", 400);
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: req.params.id,
        userId: req.params.userId
      }
    }
  });

  if (!membership) {
    throw new AppError("Member is not assigned to this waste zone", 404);
  }

  await prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId: req.params.id,
        userId: req.params.userId
      }
    }
  });

  return successResponse(res, "Member removed from waste zone successfully");
}
