import { toast } from "sonner";
import { v4 as uuid } from "uuid";

import { URLS } from "@/constants";

import { useChatContext } from "../provider";

const useStartStreaming = () => {
  const { tabId, updateTabs, updateLastChat, setStreamId, tab } =
    useChatContext();

  const startStreaming = async ({ data }) => {
    let content = "";
    try {
      updateTabs({ isConversation: true }, tabId);
      updateTabs({ role: "assistant", content: "" }, tabId, "CHAT");

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
      updateLastChat(
        { role: "assistant", content, id: uuid() },
        tabId,
        tab.isCreated
      );
      updateTabs({ isConversation: false, isCreated: true }, tabId);
    }
  };

  return { mutate: startStreaming };
};

export default useStartStreaming;
