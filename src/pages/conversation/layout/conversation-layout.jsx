import { useEffect, useState } from "react";
import { Navigate, Outlet, useParams, useSearchParams } from "react-router-dom";

import { useAuth } from "@/hooks";
import { cn } from "@/lib/utils";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import { AuthButtons, LogoLink, LogOutButton } from "@/components";
import SettingButton from "@/components/shared/setting-button";
import UserAvatar from "@/components/shared/user-avatar";
import MobileHeader from "@/components/shared/mobile-header";

import AppSidebar from "../components/app-sidebar";
import useGetConversations from "../hooks/use-get-conversations";
import { ConversationLayoutContext } from "../provider/conversation-layout-provider";

const ConversationLayout = () => {
  const { isAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const { aiConversationId } = useParams();
  const { aiConversations, isPending, refetch } = useGetConversations();

  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    if (!aiConversationId) return;

    const tabExists = tabs.some((t) => t.aiConversationId === aiConversationId);
    if (tabExists) return;

    const data = { aiConversationId, chats: [], userPrompt: "", files: [] };
    const isForCreating = searchParams.get("forCreating") === "true";

    if (isForCreating) {
      const newTab = { ...data, forCreating: true, name: "New Chat" };
      setTabs((prev) => [...prev, newTab]);
    } else if (aiConversations.length) {
      const newTab = {
        ...data,
        ...aiConversations.find((conv) => conv._id === aiConversationId),
        forCreating: false,
      };
      setTabs((prev) => [...prev, newTab]);
    }
  }, [aiConversationId, aiConversations]);

  if (!isAuth) return <Navigate to="/" />;

  return (
    <ConversationLayoutContext.Provider
      value={{ tabs, setTabs, refetchAIConversations: refetch }}
    >
      <div className="border-grid flex flex-1 flex-col min-h-screen">
        <SidebarProvider>
          <AppSidebar aiConversations={aiConversations} isPending={isPending} />
          <SidebarInset>
            <Header />
            <Children />
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ConversationLayoutContext.Provider>
  );
};

const Header = () => {
  const { isMobile, open } = useSidebar();
  const { isAuth } = useAuth();
  return (
    <div className="flex items-center border-b justify-between px-4 sm:px-8 h-14 space-x-2">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        {(isMobile || !open) && (
          <LogoLink className="items-center justify-start h-full text-lg" />
        )}
      </div>

      <div className="flex items-center justify-center space-x-2">
        <SettingButton />
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
  );
};

const Children = () => {
  const { isMobile, open } = useSidebar();
  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        open && !isMobile ? "w-[calc(100vw_-258px)]" : "w-full"
      )}
    >
      <Outlet />
    </div>
  );
};

export default ConversationLayout;
