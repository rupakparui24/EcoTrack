"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  Leaf,
  LogOut
} from "lucide-react";
import { clearSession } from "@/lib/auth";
import { User } from "@/lib/types";

type Props = {
  user: User;
};

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Waste Zones", icon: FolderKanban },
  { href: "/tasks", label: "Collection Tasks", icon: ClipboardList }
];

export function Sidebar({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <aside className="flex border-b border-line bg-white md:min-h-screen md:w-72 md:flex-col md:border-b-0 md:border-r">
      <div className="hidden items-center gap-3 border-b border-line px-6 py-5 md:flex">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-field text-white">
          <Leaf className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-lg font-bold text-ink">EcoTrack</p>
          <p className="text-xs text-slate-500">Waste operations dashboard</p>
        </div>
      </div>

      <nav className="flex w-full gap-2 overflow-x-auto px-3 py-3 md:flex-1 md:flex-col md:px-4 md:py-5">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-w-fit items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-mist text-field"
                  : "text-slate-600 hover:bg-slate-50 hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-line p-4 md:block">
        <div className="mb-3 rounded-md bg-slate-50 p-3">
          <p className="text-sm font-semibold text-ink">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
        <button className="secondary-button w-full" onClick={logout} type="button">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
}

