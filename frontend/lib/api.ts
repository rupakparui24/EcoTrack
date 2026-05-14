import { getToken } from "./auth";
import {
  ApiResponse,
  DashboardSummary,
  Priority,
  Project,
  Task,
  TaskCategory,
  TaskStatus,
  User
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type RequestOptions = {
  method?: string;
  body?: unknown;
};

async function apiFetch<T>(path: string, options: RequestOptions = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Request failed");
  }

  return payload.data;
}

export const api = {
  signup: (body: { name: string; email: string; password: string; role: string }) =>
    apiFetch<{ user: User; token: string }>("/auth/signup", {
      method: "POST",
      body
    }),
  login: (body: { email: string; password: string }) =>
    apiFetch<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body
    }),
  me: () => apiFetch<User>("/auth/me"),
  dashboard: () => apiFetch<DashboardSummary>("/dashboard/summary"),
  projects: () => apiFetch<Project[]>("/projects"),
  project: (id: string) => apiFetch<Project>(`/projects/${id}`),
  createProject: (body: { name: string; description?: string; location?: string }) =>
    apiFetch<Project>("/projects", { method: "POST", body }),
  updateProject: (
    id: string,
    body: { name: string; description?: string; location?: string }
  ) => apiFetch<Project>(`/projects/${id}`, { method: "PUT", body }),
  deleteProject: (id: string) =>
    apiFetch<null>(`/projects/${id}`, { method: "DELETE" }),
  addProjectMember: (id: string, body: { email: string }) =>
    apiFetch(`/projects/${id}/members`, { method: "POST", body }),
  removeProjectMember: (id: string, userId: string) =>
    apiFetch(`/projects/${id}/members/${userId}`, { method: "DELETE" }),
  tasks: (params?: {
    status?: TaskStatus;
    priority?: Priority;
    category?: TaskCategory;
    overdue?: boolean;
    projectId?: string;
  }) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.priority) search.set("priority", params.priority);
    if (params?.category) search.set("category", params.category);
    if (params?.overdue) search.set("overdue", "true");
    if (params?.projectId) search.set("projectId", params.projectId);
    const query = search.toString();
    return apiFetch<Task[]>(`/tasks${query ? `?${query}` : ""}`);
  },
  createTask: (body: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: Priority;
    category: TaskCategory;
    dueDate: string;
    projectId: string;
    assignedToId: string;
  }) => apiFetch<Task>("/tasks", { method: "POST", body }),
  updateTaskStatus: (id: string, status: TaskStatus) =>
    apiFetch<Task>(`/tasks/${id}/status`, {
      method: "PATCH",
      body: { status }
    }),
  deleteTask: (id: string) =>
    apiFetch<null>(`/tasks/${id}`, { method: "DELETE" })
};

