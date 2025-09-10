import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import useUpdateConfig from "../../ai-model/hooks/use-udate-config";

function Threshold({ refetchConfig, defaultXThreshold }) {
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useUpdateConfig({
    fn: () => {
      refetchConfig();
      setOpen(false);
    },
  });

  const [xThreshold, setXThreshold] = useState(defaultXThreshold ?? 0);

  useEffect(() => {
    setXThreshold(defaultXThreshold ?? 0);
  }, [defaultXThreshold]);

  const handleXThresholdChange = (e) => {
    setXThreshold(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({
      data: { xThreshold },
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Threshold</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            type="number"
            label="xThreshold"
            value={xThreshold}
            onChange={handleXThresholdChange}
          />
          <Button
            type="submit"
            className="w-full"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending && <Loader2 className="animate-spin" />}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default Threshold;
