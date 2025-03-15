'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface OverviewProps {
  data: {
    month: string;
    qrCodes: number;
    events: number;
    entries: number;
  }[];
}

export function Overview({ data }: OverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Bar
          dataKey="qrCodes"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
        <Bar
          dataKey="events"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary/70"
        />
        <Bar
          dataKey="entries"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary/40"
        />
      </BarChart>
    </ResponsiveContainer>
  );
} 