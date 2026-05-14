import { TaskCategory, categoryLabels } from "@/lib/types";

type Props = {
  category: TaskCategory;
};

export function CategoryBadge({ category }: Props) {
  return (
    <span className="inline-flex rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-field ring-1 ring-emerald-100">
      {categoryLabels[category]}
    </span>
  );
}

