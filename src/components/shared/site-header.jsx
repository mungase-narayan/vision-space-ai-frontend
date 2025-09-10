import {
  LogoLink,
  AuthButtons,
  NavLinks,
  LogOutButton,
  ModeToggle,
} from "@/components";
import { useAuth } from "@/hooks";
import { NAV_LINKS } from "@/constants";

import UserAvatar from "./user-avatar";
import MobileHeader from "./mobile-header";
import SettingButton from "./setting-button";

const SiteHeader = () => {
  const { isAuth } = useAuth();
  return (
    <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 sm:px-8 mx-auto flex h-14 items-center space-x-2 justify-between">
        <div className="flex items-center justify-center space-x-4 sm:space-x-8">
          <LogoLink />
          <NavLinks links={NAV_LINKS} />
        </div>
        <div className="flex items-center justify-center space-x-2">
          <ModeToggle />
          <div className="md:flex hidden">
            <AuthButtons />
          </div>
          {isAuth && (
            <div className="w-full hidden md:flex gap-2  items-center justify-center">
              <UserAvatar />
              <div className="h-[20px] border-l border-black"></div>
              <LogOutButton isText={false} />
            </div>
          )}
          <MobileHeader />
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
