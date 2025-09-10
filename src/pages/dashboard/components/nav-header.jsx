import { useNavigate } from "react-router-dom";

import { LogoLink } from "@/components";
import { SidebarHeader } from "@/components/ui/sidebar";

const NavHeader = () => {
  const navigate = useNavigate();

  return (
    <SidebarHeader
      onClick={() => navigate("/")}
      className="cursor-pointer h-[63px] flex items-center justify-center"
    >
      <LogoLink />
    </SidebarHeader>
  );
};

export default NavHeader;
