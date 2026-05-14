import { Priority, priorityLabels } from "@/lib/types";

type Props = {
  priority: Priority;
};

export function PriorityBadge({ priority }: Props) {
  const classes = {
    LOW: "bg-slate-50 text-slate-600 ring-slate-200",
    MEDIUM: "bg-sky-50 text-sky-700 ring-sky-200",
    HIGH: "bg-red-50 text-red-700 ring-red-200"
  }[priority];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${classes}`}>
      {priorityLabels[priority]}
    </span>
  );
}

