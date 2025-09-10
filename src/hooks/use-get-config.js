import { QUERY } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import apis from "@/pages/dashboard/admin/ai-model/apis";

const useGetConfig = () => {
  const { isLoading, data, refetch } = useQuery({
    queryKey: [QUERY.CONFIG.GET_CONFIG],
    queryFn: () => apis.getConfig(),
    staleTime: 1000 * 60 * 60 * 60 * 24,
  });
  return {
    isLoading,
    config: data?.data?.data,
    refetch,
  };
};

export default useGetConfig;
