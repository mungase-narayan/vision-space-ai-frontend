import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/constants";
import { useAuth } from "@/hooks";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";

import { AuthButtons, LogOutButton } from "@/components";
import UserAvatar from "./user-avatar";

const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuth } = useAuth();

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger className="md:hidden cursor-pointer">
        {isOpen ? <X /> : <Menu strokeWidth={1.2} size={28} />}
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex-col flex gap-3 my-6">
          <div className="flex items-start px-3 py-1">
            {isAuth ? <UserAvatar /> : <AuthButtons />}
          </div>
          {NAV_LINKS.map((link) => {
            if (link.isProtected && !isAuth) return null;
            return (
              <NavLink
                onClick={() => setIsOpen(false)}
                key={link.id}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "hover:text-primary transition-all space-x-2 flex items-center text-muted-foreground w-full px-3 py-1",
                    isActive && "text-primary bg-secondary"
                  )
                }
              >
                <link.icon className="size-4" />
                <span className="text-sm">{link.title}</span>
              </NavLink>
            );
          })}
          <LogOutButton isText={true} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileHeader;
