import { EllipsisVertical, X, Copy, Edit, Delete, XSquare } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useChatsProvider } from "../providers/chats-provider";

function TabActions({ setOpen, tab }) {
  const { closeTab, copyTab, closeAllTabs } = useChatsProvider();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          onClick={(e) => e.stopPropagation()}
          className="cursor-pointer hover:bg-muted-foreground p-1 rounded-full"
        >
          <EllipsisVertical size={13} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2">
        <div className="items-center gap-0.5">
          <div
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
            className="cursor-pointer p-1 hover:bg-red-100/30 hover:text-red-500 transition-all rounded-lg flex items-center px-3 py-1 gap-2"
          >
            <X size={15} />
            <span className="text-sm">Close</span>
          </div>

          {tab.isCreated && (
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
                  copyTab(tab.id);
                }}
                className="cursor-pointer p-1 hover:bg-muted transition-all rounded-lg flex items-center px-3 py-1 gap-2"
              >
                <Copy size={15} />
                <span className="text-sm">Duplicate</span>
              </div>
            </>
          )}

          <div
            onClick={(e) => {
              e.stopPropagation();
              closeAllTabs();
            }}
            className="cursor-pointer p-1 hover:bg-muted transition-all rounded-lg flex items-center px-3 py-1 gap-2"
          >
            <XSquare size={15} />
            <span className="text-sm">Close All</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default TabActions;
