import React from "react";
import { Loader, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { Markdown } from "@/components";

import { useConversation } from "../provider/conversation-provider";
import { useNavigate } from "react-router-dom";
import useCreateConversation from "../hooks/use-create-conversation";
import { useConversationLaout } from "../provider/conversation-layout-provider";
import ChatFiles from "./chat-files";

const Chats = () => {
  const { chats, isConversation, aiConversation, model, webSearch } =
    useConversation();
  const navigate = useNavigate();
  const { refetchAIConversations, setTabs } = useConversationLaout();
  const { createConversation, isPending } = useCreateConversation({
    callAfterSuccess: () => {
      refetchAIConversations();
    },
  });

  const hanldeEdit = async (index) => {
    const chatData = chats.slice(0, chats.length - index - 1);
    const currentMsg = chats[chats.length - index - 1];
    const userPrompt = currentMsg?.content;
    const files = currentMsg.allFiles;

    const data = {
      name: `${aiConversation?.name || "New Chat"} Edit`,
      chats: chatData,
      model: model,
      webSearch: webSearch,
    };

    const response = await createConversation({ data });
    const id = response?.data?.data?._id;
    setTabs((prev) => [
      ...prev,
      {
        aiConversationId: id,
        name: `${aiConversation?.name || "New Chat"} Edit`,
        userPrompt,
        files,
      },
    ]);
    navigate(`/chat/${id}`);
  };

  if (!chats.length) return null;

  return (
    <div className="flex-1 p-2 w-[95%] lg:w-[816px] mx-auto overflow-y-auto flex flex-col-reverse gap-4 scrollbar-extra-thin">
      {isConversation && (
        <div className="flex items-center justify-center">
          <Loader size={15} className="animate-spin" />
        </div>
      )}
      {[...chats].reverse().map((chat, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center justify-start w-full",
            chat.role === "user" && "justify-end"
          )}
        >
          {chat.role === "user" ? (
            <div className="bg-gray-100 rounded-md p-3 w-[90%] md:w-[80%]">
              {!!chat?.allFiles?.length && (
                <div className="w-full overflow-x-auto flex items-center gap-3 pb-2 hide-scrollbar">
                  {chat.allFiles.map((file, i) => (
                    <ChatFiles data={file} key={i} />
                  ))}
                </div>
              )}
              <div className="whitespace-pre-wrap break-words text-gray-700">
                {chat.content}
              </div>

              <div className="flex items-center justify-end">
                <button
                  disabled={isConversation}
                  className={cn(
                    "cursor-pointer hover:bg-muted-foreground hover:text-white p-2 rounded-full",
                    isConversation && "cursor-not-allowed"
                  )}
                  onClick={() => hanldeEdit(i)}
                >
                  {isPending ? (
                    <Loader size={12} className="animate-spin" />
                  ) : (
                    <Pencil size={12} />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className={"w-[95%] md:w-[80%]"}>
              <Markdown source={chat.content} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Chats;
