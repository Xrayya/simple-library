import { AppSidebar } from "#/components/app-sidebar.tsx";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "#/components/ui/breadcrumb.tsx";
import { Separator } from "#/components/ui/separator.tsx";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "#/components/ui/sidebar.tsx";
import { authMeOption } from "#/lib/api.ts";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { Route as loginRoute } from "./login";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteLayout() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Build Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="@container/main px-8 transition-all duration-250 xl:px-4">
          <Outlet />
        </div>
      </SidebarInset>
    </>
  );
}

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

  return (
    <SidebarProvider>
      <RouteLayout />
    </SidebarProvider>
  );
}
