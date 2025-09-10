import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks";

import apis from "../apis";
import { QUERY } from "@/constants";

const useGetSummary = () => {
  const { authToken } = useAuth();
  const {
    isPending,
    data: response,
    refetch,
  } = useQuery({
    queryKey: [QUERY.SUMMARY.GET_SUMMARY],
    queryFn: () => apis.getSummary({ authToken }),
    throwOnError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });
  return { isPending, data: response?.data?.data, refetch };
};

export default useGetSummary;
