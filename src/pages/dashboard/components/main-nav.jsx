import { Bot, Clock, Grid2X2, Settings, User, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks";
import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";

const navMain = [];

const MainNav = () => {
  const { user } = useAuth();
  const { open, isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarContent>
      <SidebarGroup className="space-y-1">
        {[
          ...navMain,
          ...(user?.role === "Admin"
            ? [
                {
                  id: 1,
                  title: "Profile",
                  path: "/dashboard",
                  icon: User,
                  endPoint: "profile",
                },
                {
                  id: 3,
                  title: "Users",
                  path: "/dashboard",
                  icon: Users,
                  endPoint: "users",
                },
                {
                  id: 4,
                  title: "Setting",
                  path: "/dashboard",
                  icon: Settings,
                  endPoint: "setting",
                },
                {
                  id: 5,
                  title: "History",
                  path: "/dashboard",
                  icon: Clock,
                  endPoint: "history",
                },
              ]
            : []),
        ].map((item) => (
          <SidebarMenu key={item.id}>
            <NavLink
              onClick={() => setOpenMobile(false)}
              to={`${item.path}/${item.endPoint}`}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-2 hover:bg-muted p-2 rounded-lg cursor-pointer text-foreground",
                  isActive && "bg-muted hover:bg-muted"
                )
              }
            >
              <item.icon size={15} />
              <span className={cn("text-sm", !open && !isMobile && "hidden")}>
                {item.title}
              </span>
            </NavLink>
          </SidebarMenu>
        ))}
      </SidebarGroup>
    </SidebarContent>
  );
};

export default MainNav;
