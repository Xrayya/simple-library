import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "#/components/ui/sidebar";
import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps } from "react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    itemArgs?: ComponentProps<typeof SidebarMenuButton>;
    subItems?: {
      title: string;
      itemArgs?: ComponentProps<typeof SidebarMenuSubButton>;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Notes</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item, idx) => (
          <Collapsible
            key={idx}
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger className="w-full">
                <SidebarMenuButton tooltip={item.title} {...item.itemArgs}>
                  {item.icon}
                  <span>{item.title}</span>
                  {item.subItems ? (
                    <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  ) : null}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {item.subItems ? (
                <CollapsibleContent className="w-full">
                  <SidebarMenuSub>
                    {item.subItems?.map((subItem, idx) => (
                      <SidebarMenuSubItem key={idx}>
                        <SidebarMenuSubButton {...subItem.itemArgs}>
                          {subItem.title}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
