import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/hooks";

import apis from "../apis";

const useCreateChat = ({ fn }) => {
  const { authToken } = useAuth();
  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.createChat({ authToken, data }),
    onSuccess: () => {
      toast.success("Chat created successfully");
      fn();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return {
    createChat: mutate,
    isPending,
  };
};

export default useCreateChat;
