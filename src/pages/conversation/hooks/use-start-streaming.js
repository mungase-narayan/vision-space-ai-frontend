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
    callAfterSuccess: () => { },
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

      const lastUserMessage = Array.isArray(data?.chat)
        ? data.chat[data.chat.length - 1]?.content
        : data?.message;

      const response = await fetch(`${URLS.AI_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: lastUserMessage || "" }),
      });

      if (!response.ok) throw new Error("Request failed");
      const result = await response.json();
      content = result?.reply ?? "";
    } catch (error) {
      toast.error(error?.message || "Request error");
    } finally {
      handleNewAssistantMessage(content);
    }
  };

  return { mutate: startStreaming };
};

export default useStartStreaming;
