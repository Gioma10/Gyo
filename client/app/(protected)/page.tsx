"use client";

import { useUser } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { capitalize } from "@/utils/string-fromatting";
import { ActiveSub } from "@/components/dashboard/ActiveSub";
import { useQuery } from "@tanstack/react-query";
import { Subscription } from "@/lib/schemas/subscription";
import { BalanceBanner } from "@/components/dashboard/BalanceBanner";

const mockMonths = [
  { label: "oct", height: 55 },
  { label: "nov", height: 60 },
  { label: "dec", height: 50 },
  { label: "jan", height: 65 },
  { label: "feb", height: 55 },
  { label: "mar", height: 80, active: true },
];

export default function DashboardPage() {
  const { user } = useUser();

  const { data: subs } = useQuery<Subscription[]>({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const res = await fetch("/api/subscriptions");
      if (!res.ok) throw new Error("Loading error");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Good morning,</p>
          <h1 className="text-xl font-medium text-foreground">
            {user?.username && capitalize(user.username)}
          </h1>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full border-border bg-surface"
        >
          <Bell size={16} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: "#E24B4A" }}
          />
        </Button>
      </div>

      {/* Balance card */}
      <BalanceBanner />

      {/* Subscriptions */}
      <ActiveSub subscriptions={subs} />

      {/* Chart */}
      <h2 className="text-base font-medium text-foreground mb-3">
        Monthly spending
      </h2>
      <Card className="border-border bg-surface">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-3">Last 6 months</p>
          <div className="flex items-end gap-1.5 h-16 mb-1.5">
            {mockMonths.map((m) => (
              <div
                key={m.label}
                className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
              >
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${m.height}%`,
                    backgroundColor: m.active ? "#1D9E75" : "#2a2a2a",
                  }}
                />
                <span className="text-xs" style={{ color: "#555" }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-border">
            <span className="text-sm text-muted-foreground">
              Total subscriptions March
            </span>
            <span className="text-base font-medium text-foreground">
              €103.97
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
