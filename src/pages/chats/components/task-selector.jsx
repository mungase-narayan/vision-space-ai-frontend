import { cn } from "@/lib/utils";

export default function TaskSelector({ selectedTask, onSelectTask, models }) {
  return (
    <div className="flex bg-muted items-center px-1 py-1 gap-2 w-[100%] lg:w-fit rounded-lg overflow-x-auto hide-scrollbar">
      {models.map((model) => (
        <button
          onClick={() =>
            onSelectTask({ task: model.name, model: model.defaultModel })
          }
          key={model.name}
          className={cn(
            "text-xs px-3 py-1.5 cursor-pointer w-fit whitespace-nowrap",
            selectedTask === model.name &&
              "bg-white dark:bg-background rounded-lg"
          )}
        >
          {model.name}
        </button>
      ))}
    </div>
  );
}
