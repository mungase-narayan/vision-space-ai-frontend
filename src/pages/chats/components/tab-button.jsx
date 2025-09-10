import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import Hint from "@/components/ui/hint";

import TabActions from "./tab-actions";
import { useChatsProvider } from "../providers/chats-provider";
import UpdateTabName from "./update-tab-name";
import { useUpdateChat } from "../hooks";

const TabButton = ({ tab }) => {
  const { selectedTabId, updateTab, pushTabToStack } = useChatsProvider();
  const { updateChat, isPending } = useUpdateChat({ fn: () => {} });

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
    <div className="flex items-center gap-1">
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
          "group h-[25px] hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/80 max-w-[120px] min-w-[120px] sm:max-w-[180px] sm:min-w-[180px] cursor-pointer rounded-[3px] flex items-center px-3 justify-between transition-all",
          selectedTabId === tab.id &&
            "bg-accent hover:bg-accent dark:bg-accent/80 dark:hover:bg-accent/80"
        )}
        onClick={() => pushTabToStack(tab.id)}
      >
        <Hint label={tab.name}>
          <span className="truncate text-sm">{tab.name}</span>
        </Hint>
        <TabActions setOpen={setOpen} tab={tab} />
      </div>
      <div className="h-5 w-[1px] bg-muted-foreground" />
    </div>
  );
};

export default TabButton;
