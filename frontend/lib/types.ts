export type Role = "ADMIN" | "MEMBER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type TaskCategory =
  | "BIN_PICKUP"
  | "OVERFLOW_INSPECTION"
  | "SEGREGATION_CHECK"
  | "COMPLAINT_RESOLUTION"
  | "RECYCLING_TRANSFER"
  | "HAZARDOUS_ALERT"
  | "ROUTE_CLEANING";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Project = {
  id: string;
  name: string;
  description?: string | null;
  location?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
    tasks: number;
  };
  members?: ProjectMember[];
  tasks?: Task[];
};

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  createdAt: string;
  user: User;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  category: TaskCategory;
  dueDate: string;
  projectId: string;
  assignedToId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  project?: Pick<Project, "id" | "name" | "location">;
  assignedTo?: User;
  createdBy?: User;
};

export type DashboardSummary = {
  totalProjects: number;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  highPriorityTasks: number;
  recentTasks: Task[];
  myAssignedTasks: Task[];
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const statusLabels: Record<TaskStatus, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done"
};

export const priorityLabels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High"
};

export const categoryLabels: Record<TaskCategory, string> = {
  BIN_PICKUP: "Bin Pickup",
  OVERFLOW_INSPECTION: "Overflow Inspection",
  SEGREGATION_CHECK: "Segregation Check",
  COMPLAINT_RESOLUTION: "Complaint Resolution",
  RECYCLING_TRANSFER: "Recycling Transfer",
  HAZARDOUS_ALERT: "Hazardous Alert",
  ROUTE_CLEANING: "Route Cleaning"
};

export const taskStatuses = Object.keys(statusLabels) as TaskStatus[];
export const priorities = Object.keys(priorityLabels) as Priority[];
export const taskCategories = Object.keys(categoryLabels) as TaskCategory[];

