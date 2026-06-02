import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function SubscriptionCardSkeleton() {
  return (
    <Card className="border-border bg-surface">
      <CardContent className="p-4 flex items-center gap-3">
        {/* icon */}
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />

        {/* name + subtitle */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-32 rounded" />
          <Skeleton className="h-3 w-48 rounded" />
        </div>

        {/* amount + badge */}
        <div className="text-right shrink-0 mr-2 flex flex-col items-end gap-1.5">
          <Skeleton className="h-3.5 w-12 rounded" />
          <Skeleton className="h-4 w-10 rounded-full" />
        </div>

        {/* action buttons */}
        <div className="flex gap-1 shrink-0">
          <Skeleton className="w-7 h-7 rounded-md" />
          <Skeleton className="w-7 h-7 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
