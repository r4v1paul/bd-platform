import Link from "next/link";

export function ModuleCard({
  title,
  description,
  href,
  status = "Ready",
}: {
  title: string;
  description: string;
  href: string;
  status?: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold tracking-tight text-slate-950">
          {title}
        </h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          {status}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">{description}</p>

      <p className="mt-6 text-sm font-medium text-slate-900">
        Open module
        <span className="ml-1 inline-block transition group-hover:translate-x-1">
          →
        </span>
      </p>
    </Link>
  );
}
