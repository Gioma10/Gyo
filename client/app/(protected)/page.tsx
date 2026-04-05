"use client";

import { useUser } from "@clerk/nextjs";
import { Bell, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { capitalize } from "@/utils/string-fromatting";

const mockSubscriptions = [
  {
    id: 1,
    name: "Netflix",
    amount: 17.99,
    renewDate: "20 marzo",
    daysLeft: 2,
    color: "#1a0505",
    iconColor: "#E24B4A",
  },
  {
    id: 2,
    name: "Spotify",
    amount: 10.99,
    renewDate: "22 marzo",
    daysLeft: 4,
    color: "#041a10",
    iconColor: "#1D9E75",
  },
  {
    id: 3,
    name: "ChatGPT Plus",
    amount: 20.0,
    renewDate: "5 aprile",
    daysLeft: 18,
    color: "#0a1220",
    iconColor: "#378ADD",
  },
];

const mockMonths = [
  { label: "ott", height: 55 },
  { label: "nov", height: 60 },
  { label: "dic", height: 50 },
  { label: "gen", height: 65 },
  { label: "feb", height: 55 },
  { label: "mar", height: 80, active: true },
];

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Buongiorno,</p>
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
      <Card className="mb-4 border-0" style={{ backgroundColor: "#1D9E75" }}>
        <CardContent className="p-5">
          <p
            className="text-xs mb-1"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Saldo totale
          </p>
          <p className="text-3xl font-medium text-white mb-4">€2.840,50</p>
          <div className="flex gap-6">
            <div>
              <p
                className="text-xs mb-1"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Entrate marzo
              </p>
              <p className="text-base font-medium text-white">+€3.200,00</p>
            </div>
            <div>
              <p
                className="text-xs mb-1"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Uscite marzo
              </p>
              <p className="text-base font-medium" style={{ color: "#9FE1CB" }}>
                -€359,50
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert */}
      <Card
        className="mb-5"
        style={{ backgroundColor: "#1a1205", borderColor: "#BA7517" }}
      >
        <CardContent className="p-4 flex items-center gap-3">
          <AlertCircle size={16} style={{ color: "#EF9F27", flexShrink: 0 }} />
          <p className="text-sm" style={{ color: "#EF9F27" }}>
            <strong style={{ color: "#FAC775" }}>3 abbonamenti</strong> in
            scadenza nei prossimi 5 giorni — €34,97 in uscita
          </p>
        </CardContent>
      </Card>

      {/* Subscriptions */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-medium text-foreground">
          Abbonamenti attivi
        </h2>
        <Button
          variant="ghost"
          className="text-sm h-auto p-0"
          style={{ color: "#1D9E75" }}
        >
          vedi tutti
        </Button>
      </div>

      <div className="flex flex-col gap-2 mb-5">
        {mockSubscriptions.map((sub) => (
          <Card key={sub.id} className="border-border bg-surface">
            <CardContent className="p-4 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: sub.color }}
              >
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: sub.iconColor }}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {sub.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  rinnova il {sub.renewDate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  €{sub.amount.toFixed(2)}
                </p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: sub.daysLeft <= 5 ? "#1a1205" : "#041a10",
                    color: sub.daysLeft <= 5 ? "#EF9F27" : "#5DCAA5",
                  }}
                >
                  tra {sub.daysLeft} giorni
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <h2 className="text-base font-medium text-foreground mb-3">
        Spesa mensile
      </h2>
      <Card className="border-border bg-surface">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-3">Ultimi 6 mesi</p>
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
              Totale abbonamenti marzo
            </span>
            <span className="text-base font-medium text-foreground">
              €103,97
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
