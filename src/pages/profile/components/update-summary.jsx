import { useEffect, useState } from "react";
import { Loader, Pencil } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import useUpdateSummary from "../hooks/use-update-summary";

const UpdateSummary = ({ summary, name, refetch, title }) => {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const { isPending, mutate } = useUpdateSummary({
    fn: () => {
      refetch();
      setOpen(false);
    },
  });

  useEffect(() => {
    setValue(summary[name]);
  }, [summary]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="text-green-500 hover:text-green-500/80 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <Pencil size={15} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:min-w-[300px] md:min-w-[600px] lg:min-w-[800px]">
        <DialogTitle>Update {title}</DialogTitle>
        <Textarea
          className="h-[400px]"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={() => {
              const data = {
                summary: {
                  ...summary,
                  [name]: value,
                },
              };
              mutate({ data });
            }}
          >
            {isPending && <Loader className="animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSummary;
