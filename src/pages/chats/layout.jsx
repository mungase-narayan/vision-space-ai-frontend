import { isEqual } from "lodash";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth, useUpdateDocumentTitle } from "@/hooks";
import { Loader, ModeToggle } from "@/components";
import { cn, generateObjectId } from "@/lib/utils";
import { URLS } from "@/constants";

import Chats from "./index";
import {
  useGetChats,
  useCreateChat,
  useUpdateChat,
  useGenerateTabName,
  useDeleteChat,
  useGetProjects,
} from "./hooks";
import { ChatsContext, useChatsProvider } from "./providers/chats-provider";
import TabButton from "./components/tab-button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import ChatsSidebar from "./components/sidebar";
import { useApp } from "@/providers/app-provider";
import useModelList from "../dashboard/admin/ai-model/hooks/use-get-model-list";
import useGetModels from "../dashboard/admin/ai-model/hooks/use-get-models";

const ChatsLayout = () => {
  useUpdateDocumentTitle({ title: `Chats - ${URLS.LOGO_TEXT}` });
  const { isAuth, openAIKey, user } = useAuth();
  const { isDisplayAllModels } = useApp();

  const {
    isPending,
    chats: fetchedChats,
    totalChats,
    statics,
    messageCount,
    refetchChats,
    pinnedConversations,
    chatsCount,
  } = useGetChats();
  const { models, isLoading: loadingCutomModels } = useGetModels();
  const { models: modelList, isLoading: modelListLoading } = useModelList();

  const {
    refetch: refetchProjects,
    projects,
    isLoading: projectsLoading,
  } = useGetProjects();
  const { createChat } = useCreateChat({
    fn: () => {
      refetchChats();
      refetchProjects();
    },
  });
  const { updateChatAsync, updateChat: updateChatAPI } = useUpdateChat({
    fn: () => {},
  });
  const { generateTabName } = useGenerateTabName({ fn: () => {} });
  const { deleteChat, isPending: isDeletingChat } = useDeleteChat({
    fn: () => {
      refetchChats();
      refetchProjects();
    },
  });

  const [tabs, setTabs] = useState([]);
  const [chats, setChats] = useState([]);
  const [tabStack, setTabStack] = useState([]);
  const [selectedTabId, setSelectedTabId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const addTab = (data = null) => {
    const id = generateObjectId();
    const tab = {
      id,
      name: "New Chat",
      task: "Basic Tasks",
      chats: [],
      files: [],
      model: null,
      webSearch: false,
      isConversation: false,
      isCreated: false,
      isImageGenerate: false,
      ...(data && { ...data }),
    };
    setTabs((prev) => [...prev, tab]);
    pushTabToStack(id);
  };

  const deleteTab = (tabId) => {
    removeTabFromStack(tabId);
    setTabs((prev) => prev.filter((tab) => tab.id !== tabId));
    deleteChat({ data: { aiConversationId: tabId } });
  };

  const closeTab = (tabId) => {
    setTabs((prev) => prev.filter((tab) => tab.id !== tabId));
    removeTabFromStack(tabId);
  };

  const updateTab = (data, tabId, type) => {
    setTabs((prev) => {
      return prev.map((tab) => {
        if (tab.id === tabId) {
          const newTab = {
            ...tab,
            ...(type === "CHAT" && { chats: [...tab.chats, data] }),
            ...(type === "FILE" && { files: [...tab.files, data] }),
            ...(!type && data),
          };
          return newTab;
        } else return tab;
      });
    });
  };

  const copyTab = (tabId) => {
    const tab = tabs.find((tab) => tab.id === tabId);
    if (!tab) {
      toast.error("Someting went wrong");
      return;
    }
    const id = generateObjectId();
    const newTab = { ...tab, id, name: `${tab.name} Copy` };
    setTabs((prev) => [...prev, newTab]);

    pushTabToStack(id);
    createChat({
      data: {
        _id: id,
        name: `${tab.name} Copy`,
        chats: tab.chats,
        model: tab.model,
        webSearch: tab.webSearch,
        task: tab.task,
      },
    });
    toast.success("Tab copied successfully");
  };

  const createOrUpdateChat = async (updatedTabs, tabId, isCreated) => {
    if (isCreated === undefined) return;

    if (isCreated === true) {
      const index = updatedTabs.findIndex((t) => t.id === tabId);
      const chats = updatedTabs[index].chats;

      let name = updatedTabs[index].name;

      if (chats.length && chats.length % 6 === 0) {
        const response = await generateTabName({
          data: { chat: chats, key: openAIKey, user_id: user._id },
        });
        name = response?.data?.response;
        updateTab({ name }, tabId);
      }

      await updateChatAsync({
        data: {
          aiConversationId: tabId,
          chats,
          name,
          model: updatedTabs[index].model,
          task: updatedTabs[index].task,
          webSearch: updatedTabs[index].webSearch,
        },
      });

      refetchChats();
      refetchProjects();
    } else if (isCreated === false) {
      const tab = updatedTabs.find((t) => t.id === tabId);
      if (tab) {
        const response = await generateTabName({
          data: { chat: tab.chats, key: openAIKey, user_id: user._id },
        });
        const name = response?.data?.response;
        updateTab({ name }, tabId);
        createChat({
          data: {
            _id: tabId,
            model: tab.model,
            webSearch: tab.webSearch,
            chats: tab.chats,
            name,
            task: tab?.task,
            ...(tab?.projectId && { projectId: tab.projectId }),
          },
        });
      }
    }
  };

  const updateLastChat = async (data, tabId, isCreated) => {
    setTabs((prevTabs) => {
      const tabsCopy = [...prevTabs];
      const index = tabsCopy.findIndex((t) => t.id === tabId);

      if (index === -1) return prevTabs;

      const tab = { ...tabsCopy[index] };
      const updatedChats = [...tab.chats.slice(0, -1), data];
      tab.chats = updatedChats;
      tabsCopy[index] = tab;
      createOrUpdateChat(tabsCopy, tabId, isCreated);

      return tabsCopy;
    });
  };

  const editChat = (tabId, chatId) => {
    const tab = tabs.find((tab) => tab.id === tabId);
    if (!tab) {
      toast.error("Chat not found");
      return;
    }

    const index = tab.chats.findIndex((chat) => chat.id === chatId);
    const chats = tab.chats.slice(0, index);
    const currentMsg = tab.chats[index];
    const userPrompt = currentMsg?.content;
    const allFiles = currentMsg?.allFiles || [];

    const id = generateObjectId();
    const newTab = {
      ...tab,
      id,
      name: `${tab.name} Edit`,
      chats,
      userPrompt,
      files: allFiles,
    };
    setTabs((prev) => [...prev, newTab]);
    pushTabToStack(id);

    createChat({
      data: {
        _id: id,
        name: `${tab.name} Edit`,
        chats: tab.chats,
        model: tab.model,
        webSearch: tab.webSearch,
        task: tab?.task,
        ...(tab?.projectId && { projectId: tab?.projectId }),
      },
    });
  };

  const pushTabToStack = (tabId) => {
    setTabStack((prev) => {
      const filtered = prev.filter((id) => id !== tabId);
      return [...filtered, tabId];
    });
    setSelectedTabId(tabId);
  };

  const removeTabFromStack = (tabId) => {
    setTabStack((prev) => prev.filter((id) => id !== tabId));

    if (tabId === selectedTabId) {
      const newStack = tabStack.filter((id) => id !== tabId);
      const lastTab = newStack?.[newStack.length - 1] || null;
      setSelectedTabId(lastTab);
    }
  };

  const updateChat = (tabId, chatId, content) => {
    setTabs((prev) => {
      const tabs = [...prev];
      const newTabs = tabs.map((t) => {
        if (t.id === tabId) {
          const newTab = {
            ...t,
            chats: t.chats.map((c) =>
              c.id === chatId ? { ...c, content } : c
            ),
          };
          updateChatAPI({
            data: { aiConversationId: tabId, chats: newTab.chats },
          });
          return newTab;
        }
        return t;
      });
      return newTabs;
    });
  };

  const closeAllTabs = () => {
    setTabs([]);
    setTabStack([]);
    addTab();
  };

  useEffect(() => {
    if (
      fetchedChats &&
      Array.isArray(fetchedChats) &&
      !isEqual(fetchedChats, chats)
    ) {
      setChats(fetchedChats);
    }
  }, [fetchedChats, chats]);

  useEffect(() => {
    const id = generateObjectId();
    const tab = {
      id,
      name: "New Chat",
      chats: [],
      files: [],
      model: null,
      webSearch: false,
      isConversation: false,
      isCreated: false,
      isImageGenerate: false,
      task: "Basic Tasks",
    };
    setTabs([tab]);
    pushTabToStack(id);
  }, []);

  if (!isAuth) return <Navigate to="/" />;

  if (isPending || loadingCutomModels || modelListLoading)
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2">
        <Loader />
        <span className="text-sm text-gray-500">
          Please wait while we fetch resources.
        </span>
      </div>
    );

  return (
    <ChatsContext.Provider
      value={{
        selectedTabId,
        setSelectedTabId,

        chats,
        setChats,

        tabs,
        setTabs,

        sidebarCollapsed,
        setSidebarCollapsed,

        addTab,
        deleteTab,
        updateTab,
        copyTab,
        closeTab,

        pushTabToStack,
        removeTabFromStack,

        updateLastChat,
        editChat,
        updateChat,
        closeAllTabs,

        statics,
        totalChats,
        messageCount,
        isDeletingChat,
        chatsCount,

        refetchChats,

        pinnedConversations,

        projects,
        refetchProjects,

        projectsLoading,

        models: [
          ...models,
          ...(isDisplayAllModels
            ? [
                {
                  name: "All",
                  models: modelList,
                  defaultModel: "openai/gpt-4o-mini",
                },
              ]
            : []),
        ],
      }}
    >
      <SidebarProvider>
        <ChatsSidebar />
        <SidebarInset>
          <Content />
        </SidebarInset>
      </SidebarProvider>
    </ChatsContext.Provider>
  );
};

const Content = () => {
  const { open, isMobile } = useSidebar();
  const { tabs, selectedTabId, addTab } = useChatsProvider();

  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={cn(
        "flex",
        open && !isMobile ? "w-[calc(100vw_-258px)]" : "w-full"
      )}
      style={{ height: viewportHeight }}
    >
      <div className={cn("flex w-full flex-col overflow-hidden")}>
        <header className="border-b py-3 flex items-center px-2 justify-between">
          <div className="flex items-center gap-2 w-full">
            <SidebarTrigger className="size-8 md:!hidden" />

            <div className="w-full flex items-center h-full px-2 overflow-x-auto gap-1 hide-scrollbar">
              {tabs.map((tab) => (
                <TabButton key={tab.id} tab={tab} />
              ))}
              <button
                className="hover:bg-muted p-1 rounded-full hover:text-muted-foreground cursor-pointer"
                onClick={() => addTab("New Chat")}
              >
                <Plus size={15} />
              </button>
            </div>
            <ModeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {tabs.map((tab) =>
            tab.id === selectedTabId ? <Chats tab={tab} key={tab.id} /> : null
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatsLayout;
