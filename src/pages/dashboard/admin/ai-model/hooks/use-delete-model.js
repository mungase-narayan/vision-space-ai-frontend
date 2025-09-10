import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { useMutation } from "@tanstack/react-query";

import apis from "../apis";

const useDeleteModel = ({ fn }) => {
  const { authToken } = useAuth();
  const { isPending, mutate } = useMutation({
    mutationFn: ({ data }) => apis.delete({ data, authToken }),
    onSuccess: () => {
      toast.success("Model deleted successfully");
      fn();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });
  return { isPending, mutate };
};

export default useDeleteModel;
