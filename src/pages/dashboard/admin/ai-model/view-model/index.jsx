import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Loader } from "@/components";
import ConfirmDeleteButton from "@/components/shared/delete-confirm-button";

import Update from "./components/update";
import useUpdateModel from "../hooks/use-update-model";
import useGetModel from "../hooks/use-get-model";
import AddModel from "./components/add-model";
import { Badge } from "@/components/ui/badge";

const ViewModel = () => {
  const navigate = useNavigate();
  const { aiModelId } = useParams();
  const { model, isLoading, refetch } = useGetModel({ params: { aiModelId } });
  const { mutate, isPending } = useUpdateModel({ fn: () => refetch() });
  const [selectedModels, setSelectedModels] = useState([]);

  useEffect(() => {
    if (model?.models?.length > 0) {
      setSelectedModels(model.models);
    }
  }, [model]);

  if (isLoading) return <Loader />;

  return (
    <div className="relative">
      <div className="p-3 rounded-lg bg-muted gap-2 flex items-center justify-between shadow-sm border">
        <div className="flex items-center gap-2">
          <button
            className="cursor-pointer text-active"
            onClick={() => navigate("/dashboard/setting")}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-medium">{model.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Update
            modelName={model.name}
            aiModelId={aiModelId}
            refetch={refetch}
            selectedModels={selectedModels}
            model={model?.defaultModel}
          />
          <AddModel
            isLoading={isPending}
            selectedModels={selectedModels}
            setSelectedModels={setSelectedModels}
            onSave={() => {
              mutate({ data: { aiModelId, models: selectedModels } });
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <h1 className="font-medium">Default Model</h1>
          <Badge>{model?.defaultModel}</Badge>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 mt-3 xl:grid-cols-3 gap-3">
        {selectedModels.map((m) => (
          <div
            key={m.value}
            className="p-3 border flex flex-col shadow-sm rounded-lg"
          >
            <h1 className="font-medium">{m.label}</h1>
            <table className="w-full text-xs mt-2 border">
              <thead>
                <tr className="bg-muted">
                  <th className="px-2 py-1 text-left font-medium">Prompt</th>
                  <th className="px-2 py-1 text-left font-medium">
                    Completion
                  </th>
                  <th className="px-2 py-1 text-left font-medium">Image</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-2 py-1">{m.pricing.prompt}$</td>
                  <td className="px-2 py-1">{m.pricing.completion}$</td>
                  <td className="px-2 py-1">{m.pricing.image}$</td>
                </tr>
              </tbody>
            </table>
            <div className="flex items-center justify-end mt-2">
              <ConfirmDeleteButton
                isLoading={isPending}
                itemName="Model"
                onDelete={() => {
                  const models = model.models.filter(
                    (p) => p.value !== m.value
                  );
                  mutate({ data: { aiModelId, models } });
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewModel;
