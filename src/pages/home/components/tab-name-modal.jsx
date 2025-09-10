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

const TabNameModal = ({ open, setOpen, updateTabName, name }) => {
  const [value, setValue] = useState("");

  const handleonSubmit = () => {
    if (!value) {
      toast.error("Plase eneter tab name");
      return;
    }
    updateTabName(value);
  };

  useEffect(() => {
    setValue(name);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[425px] md:w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-base">Edit Tab Name</DialogTitle>
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
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TabNameModal;
