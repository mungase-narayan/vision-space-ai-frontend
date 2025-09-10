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
import { useConversation } from "../provider/conversation-provider";
import useUpdateConversation from "../hooks/use-update-conversation";
import useGetModels from "@/pages/dashboard/admin/ai-model/hooks/use-get-models";
import { Loader2 } from "lucide-react";

export default function SelectModel() {
  const { model, setModel } = useConversation();
  const [open, setOpen] = useState(false);
  const { models, isLoading } = useGetModels();
  const { aiConversationId } = useConversation();
  const { updateConversation } = useUpdateConversation({
    callAfterSuccess: () => {},
  });

  const handleSelect = (value) => {
    setModel(value);
    setOpen(false);
    updateConversation({ data: { model: value, aiConversationId } });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="text-xs px-2 sm:px-3 sm:text-sm w-full sm:w-[300px] justify-between truncate"
        >
          {isLoading && <Loader2 className="animate-spin" />}
          {model || "Select model"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[600px]">
        <div className="flex h-[400px]">
          <div className="w-1/3 border-r">
            <h3 className="text-lg font-bold p-2">Categories</h3>
            <ul className="space-y-2 h-full overflow-y-auto">
              {models?.map((category) => (
                <li
                  key={category._id}
                  className={`cursor-pointer p-2 hover:bg-gray-200 text-sm ${
                    selectedCategory === category._id ? "bg-gray-300" : ""
                  }`}
                  onClick={() => setSelectedCategory(category._id)}
                >
                  {category.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Models List */}
          <div className="w-2/3 p-2">
            <h3 className="text-lg font-bold">Models</h3>
            <Command className="h-[350px] overflow-y-auto">
              <CommandInput placeholder="Search models..." autoFocus />
              <CommandList>
                <CommandEmpty>No models found.</CommandEmpty>
                {selectedCategory &&
                  models
                    .find((cat) => cat._id === selectedCategory)
                    ?.models.map((model) => (
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
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
