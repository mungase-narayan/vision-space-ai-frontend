import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useState } from "react";
import AllModel from "./all-model";
import ImageModel from "./image-model";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function AddModel({ models: _selectedModels, onSave, isLoading }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-full hover:text-blue-500 cursor-pointer"
        >
          <Plus size={15} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[80%] overflow-auto min-w-[90%]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Add Models</DialogTitle>
            <DialogDescription>Add models to your ai model.</DialogDescription>
          </div>
        </DialogHeader>

        <Tabs defaultValue="text">
          <TabsList>
            <TabsTrigger value="text">Text Models</TabsTrigger>
            <TabsTrigger value="image">Image Models</TabsTrigger>
          </TabsList>
          <TabsContent value="text">
            <AllModel
              onSave={onSave}
              isLoading={isLoading}
              models={_selectedModels}
              setOpen={setOpen}
            />
          </TabsContent>
          <TabsContent value="image">
            <ImageModel
              onSave={onSave}
              isLoading={isLoading}
              models={_selectedModels}
              setOpen={setOpen}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default AddModel;
