"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Save, Trash2, UserMinus, UserPlus } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TaskTable } from "@/components/TaskTable";
import { api } from "@/lib/api";
import {
  categoryLabels,
  priorities,
  Priority,
  priorityLabels,
  Project,
  TaskCategory,
  TaskStatus,
  taskCategories,
  User
} from "@/lib/types";

type TaskForm = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  category: TaskCategory;
  dueDate: string;
  assignedToId: string;
};

const emptyTaskForm: TaskForm = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  category: "BIN_PICKUP",
  dueDate: "",
  assignedToId: ""
};

function ProjectDetailsContent({ user }: { user: User }) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;
  const [project, setProject] = useState<Project | null>(null);
  const [editing, setEditing] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: "", description: "", location: "" });
  const [memberEmail, setMemberEmail] = useState("");
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProject() {
    try {
      setLoading(true);
      const data = await api.project(projectId);
      setProject(data);
      setProjectForm({
        name: data.name,
        description: data.description || "",
        location: data.location || ""
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load zone");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const assignableMembers = useMemo(
    () => project?.members?.map((member) => member.user).filter((member) => member.role === "MEMBER") || [],
    [project]
  );

  async function handleUpdateProject(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await api.updateProject(projectId, projectForm);
      setEditing(false);
      setNotice("Waste zone updated successfully.");
      await loadProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update zone");
    }
  }

  async function handleDeleteProject() {
    const confirmed = window.confirm("Delete this waste zone and its tasks?");
    if (!confirmed) return;
    await api.deleteProject(projectId);
    router.replace("/projects");
  }

  async function addMember(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await api.addProjectMember(projectId, { email: memberEmail });
      setMemberEmail("");
      setNotice("Member added to zone.");
      await loadProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add member");
    }
  }

  async function removeMember(memberId: string) {
    setError("");
    setNotice("");
    try {
      await api.removeProjectMember(projectId, memberId);
      setNotice("Member removed from zone.");
      await loadProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove member");
    }
  }

  async function createTask(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      await api.createTask({ ...taskForm, projectId });
      setTaskForm(emptyTaskForm);
      setNotice("Waste task created successfully.");
      await loadProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create task");
    }
  }

  async function updateStatus(taskId: string, status: TaskStatus) {
    await api.updateTaskStatus(taskId, status);
    await loadProject();
  }

  async function deleteTask(taskId: string) {
    await api.deleteTask(taskId);
    await loadProject();
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading waste zone...
      </div>
    );
  }

  if (!project) {
    return <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error || "Zone not found"}</div>;
  }

  return (
    <div className="grid gap-6">
      <Link className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-field" href="/projects">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to zones
      </Link>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-700">{notice}</div>}

      <section className="panel p-5">
        {editing ? (
          <form className="grid gap-4" onSubmit={handleUpdateProject}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="field-label">Zone name</span>
                <input
                  className="field-input"
                  value={projectForm.name}
                  onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })}
                  required
                />
              </label>
              <label className="grid gap-1.5">
                <span className="field-label">Location</span>
                <input
                  className="field-input"
                  value={projectForm.location}
                  onChange={(event) => setProjectForm({ ...projectForm, location: event.target.value })}
                />
              </label>
              <label className="grid gap-1.5 md:col-span-2">
                <span className="field-label">Description</span>
                <textarea
                  className="field-input min-h-24"
                  value={projectForm.description}
                  onChange={(event) =>
                    setProjectForm({ ...projectForm, description: event.target.value })
                  }
                />
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button className="secondary-button" type="button" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button className="primary-button" type="submit">
                <Save className="h-4 w-4" aria-hidden="true" />
                Save
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-ink">{project.name}</h2>
              <p className="mt-2 text-sm text-slate-500">{project.location || "Location not set"}</p>
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                {project.description || "No description added for this waste zone."}
              </p>
            </div>
            {user.role === "ADMIN" && (
              <div className="flex gap-2">
                <button className="secondary-button" type="button" onClick={() => setEditing(true)}>
                  Edit
                </button>
                <button className="danger-button" type="button" onClick={handleDeleteProject}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-ink">Field Members</h3>
              <p className="text-sm text-slate-500">People with access to this waste zone.</p>
            </div>
          </div>
          <div className="grid gap-3">
            {project.members?.map((member) => (
              <div key={member.id} className="flex items-center justify-between gap-3 rounded-md border border-line p-3">
                <div>
                  <p className="font-semibold text-ink">{member.user.name}</p>
                  <p className="text-sm text-slate-500">{member.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {member.user.role === "ADMIN" ? "Admin" : "Member"}
                  </span>
                  {user.role === "ADMIN" && member.user.id !== user.id && (
                    <button
                      className="danger-button px-2.5"
                      type="button"
                      onClick={() => removeMember(member.user.id)}
                      aria-label={`Remove ${member.user.name}`}
                    >
                      <UserMinus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {user.role === "ADMIN" && (
            <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={addMember}>
              <input
                className="field-input"
                placeholder="member@ecotrack.com"
                type="email"
                value={memberEmail}
                onChange={(event) => setMemberEmail(event.target.value)}
                required
              />
              <button className="primary-button min-w-fit" type="submit">
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Add Member
              </button>
            </form>
          )}
        </div>

        {user.role === "ADMIN" && (
          <form className="panel grid gap-4 p-5" onSubmit={createTask}>
            <div>
              <h3 className="text-lg font-bold text-ink">Create Waste Task</h3>
              <p className="text-sm text-slate-500">Assign a pickup, inspection, cleaning, or alert task.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 md:col-span-2">
                <span className="field-label">Title</span>
                <input
                  className="field-input"
                  value={taskForm.title}
                  onChange={(event) => setTaskForm({ ...taskForm, title: event.target.value })}
                  required
                />
              </label>
              <label className="grid gap-1.5 md:col-span-2">
                <span className="field-label">Description</span>
                <textarea
                  className="field-input min-h-20"
                  value={taskForm.description}
                  onChange={(event) => setTaskForm({ ...taskForm, description: event.target.value })}
                />
              </label>
              <label className="grid gap-1.5">
                <span className="field-label">Category</span>
                <select
                  className="field-input"
                  value={taskForm.category}
                  onChange={(event) =>
                    setTaskForm({ ...taskForm, category: event.target.value as TaskCategory })
                  }
                >
                  {taskCategories.map((category) => (
                    <option key={category} value={category}>
                      {categoryLabels[category]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className="field-label">Priority</span>
                <select
                  className="field-input"
                  value={taskForm.priority}
                  onChange={(event) =>
                    setTaskForm({ ...taskForm, priority: event.target.value as Priority })
                  }
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priorityLabels[priority]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className="field-label">Due date</span>
                <input
                  className="field-input"
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) => setTaskForm({ ...taskForm, dueDate: event.target.value })}
                  required
                />
              </label>
              <label className="grid gap-1.5">
                <span className="field-label">Assignee</span>
                <select
                  className="field-input"
                  value={taskForm.assignedToId}
                  onChange={(event) => setTaskForm({ ...taskForm, assignedToId: event.target.value })}
                  required
                >
                  <option value="">Select member</option>
                  {assignableMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex justify-end">
              <button className="primary-button" type="submit">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create Task
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="grid gap-4">
        <div>
          <h3 className="text-lg font-bold text-ink">Zone Tasks</h3>
          <p className="text-sm text-slate-500">
            {user.role === "ADMIN"
              ? "All collection and inspection work in this zone."
              : "Tasks assigned to you in this zone."}
          </p>
        </div>
        <TaskTable
          tasks={project.tasks || []}
          user={user}
          onStatusChange={updateStatus}
          onDelete={user.role === "ADMIN" ? deleteTask : undefined}
          compact
        />
      </section>
    </div>
  );
}

export default function ProjectDetailsPage() {
  return <ProtectedRoute>{(user) => <ProjectDetailsContent user={user} />}</ProtectedRoute>;
}
