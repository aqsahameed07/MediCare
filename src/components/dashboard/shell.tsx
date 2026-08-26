import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Activity, Bell, Menu, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PageTransition } from "@/components/motion/reveal";
import { notifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export function DashboardShell({
  title,
  subtitle,
  nav,
  role,
  persona,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  nav: NavItem[];
  role: string;
  persona: { name: string; meta: string; hue: number };
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(notifications.filter((n) => !n.read).length);

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link to="/" className="group flex items-center gap-2 px-2">
        <span className="gradient-primary flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground transition-transform duration-300 group-hover:rotate-6">
          <Activity className="h-5 w-5" />
        </span>
        <span className="font-display text-base font-semibold">MediAI Care</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {role}
        </p>
        {nav.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to as "/"}
              onClick={() => setOpen(false)}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300",
                active
                  ? "bg-primary/12 font-medium text-primary"
                  : "text-muted-foreground hover:translate-x-1 hover:bg-accent/60 hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId={`nav-${role}`}
                  className="gradient-primary absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full"
                />
              )}
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="glass flex items-center gap-3 rounded-2xl p-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ background: `linear-gradient(135deg, hsl(${persona.hue} 70% 52%), hsl(${(persona.hue + 48) % 360} 70% 60%))` }}
        >
          {persona.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{persona.name}</p>
          <p className="truncate text-xs text-muted-foreground">{persona.meta}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="gradient-hero min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-sidebar/60 backdrop-blur-xl lg:block">
          {sidebar}
        </aside>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            >
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                className="h-full w-64 border-r border-border/60 bg-sidebar"
              >
                {sidebar}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setOpen(true)}
                className="glass inline-flex h-9 w-9 items-center justify-center rounded-xl lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="relative hidden max-w-sm flex-1 md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search patients, doctors, records…" className="rounded-xl pl-9" />
              </div>

              <div className="ml-auto flex items-center gap-2">
                {actions}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Notifications"
                      onClick={() => setUnread(0)}
                      className="glass relative inline-flex h-9 w-9 items-center justify-center rounded-xl transition-transform hover:scale-105"
                    >
                      <Bell className="h-4 w-4" />
                      {unread > 0 && (
                        <span className="animate-pulse-ring absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                          {unread}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 rounded-2xl p-0">
                    <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                      <p className="text-sm font-semibold">Notifications</p>
                      <span className="text-xs text-muted-foreground">{notifications.length} total</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((n, i) => (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-border/40 px-4 py-3 transition-colors last:border-0 hover:bg-accent/50"
                        >
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground/80">{n.time}</p>
                        </motion.div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <ThemeToggle />
                <Button asChild size="sm" variant="outline" className="hidden rounded-xl sm:inline-flex">
                  <Link to="/">Exit</Link>
                </Button>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8">
            <PageTransition>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
                  {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
                </div>
              </div>
              {children}
            </PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
}

export function CloseIcon() {
  return <X className="h-4 w-4" />;
}
