import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Activity, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Platform", to: "/#features" },
  { label: "AI Care", to: "/#ai" },
  { label: "Sign in", to: "/auth" },
  { label: "Patient", to: "/patient" },
  { label: "Doctor", to: "/doctor" },
  { label: "Admin", to: "/admin" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div
          className={`flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500 ${
            scrolled ? "glass" : "bg-transparent"
          }`}
        >
          <Link to="/" className="group flex items-center gap-2">
            <span className="gradient-primary flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground transition-transform duration-300 group-hover:rotate-6">
              <Activity className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">MediAI Care</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.to}
                className="relative rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground after:absolute after:bottom-1 after:left-3 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-[calc(100%-1.5rem)]"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" className="hidden rounded-xl sm:inline-flex">
              <Link to="/patient">Open dashboard</Link>
            </Button>
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setOpen((o) => !o)}
              className="glass inline-flex h-9 w-9 items-center justify-center rounded-full md:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="glass mt-2 overflow-hidden rounded-2xl p-2 md:hidden"
            >
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                >
                  {l.label}
                </a>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
