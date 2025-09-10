import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { QUERY } from "@/constants";
import { useQuery } from "@tanstack/react-query";

import apis from "../apis";

const useGetModel = ({ params }) => {
  const { authToken } = useAuth();
  const {
    isLoading,
    refetch,
    data: response,
  } = useQuery({
    queryKey: [QUERY.AI_MODEL.GET_MODEL, params],
    queryFn: () => apis.get({ params, authToken }),
    throwOnError: (error) => toast.error(error?.response?.data?.message),
    retry: false,
  });

  return { isLoading, refetch, model: response?.data?.data };
};

export default useGetModel;
