import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Asphalt Market", href: "/asphalt-market" },
  { label: "Imports", href: "/imports" },
  { label: "Demand vs Import", href: "/demand-supply" },
  { label: "Tenders", href: "/tenders" },
  { label: "Asphalt Calculator", href: "/asphalt-calculator" },
  { label: "Bitumen Sources", href: "/bitumen" },
  { label: "Equipment Trade", href: "/equipment" },
  { label: "CMEMS Analysis", href: "/cmems" },
  { label: "Reports", href: "/reports" },
];


export function AppShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-white px-5 py-6 lg:block">
          <div className="mb-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
              BD
            </div>
            <h1 className="mt-4 text-lg font-semibold tracking-tight">
              BD Intelligence
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Local analytical platform
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              System Mode
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Local-first prototype
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Data is stored locally using SQLite and local project folders.
            </p>
          </div>
        </aside>

        <section className="flex-1">
          <header className="border-b border-slate-200 bg-white/80 px-6 py-5 backdrop-blur">
            <div className="mx-auto max-w-7xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Private Business Development Platform
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {title}
              </h2>
              {description ? (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  {description}
                </p>
              ) : null}
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
