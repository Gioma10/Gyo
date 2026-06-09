import type { Subscription } from "@/lib/schemas/subscription";
import { daysUntilNextRenewal, nextRenewalDate } from "@/lib/subscriptions";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";

const ICON_COLORS = ["#E24B4A", "#1D9E75", "#378ADD", "#9b8df5", "#FF6B35", "#EF9F27"];

function iconColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return ICON_COLORS[Math.abs(hash) % ICON_COLORS.length];
}

export const ActiveSub = ({ subscriptions }: { subscriptions?: Subscription[] }) => {
  if (!subscriptions) return null;

  const viewSubs = subscriptions.slice(0, 3);

  return (
    <>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-medium text-foreground">Active subscriptions</h2>
        {subscriptions.length > 3 && (
          <Button variant="ghost" className="text-sm h-auto p-2" style={{ color: "#1D9E75" }}>
            <Link href={"/subscriptions"}>See all</Link>
          </Button>
        )}
      </div>

      {subscriptions.length === 0 && (
        <div className="flex justify-center mb-5">
          <Button
            asChild
            size="sm"
            className="gap-2 text-sm"
            style={{ backgroundColor: "#1D9E75", color: "#fff" }}
          >
            <Link href={"/subscriptions"}>
              <Plus size={14} />
              Add new
            </Link>
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2 mb-5">
        {viewSubs.map((sub) => {
          const days = daysUntilNextRenewal(sub.startDate, sub.recurrence);
          const renewal = nextRenewalDate(sub.startDate, sub.recurrence);
          const iconColor = iconColorFromName(sub.name);
          const urgent = days <= 3;

          return (
            <Card key={sub.id} className="border-border bg-surface">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: iconColor + "22" }}
                >
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: iconColor }} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">renews on {renewal}</p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    €{parseFloat(sub.amount).toFixed(2)}
                  </p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: urgent ? "#1a1205" : "#041a10",
                      color: urgent ? "#EF9F27" : "#5DCAA5",
                    }}
                  >
                    {days === 0 ? "today" : `in ${days}d`}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
};
