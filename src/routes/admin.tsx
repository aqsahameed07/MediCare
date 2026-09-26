import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: () => {
    const session = getSession();
    if (!session || session.role !== "admin") {
      throw redirect({ to: "/auth", search: { role: "admin" } });
    }
  },
  component: () => <Outlet />,
});
