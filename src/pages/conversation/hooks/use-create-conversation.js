import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { useAuth } from "@/hooks";

import apis from "../../home/apis";

const useCreateConversation = ({ callAfterSuccess }) => {
  const { authToken } = useAuth();
  const {
    mutateAsync,
    isPending,
    data: response,
  } = useMutation({
    mutationFn: ({ data }) => apis.createConversation({ authToken, data }),
    onSuccess: () => {
      toast.success("Conversation created successfully");
      callAfterSuccess();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message);
    },
    retry: false,
  });

  return {
    createConversation: mutateAsync,
    isPending,
    id: response?.data?.data?._id,
  };
};

export default useCreateConversation;
