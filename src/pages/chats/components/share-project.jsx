import { useState } from "react";
import { v4 as uuid } from "uuid";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, MessageSquare, Settings, Star, User } from "lucide-react";

import MemberCard from "./member-card";
import ChatActions from "./chat-actions";
import { useMutedGetChat } from "../hooks";
import ProjectDetails from "./project-details";
import AddMemberToProject from "./add-member-to-project";
import { useChatsProvider } from "../providers/chats-provider";

import Hint from "@/components/ui/hint";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, formatDistance, isToday, isYesterday } from "date-fns";

const ShareProject = ({ project }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="cursor-pointer p-1 hover:bg-muted transition-all rounded-lg flex items-center px-3 py-1 gap-2"
        >
          <Settings size={13} />
          <span className="text-sm">Manage</span>
        </div>
      </DialogTrigger>
      <DialogContent className="min-w-[calc(80vw)]">
        <DialogHeader>
          <DialogTitle>{project?.name}</DialogTitle>
          <DialogDescription>Manage Project</DialogDescription>
        </DialogHeader>
        <div className="relative max-h-[calc(80vh)] min-h-[calc(80vh)] overflow-y-auto">
          <ProjectTabs project={project} setOpen={setOpen} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function ProjectTabs({ project, setOpen }) {
  const { selectedTabId, pushTabToStack, setTabs, tabs } = useChatsProvider();
  const { getChat } = useMutedGetChat();
  const [isLoading, setIsLoading] = useState(false);
  const [clickedId, setClickedId] = useState(null);

  const pinnedChats = project?.allChats?.filter(
    (p) => p.isPinned && p.isCreator
  );
  const userChats = project?.allChats?.filter(
    (p) => !p.isPinned && p.isCreator
  );
  const remainigChats = project?.allChats?.filter((p) => !p.isCreator);

  const handleOnClick = async (item) => {
    const aiConversationId = item._id;

    const isExist = tabs.find((tab) => tab.id === aiConversationId);
    if (isExist) {
      pushTabToStack(aiConversationId);
      setOpen(false);
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
    setOpen(false);
    setIsLoading(false);
    setClickedId(null);
  };

  return (
    <div className="flex w-full h-full flex-col gap-6">
      <Tabs defaultValue="details" className="h-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="chats">All Chats</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="w-full">
          <ProjectDetails project={project} setOpen={setOpen} />
        </TabsContent>

        <TabsContent value="users" className="w-full">
          {project.isCreator && (
            <AddMemberToProject
              projectId={project._id}
              isCreator={project.isCreator}
            />
          )}
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-2 mt-3">
            {project.assignee
              .filter((m) => m._id === project.userId)
              .map((member) => (
                <MemberCard
                  isCreator={project.isCreator}
                  creatorId={project.userId}
                  member={member}
                  projectId={project._id}
                  key={member._id}
                />
              ))}

            {project.assignee
              .filter((m) => m._id !== project.userId)
              .map((member) => (
                <MemberCard
                  isCreator={project.isCreator}
                  creatorId={project.userId}
                  member={member}
                  projectId={project._id}
                  key={member._id}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="chats">
          <div className="h-full overflow-y-auto max-h-[calc(80vh)]">
            {pinnedChats?.length > 0 && (
              <div className="pt-2 my-1 px-1.5 relative border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star size={15} strokeWidth={2.5} />
                  <h1 className="text-sm font-bold"> Pinned Chats</h1>
                </div>
                <div className="bg-muted flex items-center justify-center px-2 py-1 rounded-sm text-xs font-medium">
                  {pinnedChats?.length || 0}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pinnedChats?.map((tab) => (
                <div key={tab._id} className="group/card w-full">
                  <Button
                    variant={selectedTabId === tab._id ? "active" : "ghost"}
                    onClick={() => handleOnClick(tab)}
                    className="w-full h-full py-2 text-start justify-start flex items-center gap-2"
                  >
                    <div className="flex flex-1 w-[150px] flex-col gap-0.5">
                      <span className="text-xs truncate flex-1 inline-block">
                        {tab.name}
                      </span>
                      <div className="text-xs text-muted-foreground flex items-center justify-between">
                        <span className="flex text-xs items-center gap-0.5">
                          {isToday(tab.updatedAt) || isYesterday(tab.updatedAt)
                            ? `${formatDistance(
                                tab.updatedAt,
                                new Date()
                              )}  ago`
                            : format(tab.updatedAt, "MMM dd, yyyy")}
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
            </div>

            {userChats?.length > 0 && (
              <div className="pt-2 my-1 px-1.5 relative border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={15} strokeWidth={2.5} />
                  <h1 className="text-sm font-bold"> Your Chats</h1>
                </div>
                <div className="bg-muted flex items-center justify-center px-2 py-1 rounded-sm text-xs font-medium">
                  {userChats?.length || 0}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {userChats?.map((tab) => (
                <div key={tab._id} className="group/card w-full">
                  <Button
                    variant={selectedTabId === tab._id ? "active" : "ghost"}
                    onClick={() => handleOnClick(tab)}
                    className="w-full h-full py-2 text-start justify-start flex items-center gap-2"
                  >
                    <div className="flex flex-1 w-[150px] flex-col gap-0.5">
                      <span className="text-xs truncate flex-1 inline-block">
                        {tab.name}
                      </span>
                      <div className="text-xs text-muted-foreground flex items-center justify-between">
                        <span className="flex text-xs items-center gap-0.5">
                          {isToday(tab.updatedAt) || isYesterday(tab.updatedAt)
                            ? `${formatDistance(
                                tab.updatedAt,
                                new Date()
                              )}  ago`
                            : format(tab.updatedAt, "MMM dd, yyyy")}
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
            </div>

            {remainigChats?.length > 0 && (
              <div className="pt-2 my-1 px-1.5 relative border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare size={15} strokeWidth={2.5} />
                  <h1 className="text-sm font-bold"> Other Chats</h1>
                </div>
                <div className="bg-muted flex items-center justify-center px-2 py-1 rounded-sm text-xs font-medium">
                  {remainigChats?.length || 0}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {remainigChats?.map((tab) => (
                <div key={tab._id} className="group/card w-full">
                  <Button
                    variant={selectedTabId === tab._id ? "active" : "ghost"}
                    onClick={() => handleOnClick(tab)}
                    className="w-full h-full py-2 text-start justify-start flex items-center gap-2"
                  >
                    <Hint label={tab?.creator?.fullName}>
                      <Avatar className="flex items-center justify-center size-4.5">
                        <AvatarImage
                          src={tab?.creator?.avatar?.url}
                          alt="profile-picture"
                        />
                        <AvatarFallback className="flex bg-foreground items-center text-xs justify-center w-full h-full text-card">
                          {tab?.creator?.fullName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Hint>

                    <div className="flex flex-1 w-[150px] flex-col gap-0.5">
                      <span className="text-xs truncate flex-1 inline-block">
                        {tab.name}
                      </span>
                      <div className="text-xs text-muted-foreground flex items-center justify-between">
                        <span className="flex text-xs items-center gap-0.5">
                          {isToday(tab.updatedAt) || isYesterday(tab.updatedAt)
                            ? `${formatDistance(
                                tab.updatedAt,
                                new Date()
                              )}  ago`
                            : format(tab.updatedAt, "MMM dd, yyyy")}
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
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ShareProject;
