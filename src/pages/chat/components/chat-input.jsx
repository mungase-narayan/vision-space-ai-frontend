import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Globe,
  ImagePlus,
  Loader,
  Paperclip,
  Sparkle,
  Square,
} from "lucide-react";

import { useAuth } from "@/hooks";
import {
  cn,
  getBase64,
  getFileExtensionCategory,
  readAnyFile,
} from "@/lib/utils";

import ChatFiles from "./chat-files";
import { useChatContext } from "../provider";
import { useStartStreaming, useStopStreaming, useUploadFile } from "../hooks";
import { SelectModel } from "./select-model";
import { useApp } from "@/providers/app-provider";

const ChatInput = () => {
  const { openAIKey, user } = useAuth();
  const { mutate } = useStartStreaming();
  const { userPrompt, setUserPrompt, updateTabs, tabId, setFiles, files, tab } =
    useChatContext();

  const handelConversation = () => {
    if (!userPrompt) {
      toast.error("Please enter some prompt!");
      return;
    }

    let result = [];
    let extension = [];
    let type = [];
    if (tab.isImageGenerate) {
      files
        .filter((f) => f.type === "image")
        ?.map((file) => {
          result.push(file.text);
          extension.push(file.extension);
          type.push(file.type);
        });
    } else
      files?.map((file) => {
        result.push(file.text);
        extension.push(file.extension);
        type.push(file.type);
      });

    const data = {
      model: tab.model,
      ...(openAIKey && { key: openAIKey }),
      chat: [
        ...tab.chats,
        {
          role: "user",
          content: userPrompt,
          ...(!tab.webSearch && { files: result, extension, type }),
        },
      ]
        .slice(-20)
        .map((p) => ({ ...p, allFiles: null })),
      web_search: tab.webSearch,
      user_id: user._id,
      session_id: tabId,
      generate_image: tab.isImageGenerate,
    };

    updateTabs(
      {
        id: uuid(),
        role: "user",
        content: userPrompt,
        ...(tab.webSearch
          ? { files: [], extension: [], type: [], allFiles: [] }
          : tab.isImageGenerate
          ? {
              files: result,
              extension,
              type,
              allFiles: files.filter((f) => f.type === "image"),
            }
          : {
              files: result,
              extension,
              type,
              allFiles: files,
            }),
      },
      tabId,
      "CHAT"
    );

    setUserPrompt("");
    setFiles([]);
    updateTabs({ userPrompt: null, files: [] }, tabId);
    mutate({ data });
  };

  if (!tab.chats.length) {
    return (
      <div className="flex items-center flex-col gap-4 justify-center h-[80vh]">
        <h1 className="font-bold text-xl md:text-3xl">
          What's on your mind today?
        </h1>
        <ChatInputBase handelConversation={handelConversation} />
      </div>
    );
  }

  return <ChatInputBase handelConversation={handelConversation} />;
};

const ChatInputBase = ({ handelConversation }) => {
  const {
    userPrompt,
    setUserPrompt,
    updateTabs,
    tabId,
    setFiles,
    files,
    tab,
    streamId,
  } = useChatContext();
  const { defaultModel } = useApp();
  const { mutate } = useStopStreaming();
  const { uploadFile } = useUploadFile();
  const [fileLoading, setFileLoading] = useState(false);

  const textareaRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleInputChange = (e) => {
    setUserPrompt(e.target.value);
    updateTabs({ userPrompt: e.target.value }, tabId);

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height =
        Math.min(
          Math.max(tab.isConversation ? 80 : textarea.scrollHeight, 80),
          230
        ) + "px";
    }
  };

  const handlePaste = (event) => {
    const items = event.clipboardData.items;
    for (let item of items) {
      if (item.type.startsWith("image")) {
        if (files.length >= 5) {
          toast.error("You can upload up to 5 files.");
          continue;
        }
        const file = item.getAsFile();
        if (file.size > 5242880) {
          toast.error("The image size must be less than 5 MB");
          continue;
        }
        const reader = new FileReader();

        reader.onloadend = () => {
          const data = {
            file,
            id: uuid(),
            text: reader.result,
            name: "image.png",
            type: "image",
            extension: "image/png",
            url: "",
            category: "IMAGE",
          };
          setFiles((prev) => [...prev, data]);
          updateTabs(data, tabId, "FILE");
        };

        reader.readAsDataURL(file);
        event.preventDefault();
      }
    }
  };

  return (
    <div className="relative w-[95%] lg:w-[816px] mx-auto">
      <div className="relative w-full h-auto border bg-muted rounded-lg p-3 ">
        {!!files.length && !tab.webSearch && (
          <div className="w-full overflow-x-auto flex items-center gap-3 pb-2 hide-scrollbar">
            {tab.isImageGenerate
              ? files
                  .filter((f) => f.type === "image")
                  .map((file) => (
                    <ChatFiles id={file.id} data={file} showRemove={true} />
                  ))
              : files.map((file) => (
                  <ChatFiles id={file.id} data={file} showRemove={true} />
                ))}
          </div>
        )}
        {fileLoading && (
          <div className="text-xs flex items-center gap-1">
            <Loader size={10} className="animate-spin" />
            <span>Please wait uploading file...</span>
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={userPrompt}
          onChange={handleInputChange}
          onPaste={handlePaste}
          className="bg-muted h-[80px] w-full border-none focus:outline-none focus:ring-0 resize-none"
          placeholder="Ask anything"
          disabled={tab.isConversation}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handelConversation();
              textareaRef.current.style.height = "80px";
            }
          }}
        />

        <div className="flex items-center flex-col sm:flex-row sm:justify-between gap-2">
          <div className="flex w-full sm:w-fit">
            <SelectModel />
          </div>
          <div className="flex items-center justify-end w-full gap-2">
            <input
              ref={fileRef}
              accept="application/*,text/*,.ts,.tsx,.js,.jsx,.mjs,.cjs,.html,.htm,.css,.scss,.sass,.py,.java,.c,.cpp,.cs,.go,.rb,.php,.rs,.swift,.kt,.kts,.sql,.json,.xml,.sh,.bat,.ps1,.yaml,.yml,.ini,.toml,.md,.txt,.env,.Dockerfile,.make,.mk,.pl,.lua,.r,.jl,.hs,.scala,.vb,.vbs,.asm"
              type="file"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file.size > 10485760) {
                  toast.error("The file size must be less than 10 MB");
                  return;
                }

                setFileLoading(true);
                const formData = new FormData();
                formData.append("file", file);
                const res = await uploadFile({ data: formData });
                const url = res?.data?.data?.url;

                let text = await readAnyFile(e.target.files[0]);
                const data = {
                  file,
                  id: uuid(),
                  text,
                  name: file.name,
                  type: "file",
                  extension: file.type,
                  url,
                  category: getFileExtensionCategory(file),
                };
                setFiles((prev) => [...prev, data]);
                updateTabs(data, tabId, "FILE");
                e.target.value = "";
                setFileLoading(false);
              }}
            />

            <button
              className={cn(
                "cursor-pointer text-foreground flex items-center gap-1",
                (files.length >= 5 || tab.webSearch || tab.isImageGenerate) &&
                  "cursor-not-allowed"
              )}
              disabled={
                files.length >= 5 || tab.webSearch || tab.isImageGenerate
              }
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
                if (file.size > 5242880) {
                  toast.error("The image size must be less than 5 MB");
                  return;
                }
                let text = await getBase64(e.target?.files[0]);
                const data = {
                  file,
                  id: uuid(),
                  text,
                  name: file.name,
                  type: "image",
                  extension: file.type,
                  url: "",
                  category: getFileExtensionCategory(file),
                };
                setFiles((prev) => [...prev, data]);
                updateTabs(data, tabId, "FILE");
                e.target.value = "";
              }}
            />
            <button
              className={cn(
                "cursor-pointer text-foreground flex items-center gap-1",
                (files.length >= 5 || tab.webSearch) && "cursor-not-allowed"
              )}
              disabled={files.length >= 5 || tab.webSearch}
              onClick={() => inputRef.current.click()}
            >
              <ImagePlus size={15} />
            </button>

            <button
              className={cn(
                "bg-muted-foreground/20 rounded-full px-3 py-1 cursor-pointer text-foreground flex items-center gap-1",
                tab.isImageGenerate && "bg-muted-foreground text-muted"
              )}
              onClick={() => {
                updateTabs(
                  {
                    ...(!tab.isImageGenerate
                      ? { model: "dall-e-3", webSearch: false }
                      : { model: defaultModel }),
                    isImageGenerate: !tab.isImageGenerate,
                  },
                  tabId
                );
              }}
            >
              <Sparkle size={15} /> <span className="text-sm">Image</span>
            </button>

            <button
              className={cn(
                "bg-muted-foreground/20 rounded-full px-3 py-1 cursor-pointer text-foreground flex items-center gap-1",
                tab.webSearch && "bg-muted-foreground text-muted",
                tab.isImageGenerate && "cursor-not-allowed"
              )}
              disabled={tab.isImageGenerate}
              onClick={() => {
                updateTabs({ webSearch: !tab.webSearch }, tabId);
              }}
            >
              <Globe size={15} /> <span className="text-sm">Search</span>
            </button>

            {tab.isConversation && streamId ? (
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
