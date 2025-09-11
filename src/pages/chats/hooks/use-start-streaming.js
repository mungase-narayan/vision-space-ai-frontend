import { toast } from "sonner";
import { v4 as uuid } from "uuid";

import { URLS } from "@/constants";
import { cleanAIResponse, isResponseCorrupted } from "@/lib/response-cleaner";

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

      // Debug: Log the full response
      console.log('Backend response:', result);

      // Clean up the response content
      let rawContent = result?.reply ?? "";

      // Only clean if severely corrupted (more conservative approach)
      const hasExcessiveCorruption = rawContent.includes('? ? ? ?') ||
        rawContent.includes('…………') ||
        rawContent.match(/Sorry.*Oops.*Apologies/i);

      if (hasExcessiveCorruption) {
        console.warn('Detected severely corrupted AI response, applying cleanup...');
        rawContent = cleanAIResponse(rawContent);
      }

      content = rawContent;

      // Handle different chart data formats
      if (result?.chartData) {
        console.log('Chart data found:', result.chartData);
        // Add chart data as a properly formatted code block
        const chartJson = JSON.stringify(result.chartData.spec, null, 2);
        content += `\n\n\`\`\`plotly\n${chartJson}\n\`\`\``;
      } else if (result?.chart) {
        console.log('Chart data found in chart field:', result.chart);
        const chartJson = JSON.stringify(result.chart, null, 2);
        content += `\n\n\`\`\`plotly\n${chartJson}\n\`\`\``;
      } else if (result?.visualization) {
        console.log('Chart data found in visualization field:', result.visualization);
        const chartJson = JSON.stringify(result.visualization, null, 2);
        content += `\n\n\`\`\`plotly\n${chartJson}\n\`\`\``;
      } else {
        console.log('No chartData in response. Available fields:', Object.keys(result || {}));

        // Try to extract chart data from the reply text if it contains JSON
        const jsonMatch = rawContent.match(/\{[\s\S]*"data"[\s\S]*"layout"[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const extractedChart = JSON.parse(jsonMatch[0]);
            console.log('Extracted chart from text:', extractedChart);
            const chartJson = JSON.stringify(extractedChart, null, 2);
            content += `\n\n\`\`\`plotly\n${chartJson}\n\`\`\``;
          } catch (e) {
            console.log('Failed to parse extracted chart JSON:', e);
          }
        }
      }
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