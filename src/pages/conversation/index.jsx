import { useEffect, useState } from "react";
import { Loader, Plus } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import Chats from "./components/chats";
import TabButton from "./components/tab-button";
import ChatInput from "./components/chat-input";
import useGetConversation from "./hooks/use-get-conversation";
import { useConversationLaout } from "./provider/conversation-layout-provider";
import { ConversationContext } from "./provider/conversation-provider";

import { generateObjectId } from "@/lib/utils";
import { useUpdateDocumentTitle } from "@/hooks";
import { useApp } from "@/providers/app-provider";
import { URLS } from "@/constants";

const Conversation = () => {
  const { defaultModel } = useApp();
  useUpdateDocumentTitle({ title: `Chatbot - ${URLS.LOGO_TEXT}` });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { aiConversationId } = useParams();
  const { tabs, setTabs } = useConversationLaout();
  const { aiConversation, isPending, refetchConversation } = useGetConversation(
    { aiConversationId }
  );

  const [webSearch, setWebSearch] = useState(false);
  const [model, setModel] = useState(defaultModel);
  const [files, setFiles] = useState([]);
  const [streamId, setStreamId] = useState(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [isConversation, setIsConversation] = useState(false);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (aiConversation) {
      setModel(aiConversation.model);
      setChats(aiConversation.chats);
      setWebSearch(aiConversation.webSearch);
    }
  }, [aiConversation]);

  useEffect(() => {
    const currentTab = tabs?.find(
      (t) => t.aiConversationId == aiConversationId
    );

    if (currentTab) {
      setUserPrompt(currentTab?.userPrompt);
      setFiles(currentTab?.files || []);
      if (searchParams.get("forCreating") === "true") setChats([]);
    } else {
      setChats([]);
    }
  }, [aiConversationId]);

  const handleCreate = async () => {
    const id = generateObjectId();
    setTabs((prev) => [
      ...prev,
      {
        aiConversationId: id,
        name: "New Chat",
        userPrompt: "",
        files: [],
        forCreating: true,
      },
    ]);
    navigate(`/chat/${id}?forCreating=true`);
  };

  return (
    <ConversationContext.Provider
      value={{
        aiConversation,
        refetchConversation,
        aiConversationId,
        model,
        setModel,
        files,
        setFiles,
        setChats,
        chats,
        isConversation,
        setIsConversation,
        userPrompt,
        setUserPrompt,
        streamId,
        setStreamId,
        webSearch,
        setWebSearch,
        forCreating: searchParams.get("forCreating") === "true",
      }}
    >
      <div className="relative">
        <div className="w-full h-[45px] bg-muted">
          <div className="w-full flex items-center h-full px-4 overflow-x-auto gap-1 hide-scrollbar">
            {(tabs || []).map((tab) => (
              <TabButton tab={tab} key={tab.aiConversationId} />
            ))}
            <button
              onClick={handleCreate}
              className="hover:bg-neutral-600 p-1 rounded-full hover:text-white cursor-pointer"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

        {isPending ? (
          <div className="py-5 flex items-center flex-col gap-2 justify-center">
            <Loader size={15} className="animate-spin" />
            <span>fetching chats please wait!</span>
          </div>
        ) : (
          <div className="flex flex-col w-[95%] md:container mx-auto h-[calc(100vh_-115px)]">
            {!!chats.length && <Chats />}
            <ChatInput />
          </div>
        )}
      </div>
    </ConversationContext.Provider>
  );
};

export default Conversation;
