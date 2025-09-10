import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks";

import apis from "../apis";

const useDeleteProject = ({ fn }) => {
  const { authToken } = useAuth();

  const { isPending, mutate } = useMutation({
    mutationFn: ({ data }) => apis.deleteProject({ data, authToken }),
    onSuccess: () => {
      toast.success("Project deleted successfully");
      fn?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message);
    },
    retry: false,
  });

  return { isPending, mutate };
};

export default useDeleteProject;
