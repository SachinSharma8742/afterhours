"use client";

import { cn } from "../../lib/utils/cn";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-800/80 border border-slate-700/30",
        className
      )}
      {...props}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center justify-between mt-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}
