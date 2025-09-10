import { toast } from "sonner";

import { URLS } from "@/constants";

import { useChatContext } from "../provider";

const useConversation = () => {
  const { tabId, updateTabs, updateLastChat, setStreamId } = useChatContext();

  const startStreaming = async ({ data }) => {
    let content = "";
    try {
      updateTabs({ isConversation: true }, tabId);
      updateLastChat({ role: "assistant", content: "" }, tabId, true);

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
      updateTabs({ isConversation: false }, tabId);
      updateLastChat({ role: "assistant", content }, tabId);
    }
  };

  return { mutate: startStreaming };
};

export default useConversation;
