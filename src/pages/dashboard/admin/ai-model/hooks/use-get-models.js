import { QUERY } from "@/constants";
import { useQuery } from "@tanstack/react-query";

import apis from "../apis";
import { useAuth } from "@/hooks";

const useGetModels = () => {
  const { authToken } = useAuth();

  const { isLoading, refetch, data } = useQuery({
    queryKey: [QUERY.AI_MODEL.GET_MODELS],
    queryFn: () => apis.getModels({ authToken }),
    staleTime: 1000 * 60 * 60 * 24,
    retry: false,
  });
  return { isLoading, refetch, models: data?.data?.data ?? [] };
};

export default useGetModels;
