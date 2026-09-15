import { Route as homeRoute } from "#/routes/_auth/index.tsx";
import { Route as aboutRoute } from "#/routes/about.tsx";
import { useNavigate } from "@tanstack/react-router";
import { GalleryVerticalEndIcon, Notebook } from "lucide-react";
import type { ComponentProps } from "react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { ThemeToggle } from "./theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "./ui/sidebar";

const mockUserData = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();

  const mockNavData: ComponentProps<typeof NavMain>["items"] = [
    {
      title: "Books",
      icon: <Notebook />,
      itemArgs: {
        onClick: () => {
          navigate({ to: homeRoute.to });
        },
      },
    },
    {
      title: "About",
      icon: <Notebook />,
      itemArgs: {
        onClick: () => {
          navigate({ to: aboutRoute.to });
        },
      },
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEndIcon />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Simple</span>
                <span className="truncate text-xs">Note Taking App</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={mockNavData} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeToggle />
        <NavUser user={mockUserData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
