import { toast } from "sonner";
import { URLS } from "@/constants";

import { useConversation } from "../provider/conversation-provider";
import useUpdateConversation from "./use-update-conversation";
import useCreateConversation from "./use-create-conversation";
import { useConversationLaout } from "../provider/conversation-layout-provider";
import { useSearchParams } from "react-router-dom";

const useStartStreaming = () => {
  const [_, setSearchParams] = useSearchParams();
  const {
    setChats,
    setIsConversation,
    setStreamId,
    aiConversationId,
    webSearch,
    model,
    forCreating,
    refetchConversation,
  } = useConversation();
  const { setTabs, refetchAIConversations } = useConversationLaout();
  const { updateConversation } = useUpdateConversation({
    callAfterSuccess: () => {},
  });
  const { createConversation } = useCreateConversation({
    callAfterSuccess: () => {
      refetchAIConversations();
    },
  });

  const callAfter2Sec = (fn) => {
    setTimeout(() => fn(), 2000);
  };

  const handleNewAssistantMessage = async (content) => {
    setChats((prevChats) => {
      const updatedChats = [
        ...prevChats.slice(0, prevChats.length - 1),
        { role: "assistant", content },
      ];
      updateConversationState(updatedChats);
      return updatedChats;
    });
  };

  const updateConversationState = async (chats) => {
    if (forCreating) {
      try {
        setTabs((prev) =>
          prev.map((p) =>
            p.aiConversationId === aiConversationId
              ? { ...p, forCreating: false }
              : p
          )
        );
        await createConversation({
          data: {
            aiConversationId,
            chats,
            model,
            webSearch,
            name: "New Chat",
          },
        });
        refetchConversation();
        callAfter2Sec(() => {
          setSearchParams((params) => {
            params.delete("forCreating");
          });
        });
      } catch (error) {
        console.error("Failed to create conversation:", error);
      } finally {
        setIsConversation(false);
      }
    } else {
      setIsConversation(false);
      try {
        updateConversation({ data: { chats, aiConversationId } });
      } catch (error) {
        console.error("Failed to update conversation:", error);
      }
    }
  };

  const startStreaming = async ({ data }) => {
    let content = "";
    try {
      setIsConversation(true);
      setChats((prev) => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch(`${URLS.AI_BASE_URL}/get-chat-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok || !response.body) throw new Error("Streaming failed");
      setStreamId(response.headers.get("Stream-Id"));

      const stream = response.body.pipeThrough(new TextDecoderStream());
      const reader = stream.getReader();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        content += value;
        setChats((prev) => [
          ...prev.slice(0, prev.length - 1),
          { role: "assistant", content },
        ]);
      }
    } catch (error) {
      toast.error(error?.message || "Streaming error");
    } finally {
      handleNewAssistantMessage(content);
    }
  };

  return { mutate: startStreaming };
};

export default useStartStreaming;
