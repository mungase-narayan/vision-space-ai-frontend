import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useChatContext } from "../provider";
import { MDX } from "@/components";

const EditResponse = ({ chat }) => {
  const { tabId, updateChat, tab } = useChatContext();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setValue(chat?.content);
  }, [chat]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Pencil size={15} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:min-w-[300px] md:min-w-[600px] lg:min-w-[800px]">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Tabs defaultValue="account">
            <TabsList>
              <TabsTrigger value="Edit" className="cursor-pointer">
                Edit
              </TabsTrigger>
              <TabsTrigger value="Preview" className="cursor-pointer">
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="Edit">
              <Textarea
                value={value}
                className="h-[500px] max-w-[250px] sm:min-w-[260px] md:min-w-[560px] lg:min-w-[760px]"
                onChange={(e) => setValue(e.target.value)}
              />
            </TabsContent>
            <TabsContent value="Preview">
              <div className="h-[500px] max-w-[250px] overflow-y-auto w-full sm:min-w-[260px] md:min-w-[560px] lg:min-w-[760px]">
                <MDX content={value} model={tab.model} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={() => {
              updateChat(tabId, chat.id, value);
              setOpen(false);
              toast.success("Response updated successfully.");
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditResponse;
