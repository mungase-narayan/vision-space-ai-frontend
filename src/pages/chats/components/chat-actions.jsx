import { PinOff } from "lucide-react";
import { EllipsisVertical, Loader2, Pin, Trash2 } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useChatsProvider } from "../providers/chats-provider";
import { usePinUnpinChat } from "../hooks";
import ShareChat from "./share-chat";

function ChatActions({ tab, isProject = false }) {
  const { deleteTab, isDeletingChat, refetchChats, refetchProjects } =
    useChatsProvider();
  const { isPending, mutate } = usePinUnpinChat({
    fn: () => {
      refetchChats();
      refetchProjects();
    },
  });

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
          {tab.isCreator ? (
            <>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTab(tab._id);
                }}
                className="cursor-pointer p-1 hover:bg-red-100/30 hover:text-red-500 transition-all rounded-lg flex items-center px-3 py-1 gap-2"
              >
                {isDeletingChat ? (
                  <Loader2 size={15} className="animate-spin flex-shrink-0" />
                ) : (
                  <Trash2 size={15} />
                )}
                <span className="text-sm">Delete</span>
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  mutate({
                    data: {
                      aiConversationId: tab._id,
                      isPinned: !tab.isPinned,
                    },
                  });
                }}
                className="cursor-pointer p-1 hover:bg-red-100/30 hover:text-red-500 transition-all rounded-lg flex items-center px-3 py-1 gap-2"
              >
                {isPending ? (
                  <Loader2 size={15} className="animate-spin flex-shrink-0" />
                ) : tab?.isPinned ? (
                  <PinOff size={15} />
                ) : (
                  <Pin size={15} />
                )}
                <span className="text-sm">
                  {tab?.isPinned ? "Unpin" : "Pin"}
                </span>
              </div>

              {!isProject && <ShareChat tab={tab} title="Manage" />}
            </>
          ) : (
            !isProject && <ShareChat tab={tab} title="View" />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ChatActions;
