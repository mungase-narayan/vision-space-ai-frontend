import { QUERY } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks";

import apis from "../apis";

const useGetProject = ({ projectId }) => {
  const { authToken } = useAuth();

  const { isPending, mutate, data } = useMutation({
    mutationKey: [QUERY.PROJECT.GET_PROJECT, projectId],
    mutationFn: () => apis.getProject({ authToken, params: { projectId } }),
    retry: false,
  });

  return { isPending, mutate, allChats: data?.data?.data?.allChats };
};

export default useGetProject;
