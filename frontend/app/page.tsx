import Link from "next/link";
import { ArrowRight, ClipboardCheck, MapPin, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f6faf7]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div>
          <p className="text-xl font-bold text-ink">EcoTrack</p>
          <p className="text-sm text-slate-500">Smart Waste Management Operations Dashboard</p>
        </div>
        <div className="flex gap-3">
          <Link className="secondary-button" href="/login">
            Login
          </Link>
          <Link className="primary-button" href="/signup">
            Signup
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-8 md:grid-cols-[1.05fr_0.95fr] md:items-center md:pt-16">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-mist px-3 py-1 text-sm font-semibold text-field ring-1 ring-emerald-100">
            Municipal and campus field operations
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-ink md:text-6xl">
            EcoTrack
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            A practical dashboard for waste zones, field members, collection tasks,
            overdue pickups, and high-priority alerts.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="primary-button" href="/login">
              Open dashboard
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link className="secondary-button" href="/signup">
              Create account
            </Link>
          </div>
        </div>

        <div className="panel p-5">
          <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
            <div>
              <p className="text-sm text-slate-500">Today&apos;s route view</p>
              <h2 className="text-lg font-bold text-ink">University Campus North Zone</h2>
            </div>
            <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700 ring-1 ring-red-200">
              2 overdue
            </span>
          </div>
          <div className="grid gap-3">
            {[
              {
                icon: MapPin,
                title: "Overflow inspection",
                detail: "Library Gate bin needs field verification"
              },
              {
                icon: ClipboardCheck,
                title: "Segregation check",
                detail: "Green Valley dry waste compliance completed"
              },
              {
                icon: ShieldCheck,
                title: "Hazardous alert",
                detail: "Workshop area requires high-priority handling"
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-md border border-line bg-slate-50 p-4"
                >
                  <div className="rounded-md bg-white p-2 text-field">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

