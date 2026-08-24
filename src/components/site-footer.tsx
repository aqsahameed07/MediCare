import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";

const columns = [
  { title: "Product", items: ["AI Symptom Checker", "Doctor Matching", "Appointments", "Analytics"] },
  { title: "Company", items: ["About", "Careers", "Press", "Contact"] },
  { title: "Legal", items: ["Privacy", "Terms", "HIPAA", "Security"] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="gradient-primary flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground">
              <Activity className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">MediAI Care</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            AI-assisted care coordination for patients, clinicians and health systems. Demo
            experience built with realistic sample data.
          </p>
        </div>
        {columns.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-semibold">{c.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {c.items.map((i) => (
                <li key={i}>
                  <span className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-primary">
                    {i}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 px-4 py-5">
        <p className="mx-auto max-w-7xl text-xs text-muted-foreground">
          © 2026 MediAI Care. Demonstration product — not for clinical use.
        </p>
      </div>
    </footer>
  );
}
