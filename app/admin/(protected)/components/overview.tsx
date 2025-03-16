'use client';

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
      <BarChart 
        data={data}
        barGap={4}
        barCategoryGap={16}
      >
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
        <Tooltip shared={false} />
        <Legend wrapperStyle={{ paddingTop: 16 }} />
        <Bar
          name="QR Codes"
          dataKey="qrCodes"
          fill="#93c5fd" // blue-300 (pastel blue)
          radius={[4, 4, 0, 0]}
        />
        <Bar
          name="Events"
          dataKey="events"
          fill="#c4b5fd" // violet-300 (pastel purple)
          radius={[4, 4, 0, 0]}
        />
        <Bar
          name="Entries"
          dataKey="entries"
          fill="#fdba74" // orange-300 (pastel orange)
          radius={[4, 4, 0, 0]}
        />
        <Bar
          name="Winners"
          dataKey="winners"
          fill="#6ee7b7" // emerald-300 (pastel green)
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
} 