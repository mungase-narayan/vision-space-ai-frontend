import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EllipsisVertical, X, Copy, Edit, Delete } from "lucide-react";

function TabActions({ setOpen, copyTab, deleteTab, tab }) {
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
              deleteTab(tab.id);
            }}
            className="cursor-pointer p-1 hover:bg-red-100/30 hover:text-red-500 transition-all rounded-lg flex items-center px-3 py-1 gap-2"
          >
            <Delete size={17} />
            <span className="text-sm">Delete</span>
          </div>
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
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default TabActions;
