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
        updateLastChat({ role: "assistant", content }, tabId);
      }
    } catch (error) {
      toast.error(error?.message || "Streaming error");
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
