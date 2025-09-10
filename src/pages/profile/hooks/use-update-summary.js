import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks";

import apis from "../apis";

const useUpdateSummary = ({ fn }) => {
  const { authToken } = useAuth();
  const { isPending, mutate } = useMutation({
    mutationFn: ({ data }) => apis.updateSummary({ authToken, data }),
    onSuccess: () => {
      fn();
      toast.success("Summary updated successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return { isPending, mutate };
};

export default useUpdateSummary;
