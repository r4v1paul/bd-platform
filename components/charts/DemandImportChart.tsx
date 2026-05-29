"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DemandImportPoint = {
  province: string;
  demandTonnes: number;
  importTonnes: number;
};

export function DemandImportChart({
  data,
}: {
  data: DemandImportPoint[];
}) {
  return (
    <div className="h-[460px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 90 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="province"
            angle={-45}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(value) =>
              Number(value).toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })
            }
          />
          <Tooltip
            formatter={(value) =>
              `${Number(value).toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })} tons`
            }
          />
          <Legend />
          <Bar dataKey="demandTonnes" name="Estimated Demand" radius={[8, 8, 0, 0]} />
          <Bar dataKey="importTonnes" name="Recorded Imports" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
