import { toast } from "sonner";
import { useAuth } from "@/hooks";
import { useMutation } from "@tanstack/react-query";

import apis from "../apis";

const useUserDelete = ({ fn }) => {
  const { authToken } = useAuth();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.deleteUser({ data, authToken }),
    onSuccess: () => {
      toast.success("User deleted successfully");
      fn?.();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return {
    deleteUser: mutate,
    isPending,
  };
};

export default useUserDelete;
