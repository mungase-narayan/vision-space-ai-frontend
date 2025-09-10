import { useNavigate, useParams } from "react-router-dom";
import { EllipsisVertical, Loader, Trash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import useDeleteConversation from "../hooks/use-delete-conversation";
import { useConversationLaout } from "../provider/conversation-layout-provider";
import { generateObjectId } from "@/lib/utils";

function ChatActions({ aiConversationId }) {
  const { aiConversationId: activeTab } = useParams();
  const navigate = useNavigate();
  const { refetchAIConversations, setTabs, tabs } = useConversationLaout();

  const { deleteConversation, isPending } = useDeleteConversation({
    callAfterSuccess: () => {
      setTabs((prev) =>
        prev.filter((p) => p.aiConversationId !== aiConversationId)
      );
      refetchAIConversations();
      if (activeTab === aiConversationId) {
        if (tabs.length > 1) {
          const newId = tabs.find(
            (t) => t.aiConversationId !== aiConversationId
          )?.aiConversationId;
          navigate(`/chat/${newId}`);
        } else {
          const id = generateObjectId();
          navigate(`/chat/${id}?forCreating=true`);
        }
      }
    },
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="cursor-pointer hover:bg-muted-foreground p-1 rounded-full">
          <EllipsisVertical size={13} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40">
        <div className="items-center gap-0.5">
          <div
            onClick={(e) => {
              e.stopPropagation();
              deleteConversation({ data: { aiConversationId } });
            }}
            className="cursor-pointer p-1 hover:bg-red-100/30 hover:text-red-500 transition-all rounded-lg flex items-center px-3 py-1 gap-2"
          >
            {isPending ? (
              <Loader size={15} className="animate-spin" />
            ) : (
              <Trash size={15} />
            )}
            <span className="text-sm">Delete</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ChatActions;
