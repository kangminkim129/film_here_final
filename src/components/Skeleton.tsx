// 로딩 스켈레톤 프리미티브 + 자주 쓰는 조합
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />;
}

export function SpotCardSkeleton() {
  return (
    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="w-12 h-12 rounded-full" />
        <Skeleton className="w-5 h-5 rounded" />
      </div>
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <div className="pt-4 border-t border-white/5 flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-20 rounded-xl" />
      </div>
    </div>
  );
}

export function PosterSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[2/3] w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/5">
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
