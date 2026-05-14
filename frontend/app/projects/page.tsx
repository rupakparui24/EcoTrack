"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ProjectCard } from "@/components/ProjectCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { api } from "@/lib/api";
import { Project, User } from "@/lib/types";

function ProjectsContent({ user }: { user: User }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({ name: "", description: "", location: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadProjects() {
    try {
      setLoading(true);
      setProjects(await api.projects());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function createProject(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.createProject(form);
      setForm({ name: "", description: "", location: "" });
      setShowForm(false);
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create project");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-ink">Waste Zones</h2>
          <p className="mt-1 text-sm text-slate-500">
            Zones and campaigns where field waste operations are planned.
          </p>
        </div>
        {user.role === "ADMIN" && (
          <button className="primary-button" type="button" onClick={() => setShowForm((value) => !value)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create Zone
          </button>
        )}
      </div>

      {showForm && user.role === "ADMIN" && (
        <form className="panel grid gap-4 p-5" onSubmit={createProject}>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-1.5">
              <span className="field-label">Zone name</span>
              <input
                className="field-input"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </label>
            <label className="grid gap-1.5">
              <span className="field-label">Location</span>
              <input
                className="field-input"
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
              />
            </label>
            <label className="grid gap-1.5 md:col-span-3">
              <span className="field-label">Description</span>
              <textarea
                className="field-input min-h-24"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <button className="secondary-button" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button className="primary-button" disabled={saving} type="submit">
              {saving ? "Saving..." : "Save Zone"}
            </button>
          </div>
        </form>
      )}

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading waste zones...
        </div>
      ) : projects.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No waste zones yet"
          description="Create a zone such as a campus route, apartment block, market road, or recycling campaign."
        />
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return <ProtectedRoute>{(user) => <ProjectsContent user={user} />}</ProtectedRoute>;
}

