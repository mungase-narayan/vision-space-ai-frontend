import { useQueries } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY } from "@/constants";
import { useAuth } from "@/hooks";
import apis from "../apis";
import adminApis from "../../dashboard/admin/ai-model/apis";

const fetchModelList = async () => {
  const res = await fetch("https://openrouter.ai/api/v1/models");
  if (!res.ok) throw new Error(`Error: ${res.statusText}`);
  const output = await res.json();

  return output.data
    .map((model) => ({
      label: model.name,
      value: model.id,
      description: model.description,
      inputModalities: model.architecture.input_modalities || [],
      pricing: model.pricing,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

const useFetchData = () => {
  const { authToken } = useAuth();

  const results = useQueries({
    queries: [
      {
        queryKey: [QUERY.AI_CONVERSATION.GET_CONVERSATIONS],
        queryFn: () =>
          apis.getChats({ authToken, params: { limit: 100, page: 1 } }),
        retry: false,
        onError: (error) => {
          toast.error(error?.response?.data?.message || "Failed to load chats");
        },
      },
      {
        queryKey: [QUERY.AI_MODEL.GET_MODELS],
        queryFn: () => adminApis.getModels({ authToken }),
        staleTime: 1000 * 60 * 60 * 24,
        retry: false,
      },
      {
        queryKey: ["OPENROUTER_MODELS"],
        queryFn: fetchModelList,
        staleTime: 1000 * 60 * 60 * 24,
        retry: false,
      },
      {
        queryKey: [QUERY.PROJECT.GET_PROJECTS],
        queryFn: () => apis.getAllProjects({ authToken }),
        staleTime: 1000 * 60 * 60 * 24,
        retry: false,
      },
    ],
  });

  const [chatsResult, modelsResult, openRouterModelsResult, projectsResult] =
    results;

  return {
    // Chats
    chats: chatsResult.data?.data?.data?.chats?.aiConversations || [],
    totalChats: chatsResult.data?.data?.data?.chats?.total || 0,
    statics: chatsResult.data?.data?.data?.conversationCount || {},
    messageCount: chatsResult.data?.data?.data?.messageCount || 0,
    chatsCount: chatsResult.data?.data?.data?.chatsCount || 0,
    pinnedConversations:
      chatsResult.data?.data?.data?.pinnedConversations?.aiConversations || [],
    isChatsLoading: chatsResult.isLoading,
    refetchChats: chatsResult.refetch,

    // Custom Models
    models: modelsResult.data?.data?.data ?? [],
    isModelsLoading: modelsResult.isLoading,
    refetchModels: modelsResult.refetch,

    // OpenRouter Models
    modelList: openRouterModelsResult.data ?? [],
    isModelListLoading: openRouterModelsResult.isLoading,

    // Projects
    projects: projectsResult.data?.data?.data ?? [],
    isProjectsLoading: projectsResult.isLoading,
    refetchProjects: projectsResult.refetch,
  };
};

export default useFetchData;
