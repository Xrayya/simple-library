import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Route as homeRoute } from "./_auth/index.tsx";

export const Route = createFileRoute("/successful-login")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Navigate to={homeRoute.to} />;
}
