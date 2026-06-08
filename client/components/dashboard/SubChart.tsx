"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Card, CardContent } from "../ui/card";
import { MonthlySpend } from "@/lib/schemas/monthly-spend";

const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-lg">
      <p className="text-[11px] text-muted-foreground">
        {new Date(p.month).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}
      </p>
      <p className="text-sm font-semibold text-foreground">
        €{p.total.toFixed(2)}
      </p>
    </div>
  );
};

export const SubChart = () => {
  const { data: spends } = useQuery<MonthlySpend[]>({
    queryKey: ["monthly-spend"],
    queryFn: async () => {
      const res = await fetch("/api/monthly-spend");
      if (!res.ok) throw new Error("Loading error");
      return res.json();
    },
  });

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // total arriva come stringa (Decimal serializzato) → Number per i calcoli/grafico
  const data = (spends ?? []).map((s) => ({
    month: s.month,
    total: Number(s.total),
    label: new Date(s.month).toLocaleDateString("en-US", { month: "short" }),
  }));

  // default: mese più recente (l'array è già cronologico)
  const selected =
    data.find((d) => d.month === selectedMonth) ?? data.at(-1) ?? null;

  return (
    <div>
      <h2 className="text-base font-medium text-foreground mb-3">
        Monthly spending
      </h2>
      <Card className="border-border bg-surface">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-3">Last 6 months</p>

          <div className="[&_*:focus]:outline-none [&_*:focus-visible]:outline-none">
            <ResponsiveContainer width="100%" height={120}>
              <BarChart
                data={data}
                margin={{ top: 8, bottom: 0 }}
                barCategoryGap="12%"
                accessibilityLayer={false}
              >
                <defs>
                  <linearGradient id="barActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#27C68C" />
                    <stop offset="100%" stopColor="#1D9E75" />
                  </linearGradient>
                  <linearGradient id="barInactive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#343434" />
                    <stop offset="100%" stopColor="#262626" />
                  </linearGradient>
                </defs>

                <Tooltip
                  cursor={false}
                  content={<ChartTooltip />}
                  animationDuration={150}
                />

                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11, fill: "#666" }}
                />

                <Bar
                  dataKey="total"
                  onClick={(_, index) =>
                    setSelectedMonth(data[index]?.month ?? null)
                  }
                  shape={(props: any) => (
                    <Rectangle
                      {...props}
                      radius={[6, 6, 0, 0]}
                      cursor="pointer"
                      style={{ outline: "none" }}
                      fill={
                        props.payload?.month === selected?.month
                          ? "url(#barActive)"
                          : "url(#barInactive)"
                      }
                    />
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center pt-3 mt-1 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Total subscriptions
              {selected
                ? " " +
                  new Date(selected.month).toLocaleDateString("en-US", {
                    month: "long",
                  })
                : ""}
            </span>
            <span className="text-base font-medium text-foreground tabular-nums">
              €{selected ? selected.total.toFixed(2) : "0.00"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
