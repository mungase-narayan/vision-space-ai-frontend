import { QUERY } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks";

import apis from "../apis";

const useGetStats = () => {
  const { authToken } = useAuth();
  const { isLoading, data } = useQuery({
    queryKey: [QUERY.AI_CONVERSATION.GET_STATS],
    queryFn: () => apis.getStats({ authToken }),
    retry: false,
  });
  return { isLoading, data: data?.data?.data };
};

export default useGetStats;
