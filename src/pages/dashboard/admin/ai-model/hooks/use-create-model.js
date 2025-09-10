import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { useMutation } from "@tanstack/react-query";

import apis from "../apis";

const useCreateModel = ({ fn }) => {
  const { authToken } = useAuth();
  const { isPending, mutate } = useMutation({
    mutationFn: ({ data }) => apis.create({ data, authToken }),
    onSuccess: ({ data }) => {
      toast.success("Model created successfully");
      fn(data);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });
  return { isPending, mutate };
};

export default useCreateModel;
