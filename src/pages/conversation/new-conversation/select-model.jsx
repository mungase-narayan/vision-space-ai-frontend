import { useState } from "react";
import { Button } from "@/components/ui/button";

import useGetModels from "../hooks/use-get-models";

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

export default function SelectModel({ model, setModel }) {
  const [open, setOpen] = useState(false);
  const { models } = useGetModels();

  const handleSelect = (value) => {
    setModel(value);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="text-xs px-2 sm:px-3 sm:text-sm w-full sm:w-[300px] justify-between truncate"
        >
          {model || "Select model"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[280px]">
        <Command>
          <CommandInput placeholder="Search models..." autoFocus />
          <CommandList>
            <CommandEmpty>No models found.</CommandEmpty>
            {models.map((model) => (
              <CommandItem
                key={model.value}
                onSelect={() => handleSelect(model.value)}
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
