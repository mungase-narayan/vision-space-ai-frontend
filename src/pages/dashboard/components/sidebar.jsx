import { Sidebar, SidebarRail } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import NavHeader from "./nav-header";
import MainNav from "./main-nav";
import SecondaryNav from "./secondary-nav";

const DashboardSidebar = () => {
  return (
    <Sidebar collapsible="icon">
      <NavHeader />
      <Separator />
      <MainNav />
      <SecondaryNav />
      <SidebarRail />
    </Sidebar>
  );
};

export default DashboardSidebar;
