import { useMutation } from "@tanstack/react-query";
import apis from "../apis";
import { useAuth } from "@/hooks";
import { toast } from "sonner";

const useCreateProject = ({ fn }) => {
  const { authToken } = useAuth();

  const { isPending, mutate } = useMutation({
    mutationFn: ({ data }) => apis.createProject({ data, authToken }),
    onSuccess: () => {
      toast.success("Project created successfully.");
      fn?.();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return { isPending, mutate };
};

export default useCreateProject;
