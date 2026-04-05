"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

// ─── Mock data ───────────────────────────────────────────────────────────────

type Recurrence = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | "ANNUAL";

interface Subscription {
  id: number;
  name: string;
  amount: number;
  startDate: string;
  recurrence: Recurrence;
  color: string;
  iconColor: string;
}

const recurrenceLabel: Record<Recurrence, string> = {
  WEEKLY: "Settimanale",
  MONTHLY: "Mensile",
  QUARTERLY: "Trimestrale",
  SEMIANNUAL: "Semestrale",
  ANNUAL: "Annuale",
};

const recurrenceOptions: Recurrence[] = [
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "SEMIANNUAL",
  "ANNUAL",
];

const mockSubscriptions: Subscription[] = [
  {
    id: 1,
    name: "Netflix",
    amount: 17.99,
    startDate: "2024-03-20",
    recurrence: "MONTHLY",
    color: "#1a0505",
    iconColor: "#E24B4A",
  },
  {
    id: 2,
    name: "Spotify",
    amount: 10.99,
    startDate: "2024-03-22",
    recurrence: "MONTHLY",
    color: "#041a10",
    iconColor: "#1D9E75",
  },
  {
    id: 3,
    name: "ChatGPT Plus",
    amount: 20.0,
    startDate: "2024-03-05",
    recurrence: "MONTHLY",
    color: "#0a1220",
    iconColor: "#378ADD",
  },
  {
    id: 4,
    name: "iCloud",
    amount: 2.99,
    startDate: "2024-01-01",
    recurrence: "MONTHLY",
    color: "#0d0d1a",
    iconColor: "#9b8df5",
  },
  {
    id: 5,
    name: "Adobe CC",
    amount: 59.99,
    startDate: "2024-06-01",
    recurrence: "ANNUAL",
    color: "#1a0a05",
    iconColor: "#FF6B35",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysUntilNextRenewal(startDate: string, recurrence: Recurrence): number {
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysMap: Record<Recurrence, number> = {
    WEEKLY: 7,
    MONTHLY: 30,
    QUARTERLY: 90,
    SEMIANNUAL: 180,
    ANNUAL: 365,
  };

  const interval = daysMap[recurrence];
  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const remainder = diffDays % interval;
  return remainder === 0 ? 0 : interval - remainder;
}

function nextRenewalDate(startDate: string, recurrence: Recurrence): string {
  const days = daysUntilNextRenewal(startDate, recurrence);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
}

function totalMonthly(subs: Subscription[]): number {
  const multiplier: Record<Recurrence, number> = {
    WEEKLY: 4.33,
    MONTHLY: 1,
    QUARTERLY: 1 / 3,
    SEMIANNUAL: 1 / 6,
    ANNUAL: 1 / 12,
  };
  return subs.reduce((sum, s) => sum + s.amount * multiplier[s.recurrence], 0);
}

// ─── Sub card ────────────────────────────────────────────────────────────────

function SubscriptionCard({
  sub,
  onEdit,
  onDelete,
}: {
  sub: Subscription;
  onEdit: (s: Subscription) => void;
  onDelete: (id: number) => void;
}) {
  const days = daysUntilNextRenewal(sub.startDate, sub.recurrence);
  const renewal = nextRenewalDate(sub.startDate, sub.recurrence);
  const urgent = days <= 3;

  return (
    <Card className="border-border bg-surface">
      <CardContent className="p-4 flex items-center gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: sub.color }}
        >
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: sub.iconColor }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{sub.name}</p>
          <p className="text-xs text-muted-foreground">
            {recurrenceLabel[sub.recurrence]} · rinnova il {renewal}
          </p>
        </div>

        {/* Amount + badge */}
        <div className="text-right shrink-0 mr-2">
          <p className="text-sm font-medium text-foreground">€{sub.amount.toFixed(2)}</p>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: urgent ? "#1a1205" : "#041a10",
              color: urgent ? "#EF9F27" : "#5DCAA5",
            }}
          >
            {days === 0 ? "oggi" : `tra ${days}g`}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(sub)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(sub.id)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-400 hover:bg-muted transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Bottom sheet form ────────────────────────────────────────────────────────

function SubscriptionSheet({
  open,
  editing,
  onClose,
}: {
  open: boolean;
  editing: Subscription | null;
  onClose: () => void;
}) {
  const [recurrence, setRecurrence] = useState<Recurrence>(
    editing?.recurrence ?? "MONTHLY"
  );
  const [recOpen, setRecOpen] = useState(false);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-surface px-5 pt-5 pb-8 max-w-lg mx-auto md:left-56">
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-border mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-medium text-foreground">
            {editing ? "Modifica abbonamento" : "Nuovo abbonamento"}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <Field>
            <FieldLabel className="text-muted-foreground text-xs">Nome</FieldLabel>
            <Input
              placeholder="es. Netflix"
              defaultValue={editing?.name}
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </Field>

          <Field>
            <FieldLabel className="text-muted-foreground text-xs">Importo (€)</FieldLabel>
            <Input
              type="number"
              placeholder="0.00"
              defaultValue={editing?.amount}
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </Field>

          <Field>
            <FieldLabel className="text-muted-foreground text-xs">Data primo rinnovo</FieldLabel>
            <Input
              type="date"
              defaultValue={editing?.startDate}
              className="bg-muted border-border text-foreground focus-visible:ring-primary"
            />
          </Field>

          {/* Recurrence */}
          <Field>
            <FieldLabel className="text-muted-foreground text-xs">Ricorrenza</FieldLabel>
            <div className="relative">
              <button
                onClick={() => setRecOpen(!recOpen)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground"
              >
                {recurrenceLabel[recurrence]}
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
              {recOpen && (
                <div className="absolute bottom-full mb-1 left-0 right-0 rounded-md border border-border bg-surface overflow-hidden z-10">
                  {recurrenceOptions.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setRecurrence(r); setRecOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                      style={{ color: r === recurrence ? "#1D9E75" : undefined }}
                    >
                      {recurrenceLabel[r]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>

          <Button
            className="w-full bg-primary hover:bg-primary text-primary-foreground mt-2"
            style={{ backgroundColor: "#1D9E75" }}
          >
            {editing ? "Salva modifiche" : "Aggiungi abbonamento"}
          </Button>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>(mockSubscriptions);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);

  const openAdd = () => { setEditing(null); setSheetOpen(true); };
  const openEdit = (s: Subscription) => { setEditing(s); setSheetOpen(true); };
  const closeSheet = () => setSheetOpen(false);
  const handleDelete = (id: number) => setSubs((prev) => prev.filter((s) => s.id !== id));

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

      {/* Summary card */}
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

      {/* List */}
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
              onDelete={handleDelete}
            />
          ))}
      </div>

      {/* Empty state */}
      {subs.length === 0 && (
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

      {/* Sheet */}
      <SubscriptionSheet open={sheetOpen} editing={editing} onClose={closeSheet} />
    </>
  );
}