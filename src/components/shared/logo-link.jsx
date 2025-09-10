import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";
import Logo from "@/components/shared/logo";

const LogoLink = ({ className }) => {
  return (
    <NavLink
      to="/"
      className={cn(
        "flex items-center justify-center space-x-2 sm:space-x-4",
        className
      )}
    >
      <Logo />
    </NavLink>
  );
};

export default LogoLink;
