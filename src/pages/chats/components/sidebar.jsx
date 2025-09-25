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
  Map,
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
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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
          "flex flex-col h-full bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 backdrop-blur-sm transition-all duration-300 border-r border-sidebar-border/50 shadow-lg"
        )}
      >
        <SidebarHeader className="cursor-pointer h-[56px] flex items-center justify-center relative overflow-hidden border-b border-sidebar-border/20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-accent/3 to-primary/3"></div>
          <div className="flex items-center justify-center px-3 py-2 relative z-10">
            <Logo className="w-[160px] drop-shadow-sm" />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <div className="px-3 flex gap-2 flex-col py-2">
            <Button
              size="sm"
              onClick={addTab}
              className="
    flex items-center justify-start gap-2 !px-3 text-start
    bg-gradient-to-r from-sky-700 to-sky-900
    hover:from-sky-800 hover:to-sky-950
    shadow-sm border border-blue-400/20
    transition-all duration-200 hover:shadow-md
    h-8 text-xs font-medium text-white
  "
            >
              <PlusIcon size={12} />
              <span>New Chat</span>
            </Button>

            {/* <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/maps')}
              className="flex items-center justify-start gap-2 !px-3 text-start hover:bg-accent hover:text-accent-foreground transition-all duration-200 h-8 text-xs font-medium"
            >
              <Map size={12} />
              <span>Maps Dashboard</span>
            </Button> */}
            <CreateProject />
          </div>

          <div className="px-3 mb-2">
            <div className="relative group">
              <SearchIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-200" />
              <Input
                placeholder="Search chats..."
                className="pl-8 h-7 border-0 bg-muted/40 backdrop-blur-sm focus:bg-muted/60 focus:ring-1 focus:ring-primary/30 transition-all duration-200 rounded-md shadow-sm text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border/30 scrollbar-track-transparent hover:scrollbar-thumb-sidebar-border/50">
            <div className="px-1 py-1">
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
                  className="px-2 py-2 relative border-t border-sidebar-border/20 flex items-center justify-between cursor-pointer group hover:bg-sidebar-accent/20 transition-all duration-200 rounded-md mx-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-primary/8 group-hover:bg-primary/15 transition-all duration-200">
                      {openBtns.projectTab ? (
                        <FolderOpen
                          size={14}
                          strokeWidth={2.5}
                          className="text-primary"
                        />
                      ) : (
                        <Folder
                          size={14}
                          strokeWidth={2.5}
                          className="text-primary"
                        />
                      )}
                    </div>
                    <h1 className="text-xs font-semibold text-sidebar-foreground">
                      Projects
                    </h1>
                  </div>
                  <div className="bg-primary/8 text-primary flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium border border-primary/15">
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
                  className="cursor-pointer py-2 px-2 relative border-t border-sidebar-border/20 flex items-center justify-between group hover:bg-sidebar-accent/20 transition-all duration-200 rounded-md mx-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-yellow-500/8 group-hover:bg-yellow-500/15 transition-all duration-200">
                      <Star
                        size={14}
                        strokeWidth={2.5}
                        className={cn(
                          "text-yellow-500 duration-300 transition-all",
                          openBtns.pinnedTab
                            ? "rotate-12 scale-110"
                            : "rotate-0 scale-100"
                        )}
                      />
                    </div>
                    <h1 className="text-xs font-semibold text-sidebar-foreground">
                      Pinned
                    </h1>
                  </div>
                  <div className="bg-yellow-500/8 text-yellow-600 dark:text-yellow-400 flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium border border-yellow-500/15">
                    {pinnedConversations.length}
                  </div>
                </div>
              )}

              {openBtns.pinnedTab &&
                pinnedConversations.map((tab) => (
                  <div
                    key={tab._id}
                    className="group/card w-[260px] mt-1 md:w-[240px] mx-1"
                  >
                    <Button
                      variant={selectedTabId === tab._id ? "active" : "ghost"}
                      onClick={() => handleOnClick(tab)}
                      className={cn(
                        "w-full h-full py-2 px-2 text-start justify-start flex items-center gap-2 rounded-md transition-all duration-200 group-hover:shadow-sm",
                        selectedTabId === tab._id
                          ? "bg-primary/8 border border-primary/15 shadow-sm"
                          : "hover:bg-sidebar-accent/30 border border-transparent hover:border-sidebar-border/20"
                      )}
                    >
                      <div className="flex flex-1 w-[150px] flex-col gap-0.5">
                        <span className="text-xs font-medium truncate flex-1 inline-block text-sidebar-foreground">
                          {tab.name}
                        </span>
                        <div className="text-xs text-muted-foreground flex items-center justify-between">
                          <span className="flex text-xs items-center gap-1">
                            {isToday(tab.updatedAt) ||
                            isYesterday(tab.updatedAt)
                              ? `${formatDistance(
                                  tab.updatedAt,
                                  new Date()
                                )}  ago`
                              : format(tab.updatedAt, "MMM dd, yyyy")}
                            {!tab.isCreator && (
                              <ForwardIcon className="size-[8px] text-muted-foreground/50" />
                            )}
                            {clickedId === tab._id && isLoading && (
                              <Loader2 className="size-[8px] animate-spin flex-shrink-0" />
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
                  className="py-2 px-2 relative border-t border-sidebar-border/20 flex items-center justify-between cursor-pointer group hover:bg-sidebar-accent/20 transition-all duration-200 rounded-md mx-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-blue-500/8 group-hover:bg-blue-500/15 transition-all duration-200">
                      {!openBtns?.recentTab ? (
                        <Clock12Icon
                          size={14}
                          strokeWidth={2.5}
                          className="text-blue-500"
                        />
                      ) : (
                        <Clock
                          size={14}
                          strokeWidth={2.5}
                          className="text-blue-500"
                        />
                      )}
                    </div>
                    <h1 className="text-xs font-semibold text-sidebar-foreground">
                      Recent
                    </h1>
                  </div>
                  <div className="bg-blue-500/8 text-blue-600 dark:text-blue-400 flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium border border-blue-500/15">
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
                              className="group/card mt-1 w-[260px] md:w-[240px] mx-1"
                            >
                              <Button
                                variant={
                                  selectedTabId === tab._id ? "active" : "ghost"
                                }
                                onClick={() => handleOnClick(tab)}
                                className={cn(
                                  "w-full h-full py-2 px-2 text-start justify-start flex items-center gap-2 rounded-md transition-all duration-200 group-hover:shadow-sm",
                                  selectedTabId === tab._id
                                    ? "bg-sky-300/20 border border-primary/15 shadow-sm"
                                    : "hover:bg-sidebar-accent/30 border border-transparent hover:border-sidebar-border/20"
                                )}
                              >
                                <div className="flex flex-1 w-[150px] flex-col gap-0.5">
                                  <span className="text-xs font-medium truncate flex-1 inline-block text-sidebar-foreground">
                                    {tab.name}
                                  </span>
                                  <div className="text-xs text-muted-foreground flex items-center justify-between">
                                    <span className="flex text-xs items-center gap-1">
                                      {isToday(tab.updatedAt) ||
                                      isYesterday(tab.updatedAt)
                                        ? `${formatDistance(
                                            tab.updatedAt,
                                            new Date()
                                          )}  ago`
                                        : format(tab.updatedAt, "MMM dd, yyyy")}
                                      {!tab.isCreator && (
                                        <ForwardIcon className="size-[8px] text-muted-foreground/50" />
                                      )}
                                      {clickedId === tab._id && isLoading && (
                                        <Loader2 className="size-[8px] animate-spin flex-shrink-0" />
                                      )}
                                    </span>
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
            </div>
          </ScrollArea>
          <Separator />
          <div className="p-3 border-t border-sidebar-border/20 bg-gradient-to-r from-sidebar-accent/10 via-transparent to-sidebar-accent/10">
            <ProfileMenu />
          </div>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
