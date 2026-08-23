import { AuthProvider } from "@/components/auth-provider";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth-protected")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
