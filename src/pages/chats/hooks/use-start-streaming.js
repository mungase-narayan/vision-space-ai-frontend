import { toast } from "sonner";
import { v4 as uuid } from "uuid";

import { URLS } from "@/constants";

import { useChatsProvider } from "../providers/chats-provider";
import { useChatProvider } from "../providers/chat-provider";

const useStartStreaming = () => {
  const { updateTab, updateLastChat } = useChatsProvider();
  const { tab, setStreamId } = useChatProvider();

  const startStreaming = async ({ data }) => {
    let content = "";
    try {
      updateTab({ isConversation: true }, tab.id);
      updateTab({ role: "assistant", content: "" }, tab.id, "CHAT");

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
        {
          role: "assistant",
          content,
          id: uuid(),
          createdAt: new Date().toISOString(),
        },
        tab.id,
        tab.isCreated
      );
      updateTab({ isConversation: false, isCreated: true }, tab.id);
    }
  };

  return { mutate: startStreaming };
};

export default useStartStreaming;
