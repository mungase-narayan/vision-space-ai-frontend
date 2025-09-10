import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useGetImageModels } from "@/pages/chat/hooks";
import useModelList from "../../hooks/use-get-model-list";

function SelectModel({ handleSelect }) {
  const [open, setOpen] = useState(false);
  const { models } = useModelList();
  const { imageModels } = useGetImageModels();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="text-xs px-2 sm:px-3 sm:text-sm w-full sm:w-[300px] justify-between truncate"
        >
          Add model
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[280px]">
        <Command>
          <CommandInput placeholder="Search models..." autoFocus />
          <CommandList>
            <CommandEmpty>No models found.</CommandEmpty>
            {[...models, ...imageModels].map((model) => (
              <CommandItem
                key={model.value}
                onSelect={() => handleSelect(model)}
                className="text-xs sm:text-sm"
              >
                {model.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default SelectModel;
