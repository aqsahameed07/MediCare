import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/patient")({
  ssr: false,
  beforeLoad: () => {
    const session = getSession();
    if (!session || session.role !== "patient") {
      throw redirect({ to: "/auth", search: { role: "patient" } });
    }
  },
  component: () => <Outlet />,
});
