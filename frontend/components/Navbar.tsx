"use client";

import { User } from "@/lib/types";

type Props = {
  user: User;
};

export function Navbar({ user }: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">EcoTrack</p>
          <h1 className="text-lg font-semibold text-ink">Smart Waste Operations</h1>
        </div>
        <div className="flex items-center gap-3 rounded-md border border-line bg-slate-50 px-3 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-field text-sm font-bold text-white">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{user.name}</p>
            <p className="text-xs text-slate-500">{user.role === "ADMIN" ? "Admin" : "Member"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

