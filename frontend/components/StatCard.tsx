import { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: number;
  detail: string;
  icon: LucideIcon;
  tone?: "green" | "amber" | "red" | "slate";
};

const toneClasses = {
  green: "bg-emerald-50 text-field",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  slate: "bg-slate-100 text-slate-700"
};

export function StatCard({ title, value, detail, icon: Icon, tone = "green" }: Props) {
  return (
    <section className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
        </div>
        <div className={`rounded-md p-2.5 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{detail}</p>
    </section>
  );
}

