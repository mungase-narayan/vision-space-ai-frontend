import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks";

import apis from "../apis";
import { toast } from "sonner";

const useShareChat = ({ fn }) => {
  const { authToken } = useAuth();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.shareChat({ authToken, data }),
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

export default useShareChat;
