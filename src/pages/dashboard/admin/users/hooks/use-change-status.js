import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { useMutation } from "@tanstack/react-query";

import apis from "../apis";

const useChangeStatus = ({ fn }) => {
  const { authToken } = useAuth();

  const { mutate: changeStatus, isPending } = useMutation({
    mutationFn: ({ data }) => apis.changeStatus({ data, authToken }),
    onSuccess: () => {
      toast.success("Status changed successfully");
      fn?.();
    },
    onError: () => {
      toast.error("Failed to change status");
    },
    retry: false,
  });

  return {
    changeStatus,
    isPending,
  };
};

export default useChangeStatus;
