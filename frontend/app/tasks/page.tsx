"use client";

import { useEffect, useState } from "react";
import { Filter, Loader2, RotateCcw } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TaskTable } from "@/components/TaskTable";
import { api } from "@/lib/api";
import {
  categoryLabels,
  priorities,
  priorityLabels,
  Task,
  TaskCategory,
  TaskStatus,
  taskCategories,
  taskStatuses,
  statusLabels,
  User
} from "@/lib/types";

type Filters = {
  status: "" | TaskStatus;
  priority: "" | "LOW" | "MEDIUM" | "HIGH";
  category: "" | TaskCategory;
  overdue: boolean;
};

function TasksContent({ user }: { user: User }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<Filters>({
    status: "",
    priority: "",
    category: "",
    overdue: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTasks(nextFilters = filters) {
    try {
      setLoading(true);
      setTasks(
        await api.tasks({
          status: nextFilters.status || undefined,
          priority: nextFilters.priority || undefined,
          category: nextFilters.category || undefined,
          overdue: nextFilters.overdue
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function updateStatus(taskId: string, status: TaskStatus) {
    await api.updateTaskStatus(taskId, status);
    await loadTasks();
  }

  async function deleteTask(taskId: string) {
    await api.deleteTask(taskId);
    await loadTasks();
  }

  function applyFilter(next: Filters) {
    setFilters(next);
    loadTasks(next);
  }

  function resetFilters() {
    const next = { status: "", priority: "", category: "", overdue: false } as Filters;
    applyFilter(next);
  }

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Collection Tasks</h2>
        <p className="mt-1 text-sm text-slate-500">
          Filter waste pickups, inspections, recycling transfers, complaints, and route cleaning.
        </p>
      </div>

      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-field" aria-hidden="true" />
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">Filters</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          <label className="grid gap-1.5">
            <span className="field-label">Status</span>
            <select
              className="field-input"
              value={filters.status}
              onChange={(event) => applyFilter({ ...filters, status: event.target.value as Filters["status"] })}
            >
              <option value="">All statuses</option>
              {taskStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="field-label">Priority</span>
            <select
              className="field-input"
              value={filters.priority}
              onChange={(event) => applyFilter({ ...filters, priority: event.target.value as Filters["priority"] })}
            >
              <option value="">All priorities</option>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priorityLabels[priority]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="field-label">Category</span>
            <select
              className="field-input"
              value={filters.category}
              onChange={(event) => applyFilter({ ...filters, category: event.target.value as Filters["category"] })}
            >
              <option value="">All categories</option>
              {taskCategories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-end gap-2 rounded-md border border-line bg-white px-3 py-2">
            <input
              checked={filters.overdue}
              className="h-4 w-4 accent-field"
              type="checkbox"
              onChange={(event) => applyFilter({ ...filters, overdue: event.target.checked })}
            />
            <span className="text-sm font-medium text-slate-700">Overdue only</span>
          </label>
          <button className="secondary-button self-end" type="button" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading collection tasks...
        </div>
      ) : (
        <TaskTable
          tasks={tasks}
          user={user}
          onStatusChange={updateStatus}
          onDelete={user.role === "ADMIN" ? deleteTask : undefined}
        />
      )}
    </div>
  );
}

export default function TasksPage() {
  return <ProtectedRoute>{(user) => <TasksContent user={user} />}</ProtectedRoute>;
}

