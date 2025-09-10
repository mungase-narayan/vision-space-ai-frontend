import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, isToday, isYesterday } from "date-fns";

import { LogoLink } from "@/components";
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
import { cn } from "@/lib/utils";

import { useConversationLaout } from "../provider/conversation-layout-provider";
import ChatActions from "./chat-actions";

const formatLabel = (dateKey) => {
  const date = new Date(dateKey);
  if (isToday(date)) return "Today";
  else if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMMM d");
};

export default function AppSidebar({ aiConversations, isPending, ...props }) {
  const { setTabs } = useConversationLaout();
  const { aiConversationId } = useParams();
  const navigate = useNavigate();
  const [groupedConversations, setGroupedConversations] = useState({});

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

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <LogoLink className="items-center justify-start h-full text-lg" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isPending ? (
          <div className="flex items-center justify-center h-full">
            <Loader size={15} className="animate-spin" />
          </div>
        ) : (
          Object.entries(groupedConversations || {}).map(
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
                          onClick={() => {
                            setTabs((prev) => {
                              const tabs = [...prev];
                              const isExist = tabs.find(
                                (p) => p.aiConversationId === item._id
                              );
                              if (!isExist)
                                return [
                                  ...tabs,
                                  {
                                    aiConversationId: item._id,
                                    name: item.name,
                                    userPrompt: "",
                                    files: [],
                                    isCreated: true,
                                  },
                                ];
                              return tabs;
                            });
                            navigate(`/chat/${item._id}`);
                          }}
                          className={cn(
                            "cursor-pointer",
                            aiConversationId === item._id &&
                              "text-white bg-muted-foreground hover:text-white hover:bg-muted-foreground"
                          )}
                        >
                          <div className="flex items-center group-btn justify-between">
                            <span className="truncate w-[200px] inline-block">
                              {item.name}
                            </span>
                            <div onClick={(e) => e.stopPropagation()}>
                              <ChatActions aiConversationId={item._id} />
                            </div>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroup>
              );
            }
          )
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
