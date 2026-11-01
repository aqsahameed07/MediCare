import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "motion/react";

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted/70 ${className}`} />;
}

export function CardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass space-y-3 rounded-2xl p-5">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-8 w-32" />
          <SkeletonBlock className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass flex items-center gap-4 rounded-2xl p-4">
          <SkeletonBlock className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-3.5 w-2/5" />
            <SkeletonBlock className="h-3 w-1/4" />
          </div>
          <SkeletonBlock className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center"
    >
      <span className="animate-float flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </motion.div>
  );
}

/** Simple delayed-ready hook so skeleton loaders are visible on first paint. */
export function useSimulatedLoad(ms = 700) {
  return useDelayedReady(ms);
}

import { useEffect, useState } from "react";
function useDelayedReady(ms: number) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return ready;
}
