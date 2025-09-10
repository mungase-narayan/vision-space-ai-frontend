import ModelSelector from "./model-selector";
import TaskSelector from "./task-selector";
import { useChatProvider } from "../providers/chat-provider";
import { useChatsProvider } from "../providers/chats-provider";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

const TabHeader = () => {
  const { tab } = useChatProvider();
  const { updateTab, models } = useChatsProvider();

  const defaultModel = models
    ?.find((m) => m.name === tab.task)
    ?.models?.find((m) => m.value === tab?.model)
    ? tab?.model
    : models.find((m) => m.name === tab.task)?.defaultModel;

  useEffect(() => {
    if (!tab.model) updateTab({ model: defaultModel }, tab.id);
  }, [defaultModel]);

  return (
    <header className="border-b border-border bg-background print:hidden">
      <div className="flex gap-2 flex-row items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <ModelSelector
            selectedModel={defaultModel}
            models={models}
            task={tab.task}
            onSelectModel={(value) => {
              updateTab({ model: value }, tab.id);
            }}
          />
        </div>

        <div className="hidden xl:block">
          <TaskSelector
            selectedTask={tab.task}
            onSelectTask={(value) => {
              updateTab(value, tab.id);
            }}
            models={models}
          />
        </div>

        <div className="block xl:hidden">
          <Select
            value={tab.task}
            onValueChange={(value) => {
              updateTab(
                {
                  task: value,
                  model: models.find((m) => m.name === value)?.defaultModel,
                },
                tab.id
              );
            }}
          >
            <SelectTrigger className="w-[120px] sm:w-fit h-8">
              <SelectValue placeholder="Select Task" />
            </SelectTrigger>
            <SelectContent>
              <h1 className="text-sm font-medium p-2">Select Task</h1>
              {models.map((model) => (
                <SelectItem key={model.name} value={model.name}>
                  <span className="truncate">{model.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
};

export default TabHeader;
