import { useApp } from "@/providers/app-provider";
import { AIModel } from "@/pages";

import Threshold from "./components/threshold";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

import useUpdateConfig from "../ai-model/hooks/use-udate-config";

const Setting = () => {
  const { refetchConfig, xThreshold, isDisplayAllModels } = useApp();
  const { mutate, isPending } = useUpdateConfig({
    fn: () => {
      refetchConfig();
    },
  });

  return (
    <div className="relative">
      <div className="border shadow-sm rounded-lg mb-3 p-3 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <h1 className="font-medium">Display All Model Tab </h1>
            <span>
              {" "}
              {isPending && <Loader2 className="animate-spin" size={15} />}
            </span>
          </div>
          <p className="text-sm">{isDisplayAllModels ? "YES" : "NO"}</p>
        </div>
        <Switch
          className="cursor-pointer"
          checked={isDisplayAllModels}
          onCheckedChange={(checked) => {
            mutate({ data: { isDisplayAllModels: checked } });
          }}
        />
      </div>

      <div className="border shadow-sm rounded-lg mb-3 p-3 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium">Threshold</h1>
          <p className="text-sm">{xThreshold}</p>
        </div>
        <Threshold
          refetchConfig={refetchConfig}
          defaultXThreshold={xThreshold}
        />
      </div>

      <AIModel />
    </div>
  );
};

export default Setting;
