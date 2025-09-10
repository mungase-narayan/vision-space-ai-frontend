import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/hooks";

import apis from "../../home/apis";

const useCreateConversation = ({ fn }) => {
  const { authToken } = useAuth();
  const { mutate, isPending } = useMutation({
    mutationFn: ({ data }) => apis.createConversation({ authToken, data }),
    onSuccess: () => {
      toast.success("Conversation created successfully");
      fn();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return {
    createConversation: mutate,
    isPending,
  };
};

export default useCreateConversation;
