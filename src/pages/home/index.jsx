import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import Tab from "./components/tab";
import TabButton from "./components/tab-button";
import { useUpdateDocumentTitle } from "@/hooks";
import { useApp } from "@/providers/app-provider";
import { URLS } from "@/constants";

const HomePage = () => {
  const { defaultModel } = useApp();
  useUpdateDocumentTitle({ title: `Home - ${URLS.LOGO_TEXT}` });

  const [activeTab, setActiveTab] = useState();
  const [tabs, setTabs] = useState([]);

  useEffect(() => {
    const id = uuid();
    setActiveTab(id);
    setTabs([
      {
        id,
        name: "New Chat",
        chats: [],
        model: defaultModel,
        webSearch: false,
        files: [],
        isConversation: false,
        isImageGenerate: false,
      },
    ]);
  }, []);

  const addTab = (name) => {
    const id = uuid();
    setTabs((prev) => [
      ...prev,
      {
        id,
        name,
        chats: [],
        model: defaultModel,
        webSearch: false,
        files: [],
        isImageGenerate: false,
      },
    ]);
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

  const updateLastChat = (data, tabId, isFirstChat = false) => {
    setTabs((prev) => {
      const tabs = [...prev];
      const index = tabs.findIndex((t) => t.id == tabId);
      if (index === -1) return tabs;
      const lastChats = isFirstChat
        ? tabs[index].chats
        : tabs[index].chats.slice(0, tabs[index].chats.length - 1);
      const chats = [...lastChats, data];
      tabs[index].chats = chats;
      return tabs;
    });
  };

  const deleteTab = (id) => {
    setTabs((prev) => prev.filter((tab) => tab.id !== id));
    if (activeTab === id && tabs.length > 1) {
      const newActive = tabs.find((t) => t.id !== id)?.id;
      setActiveTab(newActive);
    }
  };

  const copyTab = (tabId) => {
    const tab = tabs.find((tab) => tab.id === tabId);
    if (!tab) {
      toast.error("Someting went wrong");
      return;
    }
    const id = uuid();
    setTabs((prev) => [...prev, { ...tab, id, name: `${tab.name} Copy` }]);
    setActiveTab(id);
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

    const id = uuid();
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
    setActiveTab(id);
  };

  return (
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
          />
        ) : null
      )}
    </div>
  );
};

export default HomePage;
