import { toast } from "sonner";

import { useAuth } from "@/hooks";
import { useMutation } from "@tanstack/react-query";

import apis from "../apis";

const useUpdateProject = ({ fn }) => {
  const { authToken } = useAuth();

  const { isPending, mutate } = useMutation({
    mutationFn: ({ data }) => apis.updateProject({ authToken, data }),
    onSuccess: () => {
      toast.success("Project updated successfully");
      fn?.();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return { isPending, mutate };
};

export default useUpdateProject;
