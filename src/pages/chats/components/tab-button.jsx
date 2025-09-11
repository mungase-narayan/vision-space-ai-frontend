import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import Hint from "@/components/ui/hint";

import TabActions from "./tab-actions";
import { useChatsProvider } from "../providers/chats-provider";
import UpdateTabName from "./update-tab-name";
import { useUpdateChat } from "../hooks";

const TabButton = ({ tab }) => {
  const { selectedTabId, updateTab, pushTabToStack } = useChatsProvider();
  const { updateChat, isPending } = useUpdateChat({ fn: () => { } });

  const tabRefs = useRef({});

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (selectedTabId && tabRefs.current[selectedTabId]) {
      tabRefs.current[selectedTabId].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedTabId]);

  const handleUpdateTabName = (name) => {
    updateTab({ name }, tab.id);
    updateChat({
      data: { aiConversationId: tab.id, name },
    });
  };

  return (
    <div className="flex items-center">
      <UpdateTabName
        open={open}
        name={tab.name}
        setOpen={setOpen}
        updateTabName={handleUpdateTabName}
        isPending={isPending}
      />

      <div
        ref={(el) => (tabRefs.current[tab.id] = el)}
        className={cn(
          "group relative h-7 hover:bg-muted/50 hover:text-foreground max-w-[140px] min-w-[140px] sm:max-w-[200px] sm:min-w-[200px] cursor-pointer rounded-md flex items-center px-3 justify-between transition-all duration-200 hover:shadow-sm border border-transparent hover:border-muted-foreground/20",
          selectedTabId === tab.id
            ? "bg-muted/80 border-muted-foreground/30 text-foreground shadow-sm hover:bg-muted/90"
            : "hover:scale-[1.02]"
        )}
        onClick={() => pushTabToStack(tab.id)}
      >
        <Hint label={tab.name}>
          <span className="truncate text-xs font-medium">{tab.name}</span>
        </Hint>
        <TabActions setOpen={setOpen} tab={tab} />
      </div>
    </div>
  );
};

export default TabButton;
