import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Counter } from "@/components/motion/reveal";

export function MetricCard({
  label,
  value,
  icon: Icon,
  change,
  prefix,
  suffix,
  delay = 0,
  hint,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  change?: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
  hint?: string;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <GlassCard delay={delay} className="group relative overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:bg-primary/25" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold">
            <Counter value={value} prefix={prefix ?? ""} suffix={suffix ?? ""} />
          </p>
        </div>
        <span className="gradient-primary flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs">
        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
              positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
            }`}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? "+" : ""}
            {change}%
          </span>
        )}
        <span className="text-muted-foreground">{hint ?? "vs last month"}</span>
      </div>
    </GlassCard>
  );
}
