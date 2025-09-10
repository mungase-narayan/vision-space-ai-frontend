import { QUERY } from "@/constants";
import { useAuth } from "@/hooks";
import { useQuery } from "@tanstack/react-query";

import apis from "../apis";

const useGetProjects = () => {
  const { authToken } = useAuth();

  const {
    isLoading,
    refetch,
    data: response,
  } = useQuery({
    queryKey: [QUERY.PROJECT.GET_PROJECTS],
    queryFn: () => apis.getAllProjects({ authToken }),
    retry: false,
    staleTime: 1000 * 60 * 60 * 24,
  });

  return {
    isLoading,
    refetch,
    projects: response?.data?.data || [],
  };
};

export default useGetProjects;
