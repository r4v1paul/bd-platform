import { AppShell } from "@/components/layout/AppShell";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { StatCard } from "@/components/ui/StatCard";

const modules = [
  {
    title: "Tender Analytics",
    href: "/tenders",
    status: "Next",
    description:
      "Track asphalt tenders, awarded projects, project values, regional demand, and contractor activity.",
  },
  {
    title: "Asphalt Calculator",
    href: "/asphalt-calculator",
    status: "Active",
    description:
      "Estimate asphalt volume, asphalt mass, and bitumen requirement from road geometry.",
  },
  {
    title: "Bitumen Sources",
    href: "/bitumen",
    status: "Planned",
    description:
      "Build a structured global bitumen source database with sourcing score and risk indicators.",
  },
  {
    title: "Equipment Trade",
    href: "/equipment",
    status: "Planned",
    description:
      "Analyze importer demand, HS-code trade flow, export potential, unit price, and market growth.",
  },
  {
    title: "CMEMS Analysis",
    href: "/cmems",
    status: "Planned",
    description:
      "Process local marine datasets into operational risk indicators, summaries, and geospatial outputs.",
  },
  {
    title: "Reports",
    href: "/reports",
    status: "Planned",
    description:
      "Generate internal BD reports from tender analytics, sourcing analysis, and CMEMS results.",
  },
];

export default function HomePage() {
  return (
    <AppShell
      title="Business Development Intelligence Dashboard"
      description="Local-first analytical platform for asphalt tenders, bitumen sourcing, CMEMS processing, and handling equipment trade analysis."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="System Status"
          value="Local"
          helper="Running from laptop environment"
        />
        <StatCard
          label="Database"
          value="SQLite"
          helper="Single local development database"
        />
        <StatCard
          label="Processing Mode"
          value="Manual"
          helper="Automation will be added later"
        />
        <StatCard
          label="Current Phase"
          value="MVP"
          helper="Dashboard and analytics foundation"
        />
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-slate-950">
              Platform Modules
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Build the platform progressively. The calculator module validates
              the calculation layer first; upload, tender analytics, CMEMS
              processing, and report export can then be added module by module.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
            Recommended next step: tender CSV import
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <ModuleCard key={module.href} {...module} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
