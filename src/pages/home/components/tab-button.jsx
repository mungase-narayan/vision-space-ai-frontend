import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

import TabNameModal from "./tab-name-modal";
import TabActions from "./tab-actions";
import Hint from "@/components/ui/hint";

const TabButton = ({
  tab,
  activeTab,
  setActiveTab,
  deleteTab,
  updateTabs,
  copyTab,
}) => {
  const tabRefs = useRef({});
  const [open, setOpen] = useState(false);

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
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-1">
      <TabNameModal
        open={open}
        name={tab.name}
        setOpen={setOpen}
        updateTabName={handleUpdateTabName}
      />
      <Hint label={tab.name}>
        <div
          ref={(el) => (tabRefs.current[tab.id] = el)}
          className={cn(
            "group h-[25px] hover:bg-neutral-600 max-w-[120px] min-w-[120px] sm:max-w-[180px] sm:min-w-[180px] cursor-pointer rounded-[3px] hover:text-white flex items-center px-3 justify-between transition-all",
            activeTab === tab.id && "bg-neutral-600 text-white"
          )}
          onClick={() => setActiveTab(tab.id)}
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
