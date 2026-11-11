import { cn } from "@/shared/lib/cn";

interface SkeletonProps {
  className?: string;
}

/** Shimmer block used while a query is in flight. */
export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-sm bg-surface-2", className)} />;
}

/** A stack of text lines — handy for cards and detail panels. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("grid gap-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn("h-4", index === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}
