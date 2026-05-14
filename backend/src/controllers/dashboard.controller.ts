import { Request, Response } from "express";
import { Priority, Role, TaskStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { successResponse } from "../utils/response";

const taskInclude = {
  project: { select: { id: true, name: true, location: true } },
  assignedTo: { select: { id: true, name: true, email: true, role: true } }
};

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export async function getDashboardSummary(req: Request, res: Response) {
  const user = req.user!;

  const projectWhere =
    user.role === Role.ADMIN
      ? { createdById: user.id }
      : { members: { some: { userId: user.id } } };

  const taskWhere =
    user.role === Role.ADMIN
      ? { project: { createdById: user.id } }
      : { assignedToId: user.id };

  const [projects, tasks, recentTasks, myAssignedTasks] = await Promise.all([
    prisma.project.findMany({ where: projectWhere, select: { id: true } }),
    prisma.task.findMany({
      where: taskWhere,
      include: taskInclude
    }),
    prisma.task.findMany({
      where: taskWhere,
      include: taskInclude,
      orderBy: { createdAt: "desc" },
      take: 6
    }),
    prisma.task.findMany({
      where: { assignedToId: user.id },
      include: taskInclude,
      orderBy: { dueDate: "asc" },
      take: 6
    })
  ]);

  const today = startOfToday();
  const summary = {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    todoTasks: tasks.filter((task) => task.status === TaskStatus.TODO).length,
    inProgressTasks: tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length,
    completedTasks: tasks.filter((task) => task.status === TaskStatus.DONE).length,
    overdueTasks: tasks.filter(
      (task) => task.dueDate < today && task.status !== TaskStatus.DONE
    ).length,
    highPriorityTasks: tasks.filter((task) => task.priority === Priority.HIGH).length,
    recentTasks,
    myAssignedTasks
  };

  return successResponse(res, "Dashboard summary fetched successfully", summary);
}

