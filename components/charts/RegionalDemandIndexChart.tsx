"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RegionalDemandPoint = {
  region: string;
  demandIndex: number;
};

export function RegionalDemandIndexChart({
  data,
}: {
  data: RegionalDemandPoint[];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
        No regional demand index data available.
      </div>
    );
  }

  return (
    <div className="h-[420px] w-full rounded-2xl bg-slate-50 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 130, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis
            dataKey="region"
            type="category"
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [
              Number(value).toLocaleString("en-US", {
                maximumFractionDigits: 2,
              }),
              "Demand Index",
            ]}
          />
          <Bar dataKey="demandIndex" fill="#334155" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}