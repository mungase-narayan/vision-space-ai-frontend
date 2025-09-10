import { useNavigate } from "react-router-dom";
import { EllipsisVertical, Copy, Edit, Loader, X } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useConversation } from "../provider/conversation-provider";
import useCreateConversation from "../hooks/use-create-conversation";
import { useConversationLaout } from "../provider/conversation-layout-provider";
import { generateObjectId } from "@/lib/utils";

function TabActions({ setOpen, aiConversationId }) {
  const navigate = useNavigate();
  const {
    aiConversation,
    chats,
    forCreating,
    aiConversationId: currentTabId,
  } = useConversation();
  const { refetchAIConversations, setTabs, tabs } = useConversationLaout();

  const { createConversation, isPending: loading } = useCreateConversation({
    callAfterSuccess: () => {
      refetchAIConversations();
    },
  });

  const hanldeDuplicate = async () => {
    const data = {
      name: `${aiConversation.name} Copy`,
      chats,
      model: aiConversation.model,
      webSearch: aiConversation.webSearch,
    };
    const response = await createConversation({ data });
    const id = response?.data?.data?._id;
    setTabs((prev) => [
      ...prev,
      { aiConversationId: id, name: `${aiConversation.name} Copy` },
    ]);
    navigate(`/chat/${id}`);
  };

  const handleCloseTab = () => {
    setTabs((prev) =>
      prev.filter((p) => p.aiConversationId !== aiConversationId)
    );

    if (aiConversationId === currentTabId) {
      if (tabs.length > 1) {
        const newTab = tabs.find(
          (t) => t.aiConversationId !== aiConversationId
        );
        if (newTab.forCreating)
          navigate(`/chat/${newTab.aiConversationId}?forCreating=true`);
        else navigate(`/chat/${newTab.aiConversationId}`);
      } else {
        const id = generateObjectId();
        navigate(`/chat/${id}?forCreating=true`);
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="cursor-pointer hover:bg-muted-foreground p-1 rounded-full">
          <EllipsisVertical size={13} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-40">
        <div className="items-center gap-0.5">
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleCloseTab();
            }}
            className="cursor-pointer p-1 hover:bg-muted transition-all rounded-lg flex items-center px-3 py-1 gap-2"
          >
            <X size={15} />
            <span className="text-sm">Close Tab</span>
          </div>

          {!forCreating && (
            <>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(true);
                }}
                className="cursor-pointer p-1 hover:bg-muted transition-all rounded-lg flex items-center px-3 py-1 gap-2"
              >
                <Edit size={15} />
                <span className="text-sm">Rename</span>
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  hanldeDuplicate();
                }}
                className="cursor-pointer p-1 hover:bg-muted transition-all rounded-lg flex items-center px-3 py-1 gap-2"
              >
                {loading ? (
                  <Loader size={15} className="animate-spin" />
                ) : (
                  <Copy size={15} />
                )}
                <span className="text-sm">Duplicate</span>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default TabActions;
