import Link from "next/link";
import { MapPin, Users, ClipboardList } from "lucide-react";
import { Project } from "@/lib/types";

type Props = {
  project: Project;
};

export function ProjectCard({ project }: Props) {
  return (
    <Link href={`/projects/${project.id}`} className="panel block p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-ink">{project.name}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
            {project.description || "No description added for this waste zone."}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          {project.location || "Location not set"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-4 w-4" aria-hidden="true" />
          {project._count?.members ?? project.members?.length ?? 0} members
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          {project._count?.tasks ?? project.tasks?.length ?? 0} tasks
        </span>
      </div>
    </Link>
  );
}

