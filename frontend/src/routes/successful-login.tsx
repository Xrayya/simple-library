import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Route as aboutRoute } from "./about";

export const Route = createFileRoute("/successful-login")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Navigate to={aboutRoute.to} />;
}
