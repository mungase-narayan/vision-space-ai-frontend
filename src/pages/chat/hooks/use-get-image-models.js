import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { QUERY } from "@/constants";
import apis from "../apis";

const useGetImageModels = () => {
  const { isLoading, data } = useQuery({
    queryKey: [QUERY.ML_QUERY.GET_IMAGE_MODELS],
    queryFn: () => apis.getImageModelList(),
    throwOnError: () => {
      toast.error("Error fetching model list");
    },
    retry: false,
    staleTime: 1000 * 60 * 60 * 24,
  });

  return {
    isLoading,
    imageModels: Object.entries(data?.data?.response || {}).map(
      ([key, value]) => ({
        label: value.name,
        value: key,
      })
    ),
  };
};

export default useGetImageModels;
