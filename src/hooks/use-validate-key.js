import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { validateKey } from "@/lib/request";

const useValidateKey = ({ callAfterSuccess = () => {} }) => {
  const { isPending, mutate } = useMutation({
    mutationFn: ({ data }) => validateKey({ data }),
    onSuccess: () => {
      toast.success("Successfully added OpenaAI key");
      callAfterSuccess();
    },
    onError: () => {
      toast.error("Error while validating key");
    },
    retry: false,
  });

  return { isPending, mutate };
};

export default useValidateKey;
