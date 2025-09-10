import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import apis from "../apis";

const useStopStreaming = () => {
  const { isPending, mutate } = useMutation({
    mutationFn: ({ data }) => apis.stopConversation({ data }),
    onError: () => {
      toast.error("Error while interrupt response");
    },
    retry: false,
  });

  return { isPending, mutate };
};

export default useStopStreaming;
