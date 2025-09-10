import { round } from "lodash";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Loader } from "@/components";
import useImageModelList from "../../hooks/use-image-model-list";

function ImageModel({ models: _selectedModels, onSave, isLoading, setOpen }) {
  const { models, loading } = useImageModelList();
  const [selectedModels, setSelectedModels] = useState([]);

  useEffect(() => {
    setSelectedModels(_selectedModels);
  }, [_selectedModels]);

  const isModelSelected = (model) =>
    selectedModels.some((m) => m.value === model.value);

  const handleAddModel = (model) => {
    if (!isModelSelected(model)) {
      setSelectedModels([model, ...selectedModels]);
    }
  };

  const handleRemoveModel = (model) => {
    setSelectedModels(selectedModels.filter((m) => m.value !== model.value));
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredModels, setFilteredModels] = useState([]);

  useEffect(() => {
    const filtered = models.filter((model) =>
      model.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredModels(filtered);
  }, [searchTerm, models]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader />
      </div>
    );

  return (
    <div className="mt-1">
      <div className="flex flex-row items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="min-w-sm"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              <X />
            </Button>
          )}
        </div>

        <Button
          onClick={() => {
            onSave(selectedModels);
            setSelectedModels([]);
            setSearchTerm("");
            setOpen(false);
          }}
          className="ml-auto"
          size="sm"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Save
        </Button>
      </div>

      <table className="min-w-full text-sm border">
        <thead>
          <tr className="bg-muted">
            <th className="px-3 py-2 text-left font-medium min-w-[300px]">
              Name
            </th>
            <th className="px-3 py-2 text-left font-medium min-w-[200px]">
              Image Pricing
            </th>
            <th className="px-3 py-2 text-left font-medium min-w-[200px]">
              Input Modalities
            </th>
            <th className="px-3 py-2 text-left font-medium">Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredModels.map((model) => (
            <tr
              key={model.value}
              className={cn(
                "border-t",
                isModelSelected(model) && "bg-muted/50"
              )}
            >
              <td className="px-3 py-2 font-medium min-w-[300px]">
                {model.label}
              </td>
              <td className="px-3 py-2">
                ${round(model?.pricing?.image, 3)}/Image
              </td>
              <td className="px-3 py-2">
                {model?.inputModalities?.join(", ")}
              </td>
              <td className="px-3 py-2">
                {isModelSelected(model) ? (
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveModel(model)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddModel(model)}
                  >
                    <Plus />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ImageModel;
