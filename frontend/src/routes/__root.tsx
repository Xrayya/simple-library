import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <Toaster />
      <Header />

      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
