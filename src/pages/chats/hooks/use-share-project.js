import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { toast } from "sonner";

import apis from "../apis";

const useShareProject = ({ fn }) => {
  const { authToken } = useAuth();
  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.shareProject({ data, authToken }),
    onSuccess: ({ data }) => {
      toast.success(data?.message);
      fn();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return { mutate, isPending };
};

export default useShareProject;
