import { AppShell } from "@/components/layout/AppShell";
import { ProvinceDemandChart } from "@/components/charts/ProvinceDemandChart";
import { RegionalDemandIndexChart } from "@/components/charts/RegionalDemandIndexChart";
import { prisma } from "@/lib/prisma";

function formatNumber(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined) return "-";

  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
}

function formatCurrencyIdr(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";

  return `Rp ${value.toLocaleString("id-ID", {
    maximumFractionDigits: 0,
  })}`;
}

function formatCurrencyIdrCompact(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";

  const absValue = Math.abs(value);

  if (absValue >= 1_000_000_000_000) {
    return `Rp ${(value / 1_000_000_000_000).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} T`;
  }

  if (absValue >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} Miliar`;
  }

  if (absValue >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} Juta`;
  }

  return formatCurrencyIdr(value);
}

export default async function AsphaltMarketPage() {
  const totalPackages = await prisma.asphaltMarket.count();

  const marketAgg = await prisma.asphaltMarket.aggregate({
    _sum: {
      value: true,
      kebutuhanAspal: true,
    },
  });

  const topProvinces = await prisma.asphaltMarket.groupBy({
    by: ["provinsi"],
    _count: {
      id: true,
    },
    _sum: {
      value: true,
      kebutuhanAspal: true,
    },
    where: {
      provinsi: {
        not: null,
      },
    },
    orderBy: {
      _sum: {
        kebutuhanAspal: "desc",
      },
    },
    take: 15,
  });

  const topRegions = await prisma.regionalDemandIndex.findMany({
    orderBy: {
      demandIndex: "desc",
    },
    take: 20,
  });

  const fundingSources = await prisma.asphaltMarket.groupBy({
    by: ["sumberDana"],
    _count: {
      id: true,
    },
    _sum: {
      value: true,
      kebutuhanAspal: true,
    },
    where: {
      sumberDana: {
        not: null,
      },
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 10,
  });

  const provinceDemandChartData = topProvinces.slice(0, 10).map((row) => ({
    province: row.provinsi ?? "Unknown",
    demandTonnes: row._sum.kebutuhanAspal ?? 0,
  }));

  const regionalDemandChartData = topRegions.slice(0, 10).map((row) => ({
    region: row.kabupatenKota ?? row.wilayah ?? "Unknown",
    demandIndex: row.demandIndex ?? 0,
  }));

  return (
    <AppShell
      title="Indonesia Asphalt Market"
      description="Dashboard built from the imported asphalt tender/project market dataset."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard
          label="Market Records"
          value={formatNumber(totalPackages)}
          helper="Clean asphalt-related rows"
        />

        <KpiCard
          label="Total HPS / Market Value"
          value={formatCurrencyIdrCompact(marketAgg._sum.value)}
          helper={`Full value: ${formatCurrencyIdr(marketAgg._sum.value)}`}
        />

        <KpiCard
          label="Estimated Asphalt Demand"
          value={`${formatNumber(marketAgg._sum.kebutuhanAspal, 2)} tons`}
          helper="Sum of Kebutuhan Aspal"
        />
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold tracking-tight text-slate-950">
          Market Value Interpretation
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          The HPS / market value card uses compact notation because the raw IDR
          value is large. “T” means trillion rupiah. This total is the raw sum of
          the imported Value field, so later we should add deduplication checks
          for repeated Kode Tender, Kode RUP, or repeated package names.
        </p>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">
            Top Province Demand Chart
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Top 10 provinces by estimated asphalt demand.
          </p>
          <div className="mt-6">
            <ProvinceDemandChart data={provinceDemandChartData} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">
            Regional Demand Index Chart
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Top 10 regional demand index values.
          </p>
          <div className="mt-6">
            <RegionalDemandIndexChart data={regionalDemandChartData} />
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h3 className="text-lg font-semibold tracking-tight text-slate-950">
              Top Provinces by Asphalt Demand
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Ranked by total estimated asphalt requirement.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Province</th>
                  <th className="px-6 py-4 text-right">Packages</th>
                  <th className="px-6 py-4 text-right">Total HPS</th>
                  <th className="px-6 py-4 text-right">Asphalt Demand</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {topProvinces.map((row) => (
                  <tr
                    key={row.provinsi ?? "unknown"}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-950">
                      {row.provinsi ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      {formatNumber(row._count.id)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      {formatCurrencyIdrCompact(row._sum.value)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-950">
                      {formatNumber(row._sum.kebutuhanAspal, 2)} tons
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h3 className="text-lg font-semibold tracking-tight text-slate-950">
              Funding Source Summary
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Package count and demand by source of funds.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {fundingSources.map((row) => (
              <div key={row.sumberDana ?? "unknown"} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-950">
                      {row.sumberDana ?? "-"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatNumber(row._count.id)} packages
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-950">
                      {formatNumber(row._sum.kebutuhanAspal, 2)} tons
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatCurrencyIdrCompact(row._sum.value)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">
            Top Regional Demand Index
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Uses the precomputed regional_demand_index sheet from your Excel
            file.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Province</th>
                <th className="px-6 py-4 text-right">Year</th>
                <th className="px-6 py-4 text-right">Packages</th>
                <th className="px-6 py-4 text-right">Total HPS</th>
                <th className="px-6 py-4 text-right">Asphalt Demand</th>
                <th className="px-6 py-4 text-right">Index</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {topRegions.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-950">
                    {row.kabupatenKota ?? row.wilayah ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {row.provinsi ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {row.tahunAnggaran ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {formatNumber(row.packageCount)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {formatCurrencyIdrCompact(row.totalHps)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {formatNumber(row.totalAsphaltTon, 2)} tons
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-950">
                    {formatNumber(row.demandIndex, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

function KpiCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 break-words text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-400">{helper}</p>
    </div>
  );
}