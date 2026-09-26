import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/doctor")({
  ssr: false,
  beforeLoad: () => {
    const session = getSession();
    if (!session || session.role !== "doctor") {
      throw redirect({ to: "/auth", search: { role: "doctor" } });
    }
  },
  component: () => <Outlet />,
});
