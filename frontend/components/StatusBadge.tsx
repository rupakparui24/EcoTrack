import { Task, TaskStatus, statusLabels } from "@/lib/types";

type Props = {
  status: TaskStatus;
  dueDate?: Task["dueDate"];
};

function isOverdue(dueDate?: string, status?: TaskStatus) {
  if (!dueDate || status === "DONE") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}

export function StatusBadge({ status, dueDate }: Props) {
  if (isOverdue(dueDate, status)) {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
        Overdue
      </span>
    );
  }

  const classes = {
    TODO: "bg-slate-100 text-slate-700 ring-slate-200",
    IN_PROGRESS: "bg-amber-50 text-amber-800 ring-amber-200",
    DONE: "bg-emerald-50 text-emerald-700 ring-emerald-200"
  }[status];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${classes}`}>
      {statusLabels[status]}
    </span>
  );
}

