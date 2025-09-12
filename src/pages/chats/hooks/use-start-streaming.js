import { toast } from "sonner";
import { v4 as uuid } from "uuid";

import { URLS } from "@/constants";
import { cleanAIResponse, isResponseCorrupted } from "@/lib/response-cleaner";
import { convertChartType, enhanceChart } from "@/lib/chart-converter";
import { generateFallbackChart, isGenericChart } from "@/lib/fallback-chart-generator";

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

      // Debug: Log the request and response
      console.log('User query:', lastUserMessage);
      console.log('Backend response:', result);
      console.log('Response keys:', Object.keys(result || {}));

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
      let chartSpec = null;

      if (result?.chartData) {
        console.log('Chart data found:', result.chartData);
        chartSpec = result.chartData.spec;
      } else if (result?.chart) {
        console.log('Chart data found in chart field:', result.chart);
        chartSpec = result.chart;
      } else if (result?.visualization) {
        console.log('Chart data found in visualization field:', result.visualization);
        chartSpec = result.visualization;
      } else {
        console.log('No chartData in response. Available fields:', Object.keys(result || {}));

        // Try to extract chart data from the reply text if it contains JSON
        const jsonMatch = rawContent.match(/\{[\s\S]*"data"[\s\S]*"layout"[\s\S]*\}/);
        if (jsonMatch) {
          try {
            chartSpec = JSON.parse(jsonMatch[0]);
            console.log('Extracted chart from text:', chartSpec);
          } catch (e) {
            console.log('Failed to parse extracted chart JSON:', e);
          }
        }

        // Check if backend mentions generating a chart but didn't provide data
        const mentionsChart = rawContent.match(/(chart\.png|attachment:\/\/|!\[.*\]\(.*chart.*\)|line chart|temperature.*chart|showing.*chart)/i);
        if (mentionsChart) {
          console.log('Backend mentions chart generation but no data provided, generating fallback...');
          chartSpec = generateFallbackChart(lastUserMessage);
        }
      }

      // Process and enhance chart if found
      if (chartSpec) {
        console.log('Original chart from backend:', chartSpec);

        // Check if the backend chart is generic/inappropriate for the query
        if (isGenericChart(chartSpec, lastUserMessage)) {
          console.warn('Backend returned generic chart, generating fallback...');
          const fallbackChart = generateFallbackChart(lastUserMessage, chartSpec);
          if (fallbackChart) {
            chartSpec = fallbackChart;
            console.log('Using fallback chart:', chartSpec);
          }
        }

        // Convert chart type based on user request
        const convertedChart = convertChartType(chartSpec, lastUserMessage);

        // Enhance chart based on context
        const enhancedChart = enhanceChart(convertedChart, lastUserMessage);

        // Add the processed chart as a code block
        const chartJson = JSON.stringify(enhancedChart, null, 2);
        content += `\n\n\`\`\`plotly\n${chartJson}\n\`\`\``;

        console.log('Final processed chart:', enhancedChart);
      } else {
        // Only generate fallback charts for explicit visualization requests
        const userWantsVisualization = lastUserMessage.toLowerCase().match(
          /^(plot|chart|graph|visualize|show.*chart|show.*graph|create.*chart|generate.*plot|draw.*graph)/
        );

        if (userWantsVisualization) {
          console.log('No chart from backend, attempting to generate fallback for visualization request...');
          const fallbackChart = generateFallbackChart(lastUserMessage);
          if (fallbackChart) {
            console.log('Generated fallback chart:', fallbackChart);

            // Apply enhancements to fallback chart
            const enhancedChart = enhanceChart(fallbackChart, lastUserMessage);

            // Add the generated chart as a code block
            const chartJson = JSON.stringify(enhancedChart, null, 2);
            content += `\n\n\`\`\`plotly\n${chartJson}\n\`\`\``;

            console.log('Final fallback chart:', enhancedChart);
          }
        } else {
          console.log('No chart from backend and user did not request visualization, skipping chart generation');
        }
      }

      // Chart generation is now handled in the main logic above, no need for forced generation
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