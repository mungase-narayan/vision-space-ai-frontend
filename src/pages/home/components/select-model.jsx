import { useState } from "react";
import { Button } from "@/components/ui/button";

import { useChatContext } from "../provider";

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
import useGetModels from "@/pages/dashboard/admin/ai-model/hooks/use-get-models";
import { Loader2 } from "lucide-react";
import useModelList from "@/pages/dashboard/admin/ai-model/hooks/use-get-model-list";

export function SelectModel() {
  const { tab, updateTabs, tabId } = useChatContext();
  const [open, setOpen] = useState(false);
  const { models, isLoading } = useGetModels();
  const { models: modelList, isLoading: modelListLoading } = useModelList();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSelect = (value) => {
    updateTabs({ model: value }, tabId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="text-xs px-2 sm:px-3 sm:text-sm justify-between truncate w-full sm:w-[250px]"
        >
          {tab.model || "Select model"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 h-[350px] sm:h-[400px] w-[300px] sm:w-[600px]">
        <div className="flex flex-col sm:flex-row h-[400px]">
          {isLoading || modelListLoading ? (
            <div className="flex items-center justify-center h-full w-full">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <>
              <div className="w-full sm:w-1/3 border-b sm:max-h-full sm:border-r">
                <h3 className="text-lg font-bold p-2">Categories</h3>
                <ul className="space-y-1 sm:space-y-2 h-[120px] sm:h-full overflow-y-auto">
                  {[
                    ...models,
                    { name: "All Models", _id: "all", models: modelList },
                  ]?.map((category) => (
                    <li
                      key={category._id}
                      className={`cursor-pointer px-2 py-1 sm:p-2 hover:bg-gray-200 text-xs sm:text-sm ${
                        selectedCategory === category._id ? "bg-gray-300" : ""
                      }`}
                      onClick={() => setSelectedCategory(category._id)}
                    >
                      {category.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full sm:w-2/3 p-2">
                <h3 className="text-lg font-bold">Models</h3>
                <Command className="h-[150px] sm:h-[350px] overflow-y-auto">
                  <CommandInput placeholder="Search models..." autoFocus />
                  <CommandList>
                    <CommandEmpty>No models found.</CommandEmpty>
                    {selectedCategory &&
                      [
                        ...models,
                        { name: "All Models", _id: "all", models: modelList },
                      ]
                        .find((cat) => cat._id === selectedCategory)
                        ?.models.map((model) => (
                          <CommandItem
                            key={model.value}
                            onSelect={() => handleSelect(model.value)}
                            className="text-xs sm:text-sm"
                          >
                            <div className="flex flex-col gap-1">
                              <p>{model.label}</p>
                              <table className="text-xs w-auto border border-gray-300">
                                <thead>
                                  <tr>
                                    <th className="p-1 text-start text-muted-foreground font-normal border-r border-b border-gray-300">
                                      Prompt
                                    </th>
                                    <th className="p-1 text-start text-muted-foreground font-normal border-r border-b border-gray-300">
                                      Completion
                                    </th>
                                    <th className="p-1 text-start text-muted-foreground font-normal border-r border-b border-gray-300">
                                      Image
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="text-muted-foreground border-t p-1 border-r border-gray-200">
                                      {model.pricing.prompt}$
                                    </td>
                                    <td className="text-muted-foreground border-t p-1 border-r border-gray-200">
                                      {model.pricing.completion}$
                                    </td>
                                    <td className="text-muted-foreground border-t p-1 border-gray-200">
                                      {model.pricing.image}$
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </CommandItem>
                        ))}
                  </CommandList>
                </Command>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
