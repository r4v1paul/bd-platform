import { AppShell } from "@/components/layout/AppShell";
import { prisma } from "@/lib/prisma";

function formatNumber(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "-";

  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
}

function compactUsd(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "-";

  const absValue = Math.abs(value);

  if (absValue >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })}B`;
  }

  if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })}M`;
  }

  if (absValue >= 1_000) {
    return `$${(value / 1_000).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })}K`;
  }

  return `$${value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "-";

  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: 1,
  })}%`;
}

export default async function BitumenPage() {
  const totalRecords = await prisma.bitumenImporterMonthly.count();

  if (totalRecords === 0) {
    return (
      <AppShell
        title="Bitumen Trade Market"
        description="Monthly importer-value analysis for HS/Product 2714."
      >
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-8 shadow-sm">
          <h3 className="text-xl font-semibold tracking-tight text-amber-950">
            No bitumen trade data loaded
          </h3>
          <p className="mt-3 text-sm leading-6 text-amber-800">
            The BitumenImporterMonthly table is empty. Run the import script first:
          </p>
          <pre className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-800">
            npm run import:bitumen
          </pre>
        </section>
      </AppShell>
    );
  }

  const latestMonthRow = await prisma.bitumenImporterMonthly.findFirst({
    orderBy: {
      month: "desc",
    },
  });

  const latestMonth = latestMonthRow?.month ?? null;

  const previousMonthRow = latestMonth
    ? await prisma.bitumenImporterMonthly.findFirst({
        where: {
          month: {
            lt: latestMonth,
          },
        },
        orderBy: {
          month: "desc",
        },
      })
    : null;

  const previousMonth = previousMonthRow?.month ?? null;

  const totalAgg = await prisma.bitumenImporterMonthly.aggregate({
    _sum: {
      importedValueUsd: true,
    },
  });

  const latestAgg = latestMonth
    ? await prisma.bitumenImporterMonthly.aggregate({
        where: {
          month: latestMonth,
        },
        _sum: {
          importedValueUsd: true,
        },
      })
    : null;

  const previousAgg = previousMonth
    ? await prisma.bitumenImporterMonthly.aggregate({
        where: {
          month: previousMonth,
        },
        _sum: {
          importedValueUsd: true,
        },
      })
    : null;

  const latestValue = latestAgg?._sum.importedValueUsd ?? 0;
  const previousValue = previousAgg?._sum.importedValueUsd ?? 0;

  const monthChange = latestValue - previousValue;
  const monthChangePercent =
    previousValue > 0 ? (monthChange / previousValue) * 100 : null;

  const uniqueImporters = await prisma.bitumenImporterMonthly.groupBy({
    by: ["importer"],
  });

  const topImportersAllTime = await prisma.bitumenImporterMonthly.groupBy({
    by: ["importer"],
    _sum: {
      importedValueUsd: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        importedValueUsd: "desc",
      },
    },
    take: 20,
  });

  const latestTopImporters = latestMonth
    ? await prisma.bitumenImporterMonthly.groupBy({
        by: ["importer"],
        where: {
          month: latestMonth,
        },
        _sum: {
          importedValueUsd: true,
        },
        orderBy: {
          _sum: {
            importedValueUsd: "desc",
          },
        },
        take: 15,
      })
    : [];

  const monthTrend = await prisma.bitumenImporterMonthly.groupBy({
    by: ["month"],
    _sum: {
      importedValueUsd: true,
    },
    orderBy: {
      month: "asc",
    },
  });

  const latestRows = latestMonth
    ? await prisma.bitumenImporterMonthly.findMany({
        where: {
          month: latestMonth,
        },
      })
    : [];

  const previousRows = previousMonth
    ? await prisma.bitumenImporterMonthly.findMany({
        where: {
          month: previousMonth,
        },
      })
    : [];

  const previousMap = new Map(
    previousRows.map((row) => [row.importer, row.importedValueUsd])
  );

  const momentumRows = latestRows
    .map((row) => {
      const previous = previousMap.get(row.importer) ?? 0;
      const change = row.importedValueUsd - previous;
      const changePercent = previous > 0 ? (change / previous) * 100 : null;

      return {
        importer: row.importer,
        latestValue: row.importedValueUsd,
        previousValue: previous,
        change,
        changePercent,
      };
    })
    .sort((a, b) => b.change - a.change)
    .slice(0, 15);

  const indonesiaRows = await prisma.bitumenImporterMonthly.findMany({
    where: {
      importer: {
        contains: "Indonesia",
      },
    },
    orderBy: {
      month: "asc",
    },
  });

  const indonesiaTotal = indonesiaRows.reduce(
    (sum, row) => sum + row.importedValueUsd,
    0
  );

  const indonesiaLatest =
    latestMonth && indonesiaRows.length > 0
      ? indonesiaRows.find((row) => row.month === latestMonth)
      : null;

  const topFiveTotal = topImportersAllTime
    .slice(0, 5)
    .reduce((sum, row) => sum + (row._sum.importedValueUsd ?? 0), 0);

  const totalValue = totalAgg._sum.importedValueUsd ?? 0;
  const topFiveShare = totalValue > 0 ? (topFiveTotal / totalValue) * 100 : null;

  return (
    <AppShell
      title="Bitumen Trade Market"
      description="Monthly importer-value analysis for HS/Product 2714. This identifies global demand markets and trade momentum, not refinery production capacity."
    >
      <section className="grid gap-4 md:grid-cols-4">
        <KpiCard
          label="Importer-Month Records"
          value={formatNumber(totalRecords)}
          helper={`${formatNumber(uniqueImporters.length)} unique importers`}
        />
        <KpiCard
          label="Total Trade Value"
          value={compactUsd(totalValue)}
          helper="Across all months in dataset"
        />
        <KpiCard
          label="Latest Month"
          value={latestMonth ?? "-"}
          helper={`Previous month: ${previousMonth ?? "-"}`}
        />
        <KpiCard
          label="Latest Month Value"
          value={compactUsd(latestValue)}
          helper={`MoM change: ${compactUsd(monthChange)} (${formatPercent(
            monthChangePercent
          )})`}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">
            Dataset Interpretation
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This dataset shows monthly import value for product 2714. The source
            values are treated as USD thousand and converted into USD by
            multiplying by 1,000. It is useful for identifying importing markets,
            demand concentration, and short-term trade momentum.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">
              Top 5 Importer Concentration
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {formatPercent(topFiveShare)}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Share of total value held by the top 5 importers across the dataset.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">
            Indonesia Position
          </h3>

          {indonesiaRows.length === 0 ? (
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Indonesia was not found as an importer in this dataset.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Indonesia appears in the dataset. This helps compare domestic
                asphalt demand against recorded international import value for
                product 2714.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-600">
                    Indonesia Total Value
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {compactUsd(indonesiaTotal)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-600">
                    Indonesia Latest Value
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {compactUsd(indonesiaLatest?.importedValueUsd)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Month: {latestMonth ?? "-"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h3 className="text-lg font-semibold tracking-tight text-slate-950">
              Top Importers Across Dataset
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Ranked by total imported value across all available months.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Importer</th>
                  <th className="px-6 py-4 text-right">Records</th>
                  <th className="px-6 py-4 text-right">Total Value</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {topImportersAllTime.map((row, index) => (
                  <tr key={row.importer} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-950">
                      {row.importer}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      {formatNumber(row._count.id)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-950">
                      {compactUsd(row._sum.importedValueUsd)}
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
              Top Importers in Latest Month
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Latest available month: {latestMonth ?? "-"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Importer</th>
                  <th className="px-6 py-4 text-right">Latest Value</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {latestTopImporters.map((row, index) => (
                  <tr key={row.importer} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-950">
                      {row.importer}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-950">
                      {compactUsd(row._sum.importedValueUsd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">
            Largest Month-on-Month Increases
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Compares {latestMonth ?? "-"} against {previousMonth ?? "-"} for
            importers present in the latest month.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Importer</th>
                <th className="px-6 py-4 text-right">Previous</th>
                <th className="px-6 py-4 text-right">Latest</th>
                <th className="px-6 py-4 text-right">Change</th>
                <th className="px-6 py-4 text-right">% Change</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {momentumRows.map((row) => (
                <tr key={row.importer} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-950">
                    {row.importer}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {compactUsd(row.previousValue)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {compactUsd(row.latestValue)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-950">
                    {compactUsd(row.change)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">
                    {formatPercent(row.changePercent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">
            Monthly Global Import Trend
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Total recorded import value by month.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4 text-right">Total Import Value</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {monthTrend.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-950">
                    {row.month}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-950">
                    {compactUsd(row._sum.importedValueUsd)}
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