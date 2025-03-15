'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const data = [
  {
    name: "Jan",
    qrCodes: 12,
    events: 2,
    entries: 145,
  },
  {
    name: "Feb",
    qrCodes: 18,
    events: 3,
    entries: 234,
  },
  {
    name: "Mar",
    qrCodes: 25,
    events: 4,
    entries: 356,
  },
  {
    name: "Apr",
    qrCodes: 15,
    events: 2,
    entries: 189,
  },
  {
    name: "May",
    qrCodes: 22,
    events: 3,
    entries: 278,
  },
  {
    name: "Jun",
    qrCodes: 30,
    events: 5,
    entries: 423,
  },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
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