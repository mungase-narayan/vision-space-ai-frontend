import { EllipsisVertical, Loader, Trash } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function ChatActions({ handleDeleteTab, isPending }) {
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
              handleDeleteTab();
            }}
            className="cursor-pointer p-1 hover:bg-red-100/30 hover:text-red-500 transition-all rounded-lg flex items-center px-3 py-1 gap-2"
          >
            {isPending ? (
              <Loader className="animate-spin" size={15} />
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
