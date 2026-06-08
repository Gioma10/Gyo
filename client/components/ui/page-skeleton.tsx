import { Skeleton } from "./skeleton";

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-6 w-36 rounded" />
          <Skeleton className="h-4 w-48 rounded" />
        </div>
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>

      <Skeleton className="h-24 w-full rounded-xl" />

      <div className="flex flex-col gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>

      {/* chart */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
        <Skeleton className="h-3 w-20 rounded" />
        <div className="flex items-end justify-between gap-2 h-[120px]">
          {[55, 80, 45, 95, 65, 100].map((h, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-md"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-border">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}
