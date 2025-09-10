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
      updateTabs({ isConversation: false }, tabId);
      updateLastChat({ role: "assistant", content }, tabId);
    }
  };

  return { mutate: startStreaming };
};

export default useConversation;
