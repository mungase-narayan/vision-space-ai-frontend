import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import Logo from "@/components/shared/logo";
import { Anchor } from "lucide-react";

const LogoLink = ({ className }) => {
  return (
    <NavLink
      to="/"
      aria-label="Go to homepage"
      className={cn(
        "flex items-center justify-center space-x-2 sm:space-x-3 transition-opacity hover:opacity-80",
        className
      )}
    >

      <Logo />
    </NavLink>
  );
};

export default LogoLink;
