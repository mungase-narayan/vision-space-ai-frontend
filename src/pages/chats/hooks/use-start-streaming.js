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
        updateLastChat({ role: "assistant", content }, tab.id);
      }
    } catch (error) {
      toast.error(error?.message || "Streaming error");
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
