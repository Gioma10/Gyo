import { daysUntilNextRenewal, nextRenewalDate, recurrenceLabel } from "@/lib/subscriptions";
import type { Subscription } from "@/lib/schemas/subscription";

const ICON_COLORS = ["#E24B4A", "#1D9E75", "#378ADD", "#9b8df5", "#FF6B35", "#EF9F27"];

function iconColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return ICON_COLORS[Math.abs(hash) % ICON_COLORS.length];
}
import { Card, CardContent } from "../ui/card";
import { PencilIcon, Trash2Icon } from "lucide-react";

export const SubscriptionCard = ({
    sub,
    onEdit,
    onDelete,
  }: {
    sub: Subscription;
    onEdit: (s: Subscription) => void;
    onDelete: (id: string) => void;
  }) => {
    const days = daysUntilNextRenewal(sub.startDate, sub.recurrence);
    const renewal = nextRenewalDate(sub.startDate, sub.recurrence);
    const urgent = days <= 3;
    const iconColor = iconColorFromName(sub.name);
  
    return (
      <Card className="border-border bg-surface">
        <CardContent className="p-4 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: iconColor + "22" }}
          >
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: iconColor }} />
          </div>
  
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{sub.name}</p>
            <p className="text-xs text-muted-foreground">
              {recurrenceLabel[sub.recurrence]} · renews on {renewal}
            </p>
          </div>
  
          <div className="text-right shrink-0 mr-2">
            <p className="text-sm font-medium text-foreground">€{parseFloat(sub.amount).toFixed(2)}</p>
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
  
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(sub)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <PencilIcon size={13} />
            </button>
            <button
              onClick={() => onDelete(sub.id)}
              className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-400 hover:bg-muted transition-colors"
            >
              <Trash2Icon size={13} />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }