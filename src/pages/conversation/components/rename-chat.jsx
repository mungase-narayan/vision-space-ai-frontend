import { toast } from "sonner";
import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import useUpdateConversation from "../hooks/use-update-conversation";
import { useConversation } from "../provider/conversation-provider";
import { useConversationLaout } from "../provider/conversation-layout-provider";
import { Loader } from "lucide-react";

const TabNameModal = ({ open, setOpen, name }) => {
  const [value, setValue] = useState("");
  const { refetchAIConversations, setTabs } = useConversationLaout();
  const { aiConversationId, refetchConversation } = useConversation();
  const { updateConversation, isPending } = useUpdateConversation({
    callAfterSuccess: () => {
      setOpen(false);
      refetchAIConversations();
      refetchConversation();
    },
  });

  useEffect(() => {
    setValue(name);
  }, []);

  const handleonSubmit = () => {
    if (!value) {
      toast.error("Plase eneter tab name");
      return;
    }
    setTabs((prev) =>
      prev.map((p) =>
        p.aiConversationId === aiConversationId ? { ...p, name: value } : p
      )
    );
    updateConversation({ data: { name: value, aiConversationId } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[425px] md:w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-base">Rename</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-start gap-4">
          <Input
            placeholder="Enter tab name"
            value={value}
            className="col-span-3"
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleonSubmit();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleonSubmit}>
            {isPending && <Loader size={15} className="animate-spin" />}
            <span> Save Changes</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TabNameModal;
