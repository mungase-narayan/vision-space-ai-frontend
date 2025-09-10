import { toast } from "sonner";
import { Loader, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { useAuth } from "@/hooks";
import { setOpenAIKey } from "@/store/slices/auth-slice";
import { useValidateKey } from "@/hooks";

function SettingButton() {
  const dispatch = useDispatch();
  const { openAIKey } = useAuth();

  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(openAIKey);

  const { mutate, isPending } = useValidateKey({
    callAfterSuccess: () => {
      dispatch(setOpenAIKey(key));
      setOpen(false);
    },
  });

  const handleOnClick = () => {
    if (!key) {
      toast.error("Please enter your OpenRouter key");
      return;
    }

    const data = { key, company: "openrouter" };
    mutate({ data });
  };

  useEffect(() => {
    setKey(openAIKey);
  }, [openAIKey]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="size-7"
        >
          <Settings size={10} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-active mb-2">
            Add OpenRouter Key
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center flex-col w-full gap-2">
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter OpenRouter key"
          />
          <div className="flex items-center w-full justify-end gap-2 mt-4">
            <Button
              variant="destructive"
              onClick={() => {
                dispatch(setOpenAIKey(undefined));
                setKey("");
                setOpen(false);
                toast.success("OpenRouter key removed successfully");
              }}
            >
              Remove
            </Button>
            <Button onClick={handleOnClick}>
              {isPending && <Loader className="animate-spin" size={15} />}
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SettingButton;
