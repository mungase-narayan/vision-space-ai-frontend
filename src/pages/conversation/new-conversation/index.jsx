import {
  ArrowUp,
  Globe,
  ImagePlus,
  Loader,
  Paperclip,
  Plus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getBase64, readAnyFile, cn } from "@/lib/utils";

import useCreateConversation from "../hooks/use-create-conversation";
import { useConversationLaout } from "../provider/conversation-layout-provider";
import SelectModel from "./select-model";
import { Button } from "@/components/ui/button";
import { useApp } from "@/providers/app-provider";

const NewConversation = () => {
  const { defaultModel } = useApp();
  const navigate = useNavigate();
  const { createConversation, isPending } = useCreateConversation({
    callAfterSuccess: () => {},
  });
  const { refetchAIConversations, setTabs } = useConversationLaout();

  const [userPrompt, setUserPrompt] = useState("");
  const [webSearch, setWebSearch] = useState(false);
  const [model, setModel] = useState(defaultModel);
  const [files, setFiles] = useState([]);

  const textareaRef = useRef(null);
  const inputRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleInputChange = (e) => {
    setUserPrompt(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height =
        Math.min(Math.max(textarea.scrollHeight, 80), 230) + "px";
    }
  };

  const handleCreateChat = async () => {
    const response = await createConversation({
      data: {
        name: "New Chat",
        model,
        webSearch,
        chats: [],
      },
    });
    const aiConversationId = response.data.data._id;
    setTabs([
      {
        aiConversationId,
        name: "New Chat",
        userPrompt: "",
        files: [],
      },
    ]);
    refetchAIConversations();
    navigate(`/chat/${aiConversationId}?fromCreate=true`);
  };

  const handleCreateConversation = async () => {
    if (!userPrompt) {
      toast.error("Enter user prompt");
      return;
    }

    const response = await createConversation({
      data: {
        name: "New Chat",
        model,
        webSearch,
        chats: [{ role: "user", content: userPrompt }],
      },
    });
    const aiConversationId = response.data.data._id;
    setTabs([
      {
        aiConversationId,
        name: "New Chat",
        userPrompt: "",
        files: [],
      },
    ]);
    refetchAIConversations();
    navigate(`/chat/${aiConversationId}?fromCreate=true`);
  };

  return (
    <div className="h-full flex items-center flex-col gap-2 justify-center">
      <Button onClick={handleCreateChat}>
        {isPending ? <Loader className="animate-spin" /> : <Plus />} New Chat
      </Button>
    </div>
  );

  return (
    <div className="h-full flex items-center justify-center">
      <div className="relative w-[95%] lg:w-[816px] mx-auto">
        <div className="relative w-full h-auto border bg-muted rounded-lg p-3 ">
          {/* {!!files.length && !webSearch && (
          <div className="w-full overflow-x-auto flex items-center gap-3 pb-2 hide-scrollbar">
            {files.map((file) => (
              <ChatFiles
                id={file.id}
                file={file.file}
                key={file.id}
                type={file?.file?.type?.includes("image") ? "image" : "file"}
                base64={file.text}
                showRemove={true}
              />
            ))}
          </div>
        )} */}
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
                handleCreateConversation();
                textareaRef.current.style.height = "80px";
              }
            }}
          />

          <div className="flex items-center flex-col sm:flex-row justify-center sm:justify-between gap-2">
            <SelectModel model={model} setModel={setModel} />

            <div className="flex items-center gap-2 justify-end w-full">
              <input
                ref={fileRef}
                accept="application/*,text/*,.ts,.tsx,.js,.jsx,.mjs,.cjs,.html,.htm,.css,.scss,.sass,.py,.java,.c,.cpp,.cs,.go,.rb,.php,.rs,.swift,.kt,.kts,.sql,.json,.xml,.sh,.bat,.ps1,.yaml,.yml,.ini,.toml,.md,.txt,.env,.Dockerfile,.make,.mk,.pl,.lua,.r,.jl,.hs,.scala,.vb,.vbs,.asm"
                type="file"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files[0].size > 10485760) {
                    toast.error("The file size must be less than 10 MB");
                    return;
                  }

                  let text = await readAnyFile(e.target.files[0]);
                  const file = { file: e.target.files[0], id: uuid(), text };
                  setFiles((prev) => [...prev, file]);
                  //TODO: update tab files
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
                  if (e.target.files[0].size > 10485760) {
                    toast.error("The image size must be less than 10 MB");
                    return;
                  }
                  let text = await getBase64(e.target?.files[0]);
                  const file = { file: e.target.files[0], id: uuid(), text };
                  setFiles((prev) => [...prev, file]);
                  //TODO: update tab files
                  e.target.value = "";
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
                  setWebSearch((prev) => !prev);
                }}
              >
                <Globe size={15} /> <span className="text-sm">Search</span>
              </button>

              <button
                onClick={() => {
                  handleCreateConversation();
                  textareaRef.current.style.height = "100px";
                }}
                disabled={!userPrompt}
                className={cn(
                  "bg-muted-foreground/20 rounded-full p-2 cursor-pointer text-muted-foreground",
                  !userPrompt &&
                    "cursor-not-allowed bg-muted-foreground/10 text-muted-foreground"
                )}
              >
                {isPending ? (
                  <Loader size={15} className="animate-spin" />
                ) : (
                  <ArrowUp size={15} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewConversation;
