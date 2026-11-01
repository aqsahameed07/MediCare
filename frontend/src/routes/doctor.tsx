import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSession } from "@/api/authApi";

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
