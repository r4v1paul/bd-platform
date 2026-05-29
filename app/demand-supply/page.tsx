import { AppShell } from "@/components/layout/AppShell";
import { prisma } from "@/lib/prisma";

function formatNumber(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined) return "-";

  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
  });
}

function formatRatio(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "-";
  }

  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

type DemandSupplyRow = {
  province: string;
  demandTonnes: number;
  importTonnes: number;
  importValueUsd: number;
  gapTonnes: number;
  demandImportRatio: number | null;
  confidence: "Medium" | "Low";
};

export default async function DemandSupplyPage() {
  const demandByProvince = await prisma.asphaltMarket.groupBy({
    by: ["provinsi"],
    _sum: {
      kebutuhanAspal: true,
      value: true,
    },
    _count: {
      id: true,
    },
    where: {
      provinsi: {
        not: null,
      },
    },
  });

  const imports = await prisma.bpsImport.findMany();

  const importMap = new Map(
    imports.map((row) => [
      normalizeProvince(row.province),
      {
        province: row.province,
        importTonnes: row.importTonnes,
        importValueUsd: row.importValueUsd,
      },
    ])
  );

  const unspecified = imports.find(
    (row) => normalizeProvince(row.province) === "unspecified"
  );

  const totalImportTonnes = imports.reduce(
    (sum, row) => sum + row.importTonnes,
    0
  );

  const unspecifiedShare =
    unspecified && totalImportTonnes > 0
      ? (unspecified.importTonnes / totalImportTonnes) * 100
      : 0;

  const rows: DemandSupplyRow[] = demandByProvince
    .map((row) => {
      const province = row.provinsi ?? "Unknown";
      const matchedImport = importMap.get(normalizeProvince(province));

      const demandTonnes = Number(row._sum.kebutuhanAspal ?? 0);
      const importTonnes = matchedImport?.importTonnes ?? 0;
      const importValueUsd = matchedImport?.importValueUsd ?? 0;
      const gapTonnes = demandTonnes - importTonnes;

      const demandImportRatio =
        importTonnes > 0 ? demandTonnes / importTonnes : null;

      const confidence: "Medium" | "Low" = matchedImport ? "Medium" : "Low";

      return {
        province,
        demandTonnes,
        importTonnes,
        importValueUsd,
        gapTonnes,
        demandImportRatio,
        confidence,
      };
    })
    .sort((a, b) => b.demandTonnes - a.demandTonnes);

  const totalDemand = rows.reduce((sum, row) => sum + row.demandTonnes, 0);

  const totalSpecifiedImport = imports
    .filter((row) => normalizeProvince(row.province) !== "unspecified")
    .reduce((sum, row) => sum + row.importTonnes, 0);

  const totalDirectionalGap = totalDemand - totalSpecifiedImport;

  const highGapRows = [...rows]
    .sort((a, b) => b.gapTonnes - a.gapTonnes)
    .slice(0, 15);

  return (
    <AppShell
      title="Demand vs Import"
      description="Directional comparison between estimated asphalt demand and province-level BPS import tonnes."
    >
      <section className="grid gap-4 md:grid-cols-4">
        <KpiCard
          label="Estimated Demand"
          value={`${formatNumber(totalDemand, 2)} tons`}
          helper="Sum of Kebutuhan Aspal by province"
        />

        <KpiCard
          label="Specified Imports"
          value={`${formatNumber(totalSpecifiedImport, 2)} tons`}
          helper="Excludes Unspecified import bucket"
        />

        <KpiCard
          label="Directional Gap"
          value={`${formatNumber(totalDirectionalGap, 2)} tons`}
          helper="Demand minus specified import tonnes"
        />

        <KpiCard
          label="Unspecified Import Share"
          value={`${formatNumber(unspecifiedShare, 2)}%`}
          helper="Major limitation of province-level comparison"
        />
      </section>

      <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <h3 className="text-lg font-semibold tracking-tight text-amber-950">
          Interpretation Warning
        </h3>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          This comparison is not a definitive supply-demand balance. The BPS
          import data includes a large Unspecified province category. Provinces
          with zero matched imports may still receive supply through distributors,
          ports, or import records not allocated to province level.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <h3 className="text-lg font-semibold tracking-tight text-slate-950">
            Highest Directional Demand Gaps
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Provinces ranked by estimated demand minus specified import tonnes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Province</th>
                <th className="px-6 py-4 text-right">Demand</th>
                <th className="px-6 py-4 text-right">Imports</th>
                <th className="px-6 py-4 text-right">Gap</th>
                <th className="px-6 py-4 text-right">Demand / Import</th>
                <th className="px-6 py-4 text-right">Confidence</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {highGapRows.map((row) => (
                <tr key={row.province} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-950">
                    {row.province}
                  </td>

                  <td className="px-6 py-4 text-right text-slate-600">
                    {formatNumber(row.demandTonnes, 2)} tons
                  </td>

                  <td className="px-6 py-4 text-right text-slate-600">
                    {formatNumber(row.importTonnes, 2)} tons
                  </td>

                  <td className="px-6 py-4 text-right font-medium text-slate-950">
                    {formatNumber(row.gapTonnes, 2)} tons
                  </td>

                  <td className="px-6 py-4 text-right text-slate-600">
                    {formatRatio(row.demandImportRatio)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span
                      className={
                        row.confidence === "Medium"
                          ? "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                          : "rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
                      }
                    >
                      {row.confidence}
                    </span>
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
            Full Province Comparison
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            All provinces with demand records, matched against BPS import rows
            when available.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Province</th>
                <th className="px-6 py-4 text-right">Demand</th>
                <th className="px-6 py-4 text-right">Imports</th>
                <th className="px-6 py-4 text-right">Import Value</th>
                <th className="px-6 py-4 text-right">Gap</th>
                <th className="px-6 py-4 text-right">Confidence</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.province} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-950">
                    {row.province}
                  </td>

                  <td className="px-6 py-4 text-right text-slate-600">
                    {formatNumber(row.demandTonnes, 2)} tons
                  </td>

                  <td className="px-6 py-4 text-right text-slate-600">
                    {formatNumber(row.importTonnes, 2)} tons
                  </td>

                  <td className="px-6 py-4 text-right text-slate-600">
                    ${formatNumber(row.importValueUsd, 0)}
                  </td>

                  <td className="px-6 py-4 text-right font-medium text-slate-950">
                    {formatNumber(row.gapTonnes, 2)} tons
                  </td>

                  <td className="px-6 py-4 text-right">
                    <span
                      className={
                        row.confidence === "Medium"
                          ? "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                          : "rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
                      }
                    >
                      {row.confidence}
                    </span>
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

function normalizeProvince(value: string) {
  return value.trim().toLowerCase();
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

      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-400">{helper}</p>
    </div>
  );
}