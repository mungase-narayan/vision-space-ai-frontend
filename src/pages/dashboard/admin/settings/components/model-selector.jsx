import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import useModelList from "../../ai-model/hooks/use-get-model-list";
import useUpdateConfig from "../../ai-model/hooks/use-udate-config";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

function SelectModel({ refetchConfig }) {
  const [open, setOpen] = useState(false);
  const { models } = useModelList();
  const { mutate, isPending } = useUpdateConfig({
    fn: () => {
      refetchConfig();
      setOpen(false);
    },
  });

  const handleSelect = (value) => {
    mutate({
      data: {
        defaultModel: value,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          {isPending && <Loader2 className="animate-spin" />}
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 max-w-3xl">
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
      </DialogContent>
    </Dialog>
  );
}
export default SelectModel;
