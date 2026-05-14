import { Priority, TaskCategory, TaskStatus } from "@prisma/client";
import { z } from "zod";

const dueDateSchema = z.coerce.date({
  required_error: "Due date is required",
  invalid_type_error: "Due date must be valid"
});

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  description: z.string().trim().optional().or(z.literal("")),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(Priority),
  category: z.nativeEnum(TaskCategory),
  dueDate: dueDateSchema,
  projectId: z.string().trim().min(1, "Project ID is required"),
  assignedToId: z.string().trim().min(1, "Assigned user is required")
});

export const updateTaskSchema = taskSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field is required"
);

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus)
});

