import { useState } from "react";
import { v4 as uuid } from "uuid";
import {
  ChevronDown,
  ChevronRight,
  FolderClosed,
  FolderOpen,
  ForwardIcon,
  Pin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useMutedGetChat } from "../hooks";
import ChatActions from "./chat-actions";
import ProjectActions from "./project-actions";
import { useChatsProvider } from "../providers/chats-provider";

const ProjectButtons = () => {
  const { projects } = useChatsProvider();

  return (
    <div className="relative">
      {projects?.map((project) => (
        <ProjectButton project={project} key={project._id} />
      ))}
    </div>
  );
};

const ProjectButton = ({ project }) => {
  const { selectedTabId, pushTabToStack, setTabs, tabs } = useChatsProvider();
  const { getChat } = useMutedGetChat();

  const [open, setOpen] = useState(false);

  const handleOnClick = async (item, projectName) => {
    const aiConversationId = item._id;

    const isExist = tabs.find((tab) => tab.id === aiConversationId);
    if (isExist) {
      pushTabToStack(aiConversationId);
      return;
    }

    const response = await getChat({ aiConversationId });
    const tab = response.data.data;
    const newTab = {
      ...tab,
      chats: tab.chats.map((c) => (!c?.id ? { ...c, id: uuid() } : c)),
      files: [],
      id: aiConversationId,
      isCreated: true,
      task: tab?.task ? tab.task : "Basic Tasks",
      projectName,
    };
    setTabs((prev) => [...prev, newTab]);
    pushTabToStack(aiConversationId);
  };

  return (
    <div className="relative">
      <div className="group/card w-[260px] md:w-[240px]">
        <Button
          variant="ghost"
          className="w-full h-full py-2 text-start flex justify-start items-center gap-2"
        >
          {open ? (
            <div
              className="flex items-center gap-1"
              onClick={() => {
                setOpen((prev) => !prev);
              }}
            >
              <ChevronDown />
              <FolderOpen />
            </div>
          ) : (
            <div
              className="flex items-center gap-1"
              onClick={() => {
                setOpen((prev) => !prev);
              }}
            >
              <ChevronRight />
              <FolderClosed />
            </div>
          )}

          <div className="flex flex-1 w-[140px] flex-col gap-0.5">
            <span
              onClick={() => {
                setOpen((prev) => !prev);
              }}
              className="text-xs truncate flex-1 inline-block"
            >
              {project.name}
            </span>
            <span className="text-xs flex items-center gap-1 text-muted-foreground">
              {project?.allChats?.filter((p) => p.isCreator)?.length} Chats
              {!project.isCreator && <ForwardIcon className="size-[10px]" />}
            </span>
          </div>

          <ProjectActions projectId={project._id} project={project} />
        </Button>
      </div>

      <div
        className={`
        transition-all duration-100 ease-in-out overflow-hidden ml-2
        ${open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
      `}
      >
        {project?.allChats
          ?.filter((p) => p.isPinned && p.isCreator)
          ?.map((tab) => (
            <div key={tab._id} className="group/card w-[250px] md:w-[230px]">
              <Button
                variant={selectedTabId === tab._id ? "active" : "ghost"}
                onClick={() => handleOnClick(tab)}
                className="w-full text-start flex items-center gap-2"
              >
                <Pin className="size-3" />
                <span className="text-xs truncate flex-1 inline-block">
                  {tab.name}
                </span>

                <ChatActions tab={tab} isProject={true} />
              </Button>
            </div>
          ))}

        {project?.allChats
          ?.filter((p) => !p.isPinned && p.isCreator)
          ?.map((tab) => (
            <div key={tab._id} className="group/card w-[250px] md:w-[230px]">
              <Button
                variant={selectedTabId === tab._id ? "active" : "ghost"}
                onClick={() => handleOnClick(tab, project.name)}
                className="w-full text-start flex items-center gap-2"
              >
                <span className="text-xs truncate flex-1 inline-block">
                  {tab.name}
                </span>

                <ChatActions tab={tab} />
              </Button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ProjectButtons;
