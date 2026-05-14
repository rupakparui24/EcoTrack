"use client";

import { Trash2 } from "lucide-react";
import {
  categoryLabels,
  statusLabels,
  Task,
  TaskStatus,
  taskStatuses,
  User
} from "@/lib/types";
import { CategoryBadge } from "./CategoryBadge";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import { EmptyState } from "./EmptyState";

type Props = {
  tasks: Task[];
  user: User;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
  compact?: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function TaskTable({
  tasks,
  user,
  onStatusChange,
  onDelete,
  compact = false
}: Props) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No waste tasks found"
        description="Tasks will appear here when a zone admin assigns collection, inspection, or complaint work."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Task</th>
              {!compact && <th className="px-4 py-3">Zone</th>}
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tasks.map((task) => (
              <tr key={task.id} className="align-top">
                <td className="max-w-xs px-4 py-4">
                  <p className="font-semibold text-ink">{task.title}</p>
                  {task.description && (
                    <p className="mt-1 line-clamp-2 text-slate-500">{task.description}</p>
                  )}
                </td>
                {!compact && (
                  <td className="px-4 py-4 text-slate-600">
                    {task.project?.name || "Unassigned zone"}
                  </td>
                )}
                <td className="px-4 py-4">
                  <CategoryBadge category={task.category} />
                  <span className="sr-only">{categoryLabels[task.category]}</span>
                </td>
                <td className="px-4 py-4">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-4 py-4 text-slate-600">{formatDate(task.dueDate)}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={task.status} dueDate={task.dueDate} />
                </td>
                <td className="px-4 py-4 text-slate-600">{task.assignedTo?.name || "Member"}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {onStatusChange && (
                      <select
                        className="field-input min-w-36 py-1.5"
                        value={task.status}
                        onChange={(event) =>
                          onStatusChange(task.id, event.target.value as TaskStatus)
                        }
                        aria-label={`Update ${task.title} status`}
                      >
                        {taskStatuses.map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    )}
                    {user.role === "ADMIN" && onDelete && (
                      <button
                        className="danger-button px-2.5"
                        onClick={() => onDelete(task.id)}
                        type="button"
                        aria-label={`Delete ${task.title}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

