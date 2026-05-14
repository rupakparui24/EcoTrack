"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearSession, getStoredUser, getToken, setSession } from "@/lib/auth";
import { User } from "@/lib/types";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

type Props = {
  children: (user: User) => React.ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    api
      .me()
      .then((freshUser) => {
        setUser(freshUser);
        setSession(token, freshUser);
      })
      .catch(() => {
        clearSession();
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !user) {
    return (
      <main className="grid min-h-screen place-items-center bg-mist px-4">
        <div className="panel px-6 py-5 text-sm font-medium text-slate-600">
          Loading EcoTrack workspace...
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen md:flex">
      <Sidebar user={user} />
      <div className="min-w-0 flex-1">
        <Navbar user={user} />
        <main className="px-4 py-6 md:px-8">{children(user)}</main>
      </div>
    </div>
  );
}

