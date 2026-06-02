"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { match, P } from "ts-pattern";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SubscriptionSheet } from "@/components/subscriptions/SubscriptionSheet";
import { daysUntilNextRenewal, totalMonthly } from "@/lib/subscriptions";
import type { Subscription } from "@/lib/schemas/subscription";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { SubscriptionCardSkeleton } from "@/components/subscriptions/SubscriptionCardSkeleton";

function PageSkeleton() {
  return (
    <>
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-6 w-36 rounded" />
          <Skeleton className="h-4 w-48 rounded" />
        </div>
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>

      <Card className="mb-5 border-0" style={{ backgroundColor: "#1D9E75" }}>
        <CardContent className="p-4 flex justify-between items-center">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-36 rounded" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
            <Skeleton className="h-7 w-20 rounded" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Skeleton className="h-3 w-32 rounded" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
            <Skeleton className="h-5 w-16 rounded" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {[...Array(4)].map((_, i) => (
          <SubscriptionCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

export default function SubscriptionsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const queryClient = useQueryClient();

  const query = useQuery<Subscription[]>({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const res = await fetch("/api/subscriptions");
      if (!res.ok) throw new Error("Loading error");
      return res.json();
    },
  });

  const deleteSub = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Deletion error");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
  });

  const openAdd = () => { setEditing(null); setSheetOpen(true); };
  const openEdit = (s: Subscription) => { setEditing(s); setSheetOpen(true); };

  return match(query)
    .with({ status: "pending" }, () => <PageSkeleton />)
    .with({ status: "error" }, () => (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-muted-foreground">Failed to load subscriptions</p>
      </div>
    ))
    .with({ status: "success", data: P.array() }, ({ data: subs }) => {
      const monthly = totalMonthly(subs);
      return (
        <>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-xl font-medium text-foreground">Subscriptions</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {subs.length} active · €{monthly.toFixed(2)}/month
              </p>
            </div>
            <Button
              onClick={openAdd}
              size="sm"
              className="gap-2 text-sm"
              style={{ backgroundColor: "#1D9E75", color: "#fff" }}
            >
              <Plus size={14} />
              Add
            </Button>
          </div>

          <Card className="mb-5 border-0" style={{ backgroundColor: "#1D9E75" }}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Estimated monthly spending
                </p>
                <p className="text-2xl font-medium text-white">€{monthly.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Estimated annual spending
                </p>
                <p className="text-base font-medium text-white">€{(monthly * 12).toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          {subs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-sm mb-3">No subscriptions yet</p>
              <Button onClick={openAdd} size="sm" style={{ backgroundColor: "#1D9E75", color: "#fff" }}>
                Add your first
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {subs
                .slice()
                .sort(
                  (a, b) =>
                    daysUntilNextRenewal(a.startDate, a.recurrence) -
                    daysUntilNextRenewal(b.startDate, b.recurrence)
                )
                .map((sub) => (
                  <SubscriptionCard
                    key={sub.id}
                    sub={sub}
                    onEdit={openEdit}
                    onDelete={(id) => deleteSub.mutate(id)}
                  />
                ))}
            </div>
          )}

          <SubscriptionSheet
            key={editing?.id ?? "new"}
            open={sheetOpen}
            editing={editing}
            onClose={() => setSheetOpen(false)}
          />
        </>
      );
    })
    .otherwise(() => null);
}
