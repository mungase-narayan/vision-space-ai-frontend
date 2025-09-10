import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { useEffect, useRef } from "react";
import { ArrowUp, Globe, ImagePlus, Paperclip, Square } from "lucide-react";

import { useAuth } from "@/hooks";
import {
  cn,
  getBase64,
  getFileExtensionCategory,
  readAnyFile,
} from "@/lib/utils";

import ChatFiles from "./chat-files";
import SelectModel from "./select-model";
import useStopStreaming from "../hooks/use-stop-streaming";
import useStartStreaming from "../hooks/use-start-streaming";
import { useConversation } from "../provider/conversation-provider";
import useUpdateConversation from "../hooks/use-update-conversation";
import { useConversationLaout } from "../provider/conversation-layout-provider";

const ChatInput = () => {
  const { openAIKey, user } = useAuth();
  const { mutate } = useStartStreaming();
  const { setTabs } = useConversationLaout();
  const {
    userPrompt,
    setUserPrompt,
    chats,
    setChats,
    setFiles,
    files,
    model,
    webSearch,
    isConversation,
    aiConversationId,
  } = useConversation();

  const handelConversation = () => {
    if (!userPrompt) {
      toast.error("Please enter some prompt!");
      return;
    }

    let result = [];
    let extension = [];
    let type = [];

    files?.map((data) => {
      result.push(data.blob);
      extension.push(data.extension);
      type.push(data.type);
    });

    const data = {
      model,
      ...(openAIKey && { key: openAIKey }),
      chat: [
        ...chats,
        {
          role: "user",
          content: userPrompt,
          ...(!webSearch && { files: result, extension, type }),
        },
      ]
        .slice(-20)
        .map((p) => ({ ...p, allFiles: null })),
      web_search: webSearch,
      user_id: user._id,
      session_id: aiConversationId,
    };

    setChats((prev) => [
      ...prev,
      {
        role: "user",
        content: userPrompt,
        ...(!webSearch
          ? {
              files: result,
              extension,
              type,
              allFiles: files,
            }
          : { files: [], extension: [], type: [], allFiles: [] }),
      },
    ]);

    setUserPrompt("");
    setFiles([]);
    setTabs((prev) =>
      prev.map((p) =>
        p.aiConversationId === aiConversationId
          ? { ...p, userPrompt: "", files: [] }
          : p
      )
    );

    mutate({ data });
  };

  if (!chats.length) {
    return (
      <div className="flex items-center flex-col gap-4 justify-center h-[80vh]">
        <h1 className="font-bold text-xl md:text-3xl">
          What's on your mind today?
        </h1>
        <ChatInputBase
          isPending={isConversation}
          handelConversation={handelConversation}
        />
      </div>
    );
  }

  return (
    <ChatInputBase
      isPending={isConversation}
      handelConversation={handelConversation}
    />
  );
};

const ChatInputBase = ({ isPending, handelConversation }) => {
  const { setTabs } = useConversationLaout();
  const {
    userPrompt,
    webSearch,
    setUserPrompt,
    setFiles,
    files,
    streamId,
    setWebSearch,
    aiConversationId,
  } = useConversation();
  const { mutate } = useStopStreaming();
  const { updateConversation } = useUpdateConversation({
    callAfterSuccess: () => {},
  });

  const textareaRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleInputChange = (e) => {
    setUserPrompt(e.target.value);
    setTabs((prev) =>
      prev.map((p) =>
        p.aiConversationId === aiConversationId
          ? { ...p, userPrompt: e.target.value }
          : p
      )
    );

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height =
        Math.min(Math.max(isPending ? 80 : textarea.scrollHeight, 80), 230) +
        "px";
    }
  };

  return (
    <div className="relative w-[95%] lg:w-[816px] mx-auto">
      <div className="relative w-full h-auto border bg-muted rounded-lg p-3 ">
        {!!files?.length && !webSearch && (
          <div className="w-full overflow-x-auto flex items-center gap-3 pb-2 hide-scrollbar">
            {files.map((file) => (
              <ChatFiles key={file.id} data={file} showRemove={true} />
            ))}
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={userPrompt}
          onChange={handleInputChange}
          className="bg-muted h-[80px] w-full border-none focus:outline-none focus:ring-0 resize-none"
          placeholder="Ask anything"
          disabled={isPending}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handelConversation();
              textareaRef.current.style.height = "80px";
            }
          }}
        />

        <div className="flex items-center flex-col sm:flex-row justify-center sm:justify-between gap-2">
          <SelectModel />

          <div className="flex items-center gap-2 justify-end w-full">
            <input
              ref={fileRef}
              accept="application/*,text/*,.ts,.tsx,.js,.jsx,.mjs,.cjs,.html,.htm,.css,.scss,.sass,.py,.java,.c,.cpp,.cs,.go,.rb,.php,.rs,.swift,.kt,.kts,.sql,.json,.xml,.sh,.bat,.ps1,.yaml,.yml,.ini,.toml,.md,.txt,.env,.Dockerfile,.make,.mk,.pl,.lua,.r,.jl,.hs,.scala,.vb,.vbs,.asm"
              type="file"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file.size > 10 * 1024 * 1024) {
                  toast.error("The file size must be less than 10 MB");
                  return;
                }
                let blob = await readAnyFile(file);
                const data = {
                  file,
                  id: uuid(),
                  blob,
                  name: file.name,
                  type: "file",
                  extension: file.type,
                  url: "",
                  category: getFileExtensionCategory(file),
                };
                setFiles((prev) => [...prev, data]);
                setTabs((prevTabs) =>
                  prevTabs.map((tab) => {
                    if (tab.aiConversationId === aiConversationId) {
                      return {
                        ...tab,
                        files: Array.isArray(tab.files)
                          ? [...tab.files, data]
                          : [data],
                      };
                    }
                    return tab;
                  })
                );
                e.target.value = "";
              }}
            />

            <button
              className={cn(
                "cursor-pointer text-foreground flex items-center gap-1",
                (files.length >= 5 || webSearch) && "cursor-not-allowed"
              )}
              disabled={files.length >= 5 || webSearch}
              onClick={() => fileRef.current.click()}
            >
              <Paperclip size={15} />
            </button>

            <input
              ref={inputRef}
              accept="image/*"
              type="file"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file.size > 10 * 1024 * 1024) {
                  toast.error("The image size must be less than 10 MB");
                  return;
                }
                let blob = await getBase64(file);
                const data = {
                  file,
                  id: uuid(),
                  blob,
                  name: file.name,
                  type: "image",
                  extension: file.type,
                  url: "",
                  category: getFileExtensionCategory(file),
                };
                setFiles((prev) => [...prev, data]);
                setTabs((prevTabs) =>
                  prevTabs.map((tab) => {
                    if (tab.aiConversationId === aiConversationId) {
                      return {
                        ...tab,
                        files: Array.isArray(tab.files)
                          ? [...tab.files, data]
                          : [data],
                      };
                    }
                    return tab;
                  })
                );
              }}
            />

            <button
              className={cn(
                "cursor-pointer text-foreground flex items-center gap-1",
                (files.length >= 5 || webSearch) && "cursor-not-allowed"
              )}
              disabled={files.length >= 5 || webSearch}
              onClick={() => inputRef.current.click()}
            >
              <ImagePlus size={15} />
            </button>

            <button
              className={cn(
                "bg-muted-foreground/20 rounded-full px-3 py-1 cursor-pointer text-foreground flex items-center gap-1",
                webSearch && "bg-muted-foreground text-muted"
              )}
              onClick={() => {
                updateConversation({
                  data: { aiConversationId, webSearch: !webSearch },
                });
                setWebSearch((prev) => !prev);
              }}
            >
              <Globe size={15} /> <span className="text-sm">Search</span>
            </button>

            {isPending ? (
              <button
                onClick={() => {
                  mutate({ data: { stream_id: streamId } });
                }}
                className={cn(
                  "bg-muted-foreground/20 rounded-full p-2 cursor-pointer text-muted-foreground"
                )}
              >
                <Square fill="#000" strokeWidth={0} size={15} />
              </button>
            ) : (
              <button
                onClick={() => {
                  handelConversation();
                  textareaRef.current.style.height = "100px";
                }}
                disabled={!userPrompt}
                className={cn(
                  "bg-muted-foreground/20 rounded-full p-2 cursor-pointer text-muted-foreground",
                  !userPrompt &&
                    "cursor-not-allowed bg-muted-foreground/10 text-muted-foreground"
                )}
              >
                <ArrowUp size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
