"use client";

import { useUser } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

import { capitalize } from "@/utils/string-fromatting";
import { ActiveSub } from "@/components/dashboard/ActiveSub";
import { useQuery } from "@tanstack/react-query";
import { Subscription } from "@/lib/schemas/subscription";
import { BalanceBanner } from "@/components/dashboard/BalanceBanner";
import { SubChart } from "@/components/dashboard/SubChart";

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
      <BalanceBanner subscriptions={subs} />

      {/* Subscriptions */}
      <ActiveSub subscriptions={subs} />

      {/* Chart */}
      <SubChart />
    </div>
  );
}
