import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { useQuery } from "@tanstack/react-query";

import apis from "../apis";
import useFilters from "./use-filters";

const useGetUsers = () => {
  const { authToken } = useAuth();
  const { email, isVerified, page, limit } = useFilters();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["users", { email, isVerified, page, limit }],
    queryFn: () =>
      apis.getUsers({
        authToken,
        params: {
          email,
          isVerified:
            isVerified === "all" ? undefined : isVerified === "verified",
          page,
          limit,
        },
      }),
    throwOnError: (error) => toast.error(error?.response?.data?.message),
    retry: false,
  });

  return {
    isLoading,
    users: data?.data?.data?.docs || [],
    totalPages: data?.data?.data?.totalPages,
    total: data?.data?.data?.totalDocs,
    hasNextPage: data?.data?.data?.hasNextPage,
    hasPrevPage: data?.data?.data?.hasPrevPage,
    refetch,
  };
};

export default useGetUsers;
