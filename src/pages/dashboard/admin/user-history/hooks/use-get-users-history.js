import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { useQuery } from "@tanstack/react-query";

import apis from "../apis";
import useFilters from "./use-filters";

const useGetUsersHistory = () => {
  const { authToken } = useAuth();
  const { page, limit } = useFilters();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["users-history", { page, limit }],
    queryFn: () =>
      apis.getUserHistory({
        authToken,
        params: {
          page,
          limit,
        },
      }),
    throwOnError: (error) => toast.error(error?.response?.data?.message),
    retry: false,
  });

  return {
    isLoading,
    users: data?.data?.data?.result || [],
    totalPages: data?.data?.data?.totalPages,
    total: data?.data?.data?.total,
    hasNextPage: data?.data?.data?.hasNextPage,
    hasPrevPage: data?.data?.data?.hasPrevPage,
    refetch,
  };
};

export default useGetUsersHistory;
