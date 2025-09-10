import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import apis from "../apis";

import { useAuth } from "@/hooks";

const useDeleteChat = ({ fn }) => {
  const { authToken } = useAuth();
  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.deleteChat({ authToken, data }),
    onSuccess: () => fn(),
    onError: (error) => toast.error(error?.response?.data?.message),
    onSettled: () => toast.success("Chat deleted successfully"),
    retry: false,
  });

  return {
    deleteChat: mutate,
    isPending,
  };
};

export default useDeleteChat;
