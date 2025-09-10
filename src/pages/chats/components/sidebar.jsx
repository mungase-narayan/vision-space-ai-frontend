import { v4 as uuid } from "uuid";
import { useEffect, useState } from "react";
import { format, formatDistance, isToday, isYesterday } from "date-fns";
import {
  PlusIcon,
  SearchIcon,
  Loader2,
  Folder,
  Star,
  Clock,
  ForwardIcon,
  FolderOpen,
  StarOff,
  Clock12Icon,
} from "lucide-react";

import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/components/shared/logo";
import { ScrollArea } from "@/components/ui/scroll-area";

import ProfileMenu from "./profile-menu";
import { useMutedGetChat } from "../hooks";
import ChatActions from "./chat-actions";
import CreateProject from "./create-project";
import ProjectButtons from "./project-buttons";
import { useChatsProvider } from "../providers/chats-provider";
import { Separator } from "@/components/ui/separator";

// const formatLabel = (dateKey) => {
//   const date = new Date(dateKey);
//   if (isToday(date)) return "Today";
//   else if (isYesterday(date)) return "Yesterday";
//   return format(date, "EEEE, MMMM d");
// };

export default function ChatsSidebar() {
  const {
    chats,
    selectedTabId,
    addTab,
    pushTabToStack,
    setTabs,
    tabs,
    pinnedConversations,
    projects,
    totalChats,
    projectsLoading,
  } = useChatsProvider();

  const { getChat } = useMutedGetChat();

  const [isLoading, setIsLoading] = useState(false);
  const [clickedId, setClickedId] = useState(null);
  const [groupedConversations, setGroupedConversations] = useState({});
  const [openBtns, setOpenBtns] = useState({
    pinnedTab: false,
    projectTab: false,
    recentTab: true,
  });

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const filteredChats = searchQuery
      ? chats.filter((chat) =>
          chat.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : chats;

    const sortedChats = [...filteredChats].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    const grouped = sortedChats?.reduce((groups, conversation) => {
      const date = new Date(conversation.updatedAt);
      const dateKey = format(date, "yyyy-MM-dd");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].unshift(conversation);
      return groups;
    }, {});
    setGroupedConversations(grouped);
  }, [searchQuery, chats]);

  const handleOnClick = async (item) => {
    const aiConversationId = item._id;

    const isExist = tabs.find((tab) => tab.id === aiConversationId);
    if (isExist) {
      pushTabToStack(aiConversationId);
      return;
    }

    setIsLoading(true);
    setClickedId(aiConversationId);

    const response = await getChat({ aiConversationId });
    const tab = response.data.data;
    const newTab = {
      ...tab,
      chats: tab.chats.map((c) => (!c?.id ? { ...c, id: uuid() } : c)),
      files: [],
      id: aiConversationId,
      isCreated: true,
      task: tab?.task ? tab.task : "Basic Tasks",
    };
    setTabs((prev) => [...prev, newTab]);
    pushTabToStack(aiConversationId);

    setIsLoading(false);
    setClickedId(null);
  };

  return (
    <Sidebar collapsible="icon">
      <div
        className={cn(
          "flex flex-col h-full bg-background transition-all duration-300"
        )}
      >
        <SidebarHeader className="cursor-pointer h-[63px] flex items-center justify-center">
          <div className="flex items-center justify-center p-4">
            <Logo className="w-[180px]" />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <div className="px-4 flex gap-2 flex-col">
            <Button
              size="sm"
              onClick={addTab}
              className="flex items-center justify-start gap-2 !px-4 text-start"
            >
              <PlusIcon size={13} />
              <span>New Chat</span>
            </Button>
            <CreateProject />
          </div>

          <div className="px-4 mb-1">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-2 h-4 w-4 text-gray-500" />

              <Input
                placeholder="Search chats..."
                className="pl-8 h-8 border-none bg-muted"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="px-2 py-1">
              {projectsLoading && (
                <div className="px-1.5 py-3 relative border-t gap-2 flex items-center justify-center cursor-pointer">
                  <Loader2 className="animate-spin" size={12} />
                  <span className="text-xs">Projects Loading...</span>
                </div>
              )}

              {projects.length > 0 && (
                <div
                  onClick={() =>
                    setOpenBtns((prev) => ({
                      ...prev,
                      projectTab: !prev.projectTab,
                    }))
                  }
                  className="px-1.5 py-2 relative border-t flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {openBtns.projectTab ? (
                      <FolderOpen size={15} strokeWidth={2.5} />
                    ) : (
                      <Folder size={15} strokeWidth={2.5} />
                    )}
                    <h1 className="text-sm font-bold">Projects</h1>
                  </div>
                  <div className="bg-muted flex items-center justify-center px-2 py-1 rounded-sm text-xs font-medium">
                    {projects.length}
                  </div>
                </div>
              )}
              {openBtns.projectTab && <ProjectButtons />}

              {pinnedConversations.length > 0 && (
                <div
                  onClick={() =>
                    setOpenBtns((prev) => ({
                      ...prev,
                      pinnedTab: !prev.pinnedTab,
                    }))
                  }
                  className="cursor-pointer py-2 px-1.5 relative border-t flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Star
                      size={15}
                      strokeWidth={2.5}
                      className={cn(
                        "duration-100 transition-all",
                        openBtns.pinnedTab ? "rotate-360" : "rotate-0"
                      )}
                    />
                    <h1 className="text-sm font-bold"> Pinned Chats</h1>
                  </div>
                  <div className="bg-muted flex items-center justify-center px-2 py-1 rounded-sm text-xs font-medium">
                    {pinnedConversations.length}
                  </div>
                </div>
              )}

              {openBtns.pinnedTab &&
                pinnedConversations.map((tab) => (
                  <div
                    key={tab._id}
                    className="group/card w-[260px] mt-2 md:w-[240px]"
                  >
                    <Button
                      variant={selectedTabId === tab._id ? "active" : "ghost"}
                      onClick={() => handleOnClick(tab)}
                      className="w-full h-full py-2 text-start justify-start flex items-center gap-2"
                    >
                      {/* {clickedId === tab._id && isLoading ? (
                      <Loader2 className="animate-spin h-3 w-3 flex-shrink-0" />
                    ) : (
                      <MessageSquareIcon className="h-4 w-4 flex-shrink-0" />
                    )} */}
                      <div className="flex flex-1 w-[150px] flex-col gap-0.5">
                        <span className="text-xs truncate flex-1 inline-block">
                          {tab.name}
                        </span>
                        <div className="text-xs text-muted-foreground flex items-center justify-between">
                          <span className="flex text-xs items-center gap-0.5">
                            {isToday(tab.updatedAt) ||
                            isYesterday(tab.updatedAt)
                              ? `${formatDistance(
                                  tab.updatedAt,
                                  new Date()
                                )}  ago`
                              : format(tab.updatedAt, "MMM dd, yyyy")}
                            {!tab.isCreator && (
                              <ForwardIcon className="size-[10px]" />
                            )}
                            {clickedId === tab._id && isLoading && (
                              <Loader2 className="size-[10px] animate-spin flex-shrink-0" />
                            )}
                          </span>
                        </div>
                      </div>

                      <ChatActions tab={tab} />
                    </Button>
                  </div>
                ))}

              {totalChats > 0 && (
                <div
                  onClick={() =>
                    setOpenBtns((prev) => ({
                      ...prev,
                      recentTab: !prev.recentTab,
                    }))
                  }
                  className="py-2 px-1.5 relative border-t flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {!openBtns?.recentTab ? (
                      <Clock12Icon size={15} strokeWidth={2.5} />
                    ) : (
                      <Clock size={15} strokeWidth={2.5} />
                    )}
                    <h1 className="text-sm font-bold"> Recent Chats</h1>
                  </div>
                  <div className="bg-muted flex items-center justify-center px-2 py-1 rounded-sm text-xs font-medium">
                    {totalChats}
                  </div>
                </div>
              )}

              {openBtns.recentTab &&
                Object.entries(groupedConversations || {}).map(
                  ([dateKey, aiConversations]) => {
                    return (
                      <div key={dateKey}>
                        {/* <div className="text-center my-2 relative">
                        <hr className="absolute top-1/2 left-0 right-0 border-t border-[0.4px] border-muted-foreground/10" />
                        <span className="relative inline-block bg-muted px-4 py-1 rounded-full text-xs border shadow-sm">
                          {formatLabel(dateKey)}
                        </span>
                      </div> */}
                        <div>
                          {[...aiConversations].reverse().map((tab) => (
                            <div
                              key={tab._id}
                              className="group/card mt-2 w-[260px] md:w-[240px]"
                            >
                              {/* <Button
                              variant={
                                selectedTabId === tab._id ? "active" : "ghost"
                              }
                              onClick={() => handleOnClick(tab)}
                              className="w-full text-start flex items-center gap-2"
                            >
                              {clickedId === tab._id && isLoading ? (
                                <Loader2 className="animate-spin h-3 w-3 flex-shrink-0" />
                              ) : (
                                <MessageSquareIcon className="h-4 w-4 flex-shrink-0" />
                              )}
                              <span className="text-xs md:text-sm truncate flex-1 inline-block">
                                {tab.name}
                              </span>

                              <ChatActions tab={tab} />
                            </Button> */}
                              <Button
                                variant={
                                  selectedTabId === tab._id ? "active" : "ghost"
                                }
                                onClick={() => handleOnClick(tab)}
                                className="w-full h-full py-2 text-start justify-start flex items-center gap-2"
                              >
                                {/* {clickedId === tab._id && isLoading ? (
                                <Loader2 className="animate-spin h-3 w-3 flex-shrink-0" />
                              ) : (
                                <MessageSquareIcon className="h-4 w-4 flex-shrink-0" />
                              )} */}
                                <div className="flex flex-1 w-[150px] flex-col gap-0.5">
                                  <span className="text-xs truncate flex-1 inline-block">
                                    {tab.name}
                                  </span>
                                  <div className="text-xs text-muted-foreground flex items-center justify-between">
                                    <span className="flex text-xs items-center gap-0.5">
                                      {isToday(tab.updatedAt) ||
                                      isYesterday(tab.updatedAt)
                                        ? `${formatDistance(
                                            tab.updatedAt,
                                            new Date()
                                          )}  ago`
                                        : format(tab.updatedAt, "MMM dd, yyyy")}
                                      {!tab.isCreator && (
                                        <ForwardIcon className="size-[10px]" />
                                      )}
                                      {clickedId === tab._id && isLoading && (
                                        <Loader2 className="size-[10px] animate-spin flex-shrink-0" />
                                      )}
                                    </span>
                                    {/* <span className="bg-muted text-xs px-1 py-0.5 border rounded-sm">
                                    {tab?.messageCount}
                                  </span> */}
                                  </div>
                                </div>

                                <ChatActions tab={tab} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              <Separator />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <ProfileMenu />
          </div>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
