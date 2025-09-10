import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import useUpdateModel from "../../hooks/use-update-model";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

function Update({
  modelName: name,
  aiModelId,
  refetch,
  model,
  selectedModels,
}) {
  const [open, setOpen] = useState(false);
  const [modelName, setModelName] = useState();
  const [defaultModelName, setDefaultModelName] = useState();
  const { mutate, isPending } = useUpdateModel({
    fn: () => {
      refetch();
      setOpen(false);
    },
  });

  useEffect(() => {
    setModelName(name);
    setDefaultModelName(model);
  }, [name, model]);

  const onSubmit = () => {
    if (!modelName) {
      toast.error("Please enter name");
      return;
    }
    mutate({
      data: {
        name: modelName,
        aiModelId,
        defaultModel: defaultModelName,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className=" cursor-pointer hover:text-green-500 rounded-full p-2 transition-all">
          <Pencil size={15} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Category Name</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="name-1">Name</Label>
            <Input
              id="name-1"
              name="name"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="name-1">Default Model</Label>
            <Select
              value={defaultModelName}
              onValueChange={(value) => setDefaultModelName(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {(selectedModels ?? []).map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onSubmit}>
            {isPending && <Loader2 className="animate-spin" />}{" "}
            <span>Save changes</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Update;
