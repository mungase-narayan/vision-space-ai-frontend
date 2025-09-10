import React from "react";
import { Loader, Pencil } from "lucide-react";

import { MDX } from "@/components";
import { cn } from "@/lib/utils";

import ChatFiles from "./chat-files";
import { useChatContext } from "../provider";

const Chats = () => {
  const { tab, editChat, tabId } = useChatContext();
  if (!tab?.chats.length) return null;

  return (
    <div className="flex-1 p-2 w-[95%] md:w-[816px] mx-auto overflow-y-auto flex flex-col-reverse gap-4 scrollbar-extra-thin">
      {tab.isConversation && (
        <div className="flex items-center justify-center">
          <Loader size={15} className="animate-spin" />
          {tab.isImageGenerate ? (
            <span className="ml-2">Please wait, generating image...</span>
          ) : null}
        </div>
      )}
      {[...tab.chats].reverse().map((chat, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center justify-start w-full",
            chat.role === "user" && "justify-end"
          )}
        >
          {chat.role === "user" ? (
            <div className="bg-gray-100 rounded-md p-3 w-[90%] md:w-[80%]">
              {!!chat?.files?.length && (
                <div className="w-full overflow-x-auto flex items-center gap-3 pb-2 hide-scrollbar">
                  {chat.files.map((base64, i) => (
                    <ChatFiles
                      file={chat?.allFiles?.[i]?.file}
                      key={i}
                      base64={base64}
                      type={chat?.type?.[i]}
                    />
                  ))}
                </div>
              )}
              <div className="whitespace-pre-wrap break-words text-gray-700">
                {chat.content}
              </div>

              <div className="flex items-center justify-end">
                <button
                  disabled={tab.isConversation}
                  onClick={() => editChat(tabId, i)}
                  className={cn(
                    "cursor-pointer hover:bg-muted-foreground hover:text-white p-2 rounded-full",
                    tab.isConversation && "cursor-not-allowed"
                  )}
                >
                  <Pencil size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className={"w-[95%] md:w-[80%]"}>
              <MDX content={chat.content} model={tab.model} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Chats;
