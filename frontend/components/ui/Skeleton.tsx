interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-lg bg-zinc-200 ${className}`} />;
}

export function FeedSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-5">
      {[1, 2, 3].map((item) => (
        <div key={item} className="overflow-hidden rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          </div>
          <Skeleton className="mt-5 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-10/12" />
          <Skeleton className="mt-5 h-48 w-full rounded-xl sm:h-72" />
          <div className="mt-4 flex gap-3 border-t pt-3">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
