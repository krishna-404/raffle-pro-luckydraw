'use client';

import { Bar, BarChart, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface OverviewProps {
  data: {
    month: string;
    qrCodes: number;
    events: number;
    entries: number;
    winners: number;
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
        <Legend />
        <Bar
          name="QR Codes"
          dataKey="qrCodes"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
        <Bar
          name="Events"
          dataKey="events"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary/70"
        />
        <Bar
          name="Entries"
          dataKey="entries"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary/40"
        />
        <Bar
          name="Winners"
          dataKey="winners"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-green-500"
        />
      </BarChart>
    </ResponsiveContainer>
  );
} 