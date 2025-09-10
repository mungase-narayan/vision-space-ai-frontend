import { Loader } from "@/components";

import useGetModels from "./hooks/use-get-models";
import Create from "./components/create";
import CategoryTable from "./components/category-table";

const AIModel = () => {
  const { models, refetch, isLoading } = useGetModels();

  if (isLoading) return <Loader />;

  return (
    <div className="relative">
      <div className="p-3 rounded-lg shadow-sm border flex items-center justify-between">
        <h1 className="font-medium">Categories</h1>
        <Create refetch={refetch} />
      </div>
      <CategoryTable data={models} refetch={refetch} />
    </div>
  );
};

export default AIModel;
