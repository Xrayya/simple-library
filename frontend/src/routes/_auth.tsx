import { authMeOption } from "#/lib/api.ts";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { Route as loginRoute } from "./login";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, isError } = useQuery(authMeOption);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-muted">
        <LoaderCircle className="animate-spin" />
        <span>Authenticating...</span>
      </div>
    );
  }

  if (!data || isError) {
    return <Navigate to={loginRoute.to} />;
  }

  return <Outlet />;
}
