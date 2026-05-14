"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Loader2,
  Recycle,
  Timer
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatCard } from "@/components/StatCard";
import { TaskTable } from "@/components/TaskTable";
import { api } from "@/lib/api";
import { DashboardSummary, TaskStatus, User } from "@/lib/types";

function DashboardContent({ user }: { user: User }) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);
      setSummary(await api.dashboard());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function updateStatus(taskId: string, status: TaskStatus) {
    await api.updateTaskStatus(taskId, status);
    await loadDashboard();
  }

  const totalForChart = useMemo(() => summary?.totalTasks || 1, [summary]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  }

  if (!summary) return null;

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500">
          {user.role === "ADMIN"
            ? "Summary across waste zones you manage."
            : "Summary of waste operations assigned to you."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Active Zones" value={summary.totalProjects} detail="Visible waste zones" icon={FolderKanban} />
        <StatCard title="Total Tasks" value={summary.totalTasks} detail="Collection and inspection work" icon={Recycle} tone="slate" />
        <StatCard title="Overdue Tasks" value={summary.overdueTasks} detail="Past due and not done" icon={Timer} tone={summary.overdueTasks ? "red" : "slate"} />
        <StatCard title="In Progress" value={summary.inProgressTasks} detail="Currently being handled" icon={Clock3} tone="amber" />
        <StatCard title="Completed" value={summary.completedTasks} detail="Finished operations" icon={CheckCircle2} />
        <StatCard title="High Priority" value={summary.highPriorityTasks} detail="Alerts needing attention" icon={AlertTriangle} tone={summary.highPriorityTasks ? "red" : "slate"} />
      </div>

      <section className="panel p-5">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-ink">Task Status Summary</h3>
          <p className="text-sm text-slate-500">A quick split of todo, in-progress, and completed work.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Todo", summary.todoTasks, "bg-slate-500"],
            ["In Progress", summary.inProgressTasks, "bg-amber-500"],
            ["Completed", summary.completedTasks, "bg-field"]
          ].map(([label, value, color]) => (
            <div key={label as string}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-semibold text-slate-700">{label}</span>
                <span className="text-slate-500">{value as number}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full ${color}`}
                  style={{ width: `${Math.round(((value as number) / totalForChart) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <div>
          <h3 className="text-lg font-bold text-ink">Recent Tasks</h3>
          <p className="text-sm text-slate-500">Latest waste operations in your visible scope.</p>
        </div>
        <TaskTable tasks={summary.recentTasks} user={user} onStatusChange={updateStatus} />
      </section>

      <section className="grid gap-4">
        <div>
          <h3 className="text-lg font-bold text-ink">My Assigned Tasks</h3>
          <p className="text-sm text-slate-500">Work directly assigned to your account.</p>
        </div>
        <TaskTable tasks={summary.myAssignedTasks} user={user} onStatusChange={updateStatus} compact />
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return <ProtectedRoute>{(user) => <DashboardContent user={user} />}</ProtectedRoute>;
}

