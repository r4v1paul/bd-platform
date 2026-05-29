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

type ProvinceDemandPoint = {
  province: string;
  demandTonnes: number;
};

export function ProvinceDemandChart({
  data,
}: {
  data: ProvinceDemandPoint[];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
        No province demand data available.
      </div>
    );
  }

  return (
    <div className="h-[420px] w-full rounded-2xl bg-slate-50 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 110, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickFormatter={(value) =>
              Number(value).toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })
            }
          />
          <YAxis
            dataKey="province"
            type="category"
            width={130}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [
              `${Number(value).toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })} tons`,
              "Asphalt Demand",
            ]}
          />
          <Bar dataKey="demandTonnes" fill="#0f172a" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}