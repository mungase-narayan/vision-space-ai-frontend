import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/hooks";

import apis from "../apis";

const useUpdateChat = ({ fn }) => {
  const { authToken } = useAuth();
  const { mutate, mutateAsync, isPending } = useMutation({
    mutationFn: ({ data }) => apis.updateChat({ authToken, data }),
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    onSuccess: () => fn(),
    retry: false,
  });

  return {
    updateChat: mutate,
    updateChatAsync: mutateAsync,
    isPending,
  };
};

export default useUpdateChat;
