import { Loader, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { v4 as uuid } from "uuid";

import { LogoLink } from "@/components";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useDeleteConversation, useMutedGetConversation } from "../hooks";
import ChatActions from "./chat-actions";
import { usePrint } from "./print-provider";
import { Button } from "@/components/ui/button";

const formatLabel = (dateKey) => {
  const date = new Date(dateKey);
  if (isToday(date)) return "Today";
  else if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMMM d");
};

export default function AppSidebar({
  aiConversations,
  activeTab,
  isPending,
  tabs,
  setTabs,
  setActiveTab,
  refetchConversations,
  pushTab,
  removeTab,
  ...props
}) {
  const { printFn } = usePrint();
  const [clickedId, setClickedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clickedTabId, setClickedTabId] = useState(null);
  const { getConversation } = useMutedGetConversation();
  const [groupedConversations, setGroupedConversations] = useState({});

  const { isPending: loadingDeleteTab, deleteConversation } =
    useDeleteConversation({ fn: () => refetchConversations() });

  useEffect(() => {
    const grouped = aiConversations?.reduce((groups, conversation) => {
      const date = new Date(conversation.createdAt);
      const dateKey = format(date, "yyyy-MM-dd");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].unshift(conversation);
      return groups;
    }, {});
    setGroupedConversations(grouped);
  }, [aiConversations]);

  const handleOnClick = async (item) => {
    const aiConversationId = item._id;

    const isExist = tabs.find((tab) => tab.id === aiConversationId);
    if (isExist) {
      setActiveTab(aiConversationId);
      return;
    }

    setIsLoading(true);
    setClickedId(aiConversationId);

    const response = await getConversation({ aiConversationId });
    const tab = response.data.data;
    setTabs((prev) => [
      ...prev,
      {
        ...tab,
        chats: tab.chats.map((c) => (!c?.id ? { ...c, id: uuid() } : c)),
        id: aiConversationId,
        isCreated: true,
      },
    ]);
    setActiveTab(aiConversationId);
    pushTab(aiConversationId);

    setIsLoading(false);
    setClickedId(null);
  };

  const handleDeleteTab = (tabId) => {
    setTabs((prev) => prev.filter((p) => p.id != tabId));
    deleteConversation({ data: { aiConversationId: tabId } });

    const lastTab = removeTab(tabId);
    setActiveTab(lastTab);
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-14 border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <LogoLink className="items-center justify-start text-lg" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {!isPending && aiConversations.length === 0 && (
          <div className="flex h-full items-center justify-center">
            Chats not created yet!
          </div>
        )}

        <div className="flex items-center flex-col">
          {isPending ? (
            <div className="flex items-center justify-center min-h-[calc(100vh_-106px)]">
              <Loader size={15} className="animate-spin" />
            </div>
          ) : (
            <div className="min-h-[calc(100vh_-106px)] max-h-[calc(100vh_-106px)] overflow-y-auto">
              {Object.entries(groupedConversations || {}).map(
                ([dateKey, aiConversations]) => {
                  return (
                    <SidebarGroup key={dateKey}>
                      <div className="text-center my-2 relative">
                        <hr className="absolute top-1/2 left-0 right-0 border-t border-[0.4px] border-muted-foreground/10" />
                        <span className="relative inline-block bg-muted px-4 py-1 rounded-full text-xs border shadow-sm">
                          {formatLabel(dateKey)}
                        </span>
                      </div>
                      <SidebarMenu>
                        {[...aiConversations].reverse().map((item) => (
                          <SidebarMenuItem key={item._id}>
                            <SidebarMenuButton
                              asChild
                              onClick={() => handleOnClick(item)}
                              className={cn(
                                "cursor-pointer",
                                activeTab === item._id &&
                                  "text-white bg-muted-foreground hover:text-white hover:bg-muted-foreground"
                              )}
                            >
                              <div className="flex items-center group-btn justify-between">
                                <span className="truncate w-[200px] inline-block">
                                  {item.name}
                                </span>
                                {isLoading && clickedId === item._id ? (
                                  <Loader className="animate-spin" />
                                ) : (
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <ChatActions
                                      isPending={
                                        loadingDeleteTab &&
                                        clickedTabId === item._id
                                      }
                                      aiConversationId={item._id}
                                      handleDeleteTab={() => {
                                        setClickedTabId(item._id);
                                        handleDeleteTab(item._id);
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroup>
                  );
                }
              )}
            </div>
          )}
          <div className="bg-muted h-[50px] w-full border-t px-4 py-2 z-10 flex items-center">
            <Button onClick={printFn} className="cursor-pointer w-full">
              <Printer />
              Print Chats
            </Button>
          </div>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
