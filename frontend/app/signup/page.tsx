"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { setSession } from "@/lib/auth";
import { Role } from "@/lib/types";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "MEMBER" as Role
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const session = await api.signup(form);
      setSession(session.token, session.user);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-mist px-4 py-10">
      <section className="panel w-full max-w-md p-6">
        <div className="mb-6">
          <Link className="text-sm font-semibold text-field" href="/">
            EcoTrack
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-ink">Create account</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Role selection is enabled for demo review of admin and member flows.
          </p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1.5">
            <span className="field-label">Name</span>
            <input
              className="field-input"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
          <label className="grid gap-1.5">
            <span className="field-label">Email</span>
            <input
              className="field-input"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label className="grid gap-1.5">
            <span className="field-label">Password</span>
            <input
              className="field-input"
              type="password"
              minLength={6}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          <label className="grid gap-1.5">
            <span className="field-label">Role</span>
            <select
              className="field-input"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as Role })}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button className="primary-button w-full" disabled={loading} type="submit">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {loading ? "Creating..." : "Signup"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="font-semibold text-field" href="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}

