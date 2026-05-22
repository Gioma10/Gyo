"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubscriptionSheet } from "@/components/subscriptions/SubscriptionSheet";
import { daysUntilNextRenewal, totalMonthly } from "@/lib/subscriptions";
import type { Subscription } from "@/lib/schemas/subscription";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";

export default function SubscriptionsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const queryClient = useQueryClient();

  const { data: subs = [], isLoading } = useQuery<Subscription[]>({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const res = await fetch("/api/subscriptions");
      if (!res.ok) throw new Error("Errore nel caricamento");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Errore eliminazione");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
  });

  const openAdd = () => { setEditing(null); setSheetOpen(true); };
  const openEdit = (s: Subscription) => { setEditing(s); setSheetOpen(true); };
  const closeSheet = () => setSheetOpen(false);

  const monthly = totalMonthly(subs);

  return (
    <>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-medium text-foreground">Abbonamenti</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {subs.length} attivi · €{monthly.toFixed(2)}/mese
          </p>
        </div>
        <Button
          onClick={openAdd}
          size="sm"
          className="gap-2 text-sm"
          style={{ backgroundColor: "#1D9E75", color: "#fff" }}
        >
          <Plus size={14} />
          Aggiungi
        </Button>
      </div>

      <Card className="mb-5 border-0" style={{ backgroundColor: "#1D9E75" }}>
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
              Spesa mensile stimata
            </p>
            <p className="text-2xl font-medium text-white">€{monthly.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
              Spesa annuale stimata
            </p>
            <p className="text-base font-medium text-white">€{(monthly * 12).toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && subs.length > 0 && (
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
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
        </div>
      )}

      {!isLoading && subs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground text-sm mb-3">Nessun abbonamento ancora</p>
          <Button
            onClick={openAdd}
            size="sm"
            style={{ backgroundColor: "#1D9E75", color: "#fff" }}
          >
            Aggiungi il primo
          </Button>
        </div>
      )}

      <SubscriptionSheet
        key={editing?.id ?? "new"}
        open={sheetOpen}
        editing={editing}
        onClose={closeSheet}
      />
    </>
  );
}
