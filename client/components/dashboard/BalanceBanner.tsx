import { Card, CardContent } from "../ui/card";
import type { Subscription } from "@/lib/schemas/subscription";
import { dueThisMonth, nextRenewal } from "@/lib/subscriptions";

function whenLabel(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

export const BalanceBanner = ({
  subscriptions = [],
}: {
  subscriptions?: Subscription[];
}) => {
  const next = nextRenewal(subscriptions);
  const due = dueThisMonth(subscriptions);

  return (
    <Card className="mb-4 border-0" style={{ backgroundColor: "#1D9E75" }}>
      <CardContent className="p-5">
        <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>
          Next renewal
        </p>

        {next ? (
          <>
            <p className="text-3xl font-medium text-white mb-0.5">
              {next.sub.name}
            </p>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.85)" }}>
              {whenLabel(next.days)} · €{parseFloat(next.sub.amount).toFixed(2)}
            </p>
          </>
        ) : (
          <p className="text-2xl font-medium text-white mb-4">
            No upcoming renewals
          </p>
        )}

        <div className="flex gap-6 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
          <div>
            <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              Due this month
            </p>
            <p className="text-base font-medium text-white">
              €{due.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>
              Active subscriptions
            </p>
            <p className="text-base font-medium text-white">
              {subscriptions.filter((s) => !s.endDate).length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
