import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks";

const NavLinks = ({ links }) => {
  const { isAuth } = useAuth();

  return (
    <div className="items-center justify-center space-x-4 hidden md:flex">
      {(!isAuth ? links.filter((l) => l.isProtected === false) : links).map(
        (link) => (
          <NavLink
            key={link.id}
            to={link.path}
            className={({ isActive }) =>
              cn(
                "hover:text-primary transition-all space-x-1 flex items-center text-muted-foreground justify-center",
                isActive && "text-primary"
              )
            }
          >
            <span className="text-sm">{link.title}</span>
          </NavLink>
        )
      )}
    </div>
  );
};

export default NavLinks;
