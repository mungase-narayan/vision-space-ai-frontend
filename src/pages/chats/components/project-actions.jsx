import { Plus } from "lucide-react";
import { EllipsisVertical } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useChatsProvider } from "../providers/chats-provider";
import DeleteProject from "./delete-project";
import ShareProject from "./share-project";

function ProjectActions({ projectId, project }) {
  const { addTab } = useChatsProvider();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          onClick={(e) => e.stopPropagation()}
          className="hover:bg-muted-foreground p-1 rounded-full md:opacity-0 group-hover/card:opacity-100 cursor-pointer"
        >
          <EllipsisVertical size={13} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2">
        <div className="items-center gap-0.5">
          <div
            onClick={(e) => {
              e.stopPropagation();
              addTab({
                projectId,
                projectFiles: project.files,
                projectPrompt: project.prompt,
                projectName: project.name,
              });
            }}
            className="cursor-pointer p-1 hover:bg-muted transition-all rounded-lg flex items-center px-3 py-1 gap-2"
          >
            <Plus size={13} />
            <span className="text-sm">New Chat</span>
          </div>
          <ShareProject project={project} />
          {project.isCreator && (
            <>
              <DeleteProject projectId={projectId} />
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ProjectActions;
