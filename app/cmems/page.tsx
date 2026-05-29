import { AppShell } from "@/components/layout/AppShell";
import { ForecastViewer } from "@/components/cmems/ForecastViewer";

const forecastFiles = [
  {
    title: "Current Direction",
    variable: "Current Direction",
    description:
      "Forecast visualization for ocean current direction around the heavy dark island region.",
    href: "/forecasts/cmems/complete_heavy_dark_island_current_direction.html",
  },
  {
    title: "Current Speed",
    variable: "Current Speed",
    description:
      "Forecast visualization for ocean current speed around the heavy dark island region.",
    href: "/forecasts/cmems/complete_heavy_dark_island_current_speed.html",
  },
  {
    title: "Salinity",
    variable: "Salinity / so",
    description:
      "Forecast visualization for salinity based on the CMEMS variable so.",
    href: "/forecasts/cmems/complete_heavy_dark_island_salinity_so.html",
  },
  {
    title: "Sea Surface Temperature",
    variable: "SST / thetao",
    description:
      "Forecast visualization for sea surface temperature based on the CMEMS variable thetao.",
    href: "/forecasts/cmems/complete_heavy_dark_island_sst_thetao.html",
  },
];

export default function CmemsPage() {
  return (
    <AppShell
      title="CMEMS Forecast Analysis"
      description="Forecast visualizations generated from local CMEMS processing outputs. Heavy HTML files are loaded on demand to keep the dashboard responsive."
    >
      <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold tracking-tight text-slate-950">
          Lightweight Forecast Loader
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          The previous layout embedded all forecast HTML files at once. That is
          expensive because each iframe loads its own scripts, data, and renderer.
          This page now loads only the selected forecast.
        </p>
      </section>

      <ForecastViewer files={forecastFiles} />
    </AppShell>
  );
}