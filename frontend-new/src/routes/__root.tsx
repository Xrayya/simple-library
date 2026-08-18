import { ThemeProvider } from "#/contexts/theme-context";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import "../styles.css";

export const queryClient = new QueryClient();

export const Route = createRootRouteWithContext<{
  queryClient: typeof queryClient;
}>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <Outlet />
        </ThemeProvider>
      </QueryClientProvider>
      <TanStackDevtools
        config={{
          position: "bottom-right",
        }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  );
}
