import { cn } from "@/lib/utils";
import Hint from "@/components/ui/hint";
import { useEffect, useRef, useState } from "react";

import TabNameModal from "./tab-name-modal";
import TabActions from "./tab-actions";
import { useUpdateConversation } from "../hooks";

const TabButton = ({
  tab,
  activeTab,
  setActiveTab,
  deleteTab,
  updateTabs,
  copyTab,
  refetchConversations,
  pushTab,
  removeTab,
}) => {
  const tabRefs = useRef({});
  const [open, setOpen] = useState(false);
  const { updateConversation, isPending } = useUpdateConversation({
    fn: () => {
      refetchConversations();
      setOpen(false);
    },
  });

  useEffect(() => {
    if (activeTab && tabRefs.current[activeTab]) {
      tabRefs.current[activeTab].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeTab]);

  const handleUpdateTabName = (name) => {
    updateTabs({ name }, tab.id);
    updateConversation({ data: { aiConversationId: tab.id, name } });
  };

  return (
    <div className="flex items-center gap-1">
      <TabNameModal
        open={open}
        name={tab.name}
        setOpen={setOpen}
        updateTabName={handleUpdateTabName}
        isPending={isPending}
      />
      <Hint label={tab.name}>
        <div
          ref={(el) => (tabRefs.current[tab.id] = el)}
          className={cn(
            "group h-[25px] hover:bg-gray-300 max-w-[120px] min-w-[120px] sm:max-w-[180px] sm:min-w-[180px] cursor-pointer rounded-[3px] flex items-center px-3 justify-between transition-all",
            activeTab === tab.id &&
              "bg-neutral-600 text-white hover:bg-neutral-600 hover:text-white"
          )}
          onClick={() => {
            pushTab(tab.id);
            setActiveTab(tab.id);
          }}
        >
          <span className="truncate text-sm">{tab.name}</span>
          <TabActions
            setOpen={setOpen}
            copyTab={copyTab}
            deleteTab={deleteTab}
            tab={tab}
          />
        </div>
      </Hint>
      <div className="h-5 w-[1px] bg-muted-foreground" />
    </div>
  );
};

export default TabButton;
