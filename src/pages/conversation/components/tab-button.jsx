import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import Hint from "@/components/ui/hint";

import RenameChat from "./rename-chat";
import TabActions from "./tab-actions";
import { useConversation } from "../provider/conversation-provider";

const TabButton = ({ tab }) => {
  const tabRefs = useRef({});
  const navigate = useNavigate();
  const { aiConversationId } = useConversation();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (aiConversationId && tabRefs.current[aiConversationId]) {
      tabRefs.current[aiConversationId].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [aiConversationId]);

  return (
    <div className="flex items-center gap-1">
      <RenameChat open={open} name={tab.name} setOpen={setOpen} />
      <Hint label={tab.name}>
        <div
          ref={(el) => (tabRefs.current[tab.aiConversationId] = el)}
          className={cn(
            "group h-[25px] hover:bg-neutral-600 max-w-[120px] min-w-[120px] sm:max-w-[180px] sm:min-w-[180px] cursor-pointer rounded-[3px] hover:text-white flex items-center px-3 justify-between transition-all",
            aiConversationId === tab.aiConversationId &&
              "bg-neutral-600 text-white"
          )}
          onClick={() => {
            if (tab.forCreating) {
              navigate(`/chat/${tab.aiConversationId}?forCreating=true`);
            } else navigate(`/chat/${tab.aiConversationId}`);
          }}
        >
          <span className="truncate text-sm">{tab.name}</span>
          <button onClick={(e) => e.stopPropagation()}>
            <TabActions
              setOpen={setOpen}
              aiConversationId={tab.aiConversationId}
            />
          </button>
        </div>
      </Hint>
      <div className="h-5 w-[1px] bg-muted-foreground" />
    </div>
  );
};

export default TabButton;
