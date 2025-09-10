import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth, useUpdateDocumentTitle } from "@/hooks";
import { URLS } from "@/constants";
import { generateObjectId, cn } from "@/lib/utils";

import SettingButton from "@/components/shared/setting-button";
import UserAvatar from "@/components/shared/user-avatar";
import MobileHeader from "@/components/shared/mobile-header";
import { AuthButtons, LogoLink, LogOutButton } from "@/components";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import Tab from "./components/tab";
import {
  useCreateConversation,
  useGenerateTabName,
  useGetConversations,
  useUpdateConversation,
} from "./hooks";
import TabButton from "./components/tab-button";
import AppSidebar from "./components/app-sidebar";
import PrintProvider from "./components/print-provider";
import { useApp } from "@/providers/app-provider";

const ChatPage = () => {
  useUpdateDocumentTitle({ title: `Chat - ${URLS.LOGO_TEXT}` });
  const [activeTab, setActiveTab] = useState(null);
  const [tabs, setTabs] = useState([]);
  const { aiConversations, refetchConversations, isPending } =
    useGetConversations();
  const [tabStack, setTabStack] = useState([]);

  const pushTab = (tabId) => {
    setTabStack((prev) => {
      const filtered = prev.filter((id) => id !== tabId);
      return [...filtered, tabId];
    });
  };

  const removeTab = (tabId) => {
    setTabStack((prev) => prev.filter((id) => id !== tabId));

    if (tabId === activeTab) {
      const newStack = tabStack.filter((id) => id !== tabId);
      const lastTab = newStack?.[newStack.length - 1] || null;
      return lastTab;
    }

    return activeTab;
  };

  return (
    <PrintProvider>
      <div className="border-grid flex flex-1 flex-col min-h-screen">
        <SidebarProvider>
          <AppSidebar
            aiConversations={aiConversations}
            isPending={isPending}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={tabs}
            refetchConversations={refetchConversations}
            setTabs={setTabs}
            pushTab={pushTab}
            removeTab={removeTab}
          />
          <SidebarInset>
            <Header />
            <Children
              refetchConversations={refetchConversations}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabs={tabs}
              setTabs={setTabs}
              pushTab={pushTab}
              removeTab={removeTab}
            />
          </SidebarInset>
        </SidebarProvider>
      </div>
    </PrintProvider>
  );
};

const Header = () => {
  const { isMobile, open } = useSidebar();
  const { isAuth } = useAuth();
  return (
    <div className="flex items-center border-b justify-between px-4 sm:px-8 h-14 space-x-2">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        {(isMobile || !open) && (
          <LogoLink className="items-center justify-start h-full text-lg" />
        )}
      </div>

      <div className="flex items-center justify-center space-x-2">
        <SettingButton />
        <div className="md:flex hidden">
          <AuthButtons />
        </div>
        {isAuth && (
          <div className="w-full hidden md:flex gap-2  items-center justify-center">
            <UserAvatar />
            <div className="h-[20px] border-l border-black"></div>
            <LogOutButton isText={false} />
          </div>
        )}
        <MobileHeader />
      </div>
    </div>
  );
};

const Children = ({
  refetchConversations,
  activeTab,
  setActiveTab,
  tabs,
  setTabs,
  pushTab,
  removeTab,
}) => {
  const { openAIKey } = useAuth();
  const { defaultModel } = useApp();
  const { isMobile, open } = useSidebar();
  const { createConversation } = useCreateConversation({
    fn: () => refetchConversations(),
  });
  const { updateConversation, updateConversationAsync } = useUpdateConversation(
    { fn: () => {} }
  );
  const { generateTabName } = useGenerateTabName({ fn: () => {} });

  useEffect(() => {
    const id = generateObjectId();
    setActiveTab(id);
    pushTab(id);
    setTabs([
      {
        id,
        name: "New Chat",
        chats: [],
        model: defaultModel,
        webSearch: false,
        files: [],
        isConversation: false,
        isCreated: false,
        isImageGenerate: false,
      },
    ]);
  }, []);

  const addTab = (name) => {
    const id = generateObjectId();
    setTabs((prev) => [
      ...prev,
      {
        id,
        name,
        chats: [],
        model: defaultModel,
        webSearch: false,
        files: [],
        isCreated: false,
        isImageGenerate: false,
      },
    ]);
    pushTab(id);
    setActiveTab(id);
  };

  const updateTabs = (data, tabId, type) => {
    setTabs((prev) => {
      return prev.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              ...(type === "CHAT" && { chats: [...tab.chats, data] }),
              ...(type === "FILE" && { files: [...tab.files, data] }),
              ...(!type && data),
            }
          : tab
      );
    });
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

  const createOrUpdateChat = async (updatedTabs, tabId, isCreated) => {
    if (isCreated === undefined) return;

    if (isCreated === true) {
      const index = updatedTabs.findIndex((t) => t.id === tabId);
      const chats = updatedTabs[index].chats;

      let name = updatedTabs[index].name;

      if (chats.length && chats.length % 6 === 0) {
        const response = await generateTabName({
          data: { chat: chats, key: openAIKey },
        });
        name = response?.data?.response;
        updateTabs({ name }, tabId);
      }

      await updateConversationAsync({
        data: {
          aiConversationId: tabId,
          chats,
          name,
        },
      });

      if (chats.length && chats.length % 6 === 0) refetchConversations();
    } else if (isCreated === false) {
      const tab = updatedTabs.find((t) => t.id === tabId);
      if (tab) {
        const response = await generateTabName({
          data: { chat: tab.chats, key: openAIKey },
        });
        const name = response?.data?.response;
        updateTabs({ name }, tabId);
        createConversation({
          data: {
            _id: tabId,
            model: tab.model,
            webSearch: tab.webSearch,
            chats: tab.chats,
            name,
          },
        });
      }
    }
  };

  const deleteTab = (id) => {
    setTabs((prev) => prev.filter((tab) => tab.id !== id));
    const lastTab = removeTab(id);
    setActiveTab(lastTab);
  };

  const copyTab = (tabId) => {
    const tab = tabs.find((tab) => tab.id === tabId);
    if (!tab) {
      toast.error("Someting went wrong");
      return;
    }
    const id = generateObjectId();
    setTabs((prev) => [...prev, { ...tab, id, name: `${tab.name} Copy` }]);
    setActiveTab(id);
    pushTab(id);
    createConversation({
      data: {
        _id: id,
        name: `${tab.name} Copy`,
        chats: tab.chats,
        model: tab.model,
        webSearch: tab.webSearch,
      },
    });
    toast.success("Tab copied successfully");
  };

  const editChat = (tabId, index) => {
    const tab = tabs.find((tab) => tab.id === tabId);
    if (!tab) {
      toast.error("Chat not found");
      return;
    }

    const chats = tab.chats.slice(0, tab.chats.length - index - 1);
    const currentMsg = tab.chats[tab.chats.length - index - 1];
    const userPrompt = currentMsg?.content;
    const allFiles = currentMsg?.allFiles || [];

    const id = generateObjectId();
    setTabs((prev) => [
      ...prev,
      {
        ...tab,
        id,
        name: `${tab.name} Edit`,
        chats,
        userPrompt,
        files: allFiles,
      },
    ]);
    pushTab(id);
    setActiveTab(id);

    createConversation({
      data: {
        _id: id,
        name: `${tab.name} Edit`,
        chats: tab.chats,
        model: tab.model,
        webSearch: tab.webSearch,
      },
    });
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
          updateConversation({
            data: { aiConversationId: tabId, chats: newTab.chats },
          });
          return newTab;
        }
        return t;
      });
      return newTabs;
    });
  };

  return (
    <div
      className={cn(
        "flex flex-1 flex-col",
        open && !isMobile ? "w-[calc(100vw_-258px)]" : "w-full"
      )}
    >
      <div className="relative">
        <div className="w-full h-[45px] bg-muted">
          <div className="w-full flex items-center h-full px-4 overflow-x-auto gap-1 hide-scrollbar">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                deleteTab={deleteTab}
                setActiveTab={setActiveTab}
                activeTab={activeTab}
                updateTabs={updateTabs}
                copyTab={copyTab}
                refetchConversations={refetchConversations}
                pushTab={pushTab}
                removeTab={removeTab}
              />
            ))}

            <button
              className="hover:bg-neutral-600 p-1 rounded-full hover:text-white cursor-pointer"
              onClick={() => addTab("New Chat")}
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

        {tabs.map((tab) =>
          tab.id === activeTab ? (
            <Tab
              key={tab.id}
              tabId={tab.id}
              updateTabs={updateTabs}
              updateLastChat={updateLastChat}
              editChat={editChat}
              tab={tab}
              refetchConversations={refetchConversations}
              updateChat={updateChat}
            />
          ) : null
        )}
      </div>
    </div>
  );
};

export default ChatPage;
