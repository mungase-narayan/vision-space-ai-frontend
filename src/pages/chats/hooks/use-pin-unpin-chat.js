import { toast } from "sonner";

import { useAuth } from "@/hooks";
import { useMutation } from "@tanstack/react-query";

import apis from "../apis";

const usePinUnpinChat = ({ fn = () => {} }) => {
  const { authToken } = useAuth();

  const { isPending, mutate } = useMutation({
    mutationFn: ({ data }) => apis.pinUnpinChat({ data, authToken }),
    onSuccess: ({ data }) => {
      toast.success(data?.message);
      fn();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return { isPending, mutate };
};

export default usePinUnpinChat;
