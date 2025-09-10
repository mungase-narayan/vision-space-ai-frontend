import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { useState, useRef, useEffect } from "react";

import { useAuth } from "@/hooks";
import { useApp } from "@/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ShapesIcon as AttachmentIcon,
  ImageIcon,
  SendIcon,
  GlobeIcon,
  Loader,
  Square,
  Sparkle,
  Download,
} from "lucide-react";

import { getBase64, getFileExtensionCategory, readAnyFile } from "@/lib/utils";

import ImageUpload from "./image-upload";
import DocumentUpload from "./document-upload";
import DisplayChatFiles from "./display-chat-files";
import { useChatProvider } from "../providers/chat-provider";
import { useChatsProvider } from "../providers/chats-provider";
import { useStartStreaming, useStopStreaming, useUploadFile } from "../hooks";

export default function ChatInput() {
  const textareaRef = useRef(null);
  const { defaultModel } = useApp();

  const { uploadFile } = useUploadFile();
  const { mutate } = useStartStreaming();
  const { mutate: stopStreaming } = useStopStreaming();

  const { openAIKey, user } = useAuth();
  const { updateTab, models } = useChatsProvider();
  const { printFn, tab, userPrompt, setUserPrompt, setFiles, files, streamId } =
    useChatProvider();

  const [fileLoading, setFileLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedModel, setSelectedModel] = useState(tab.model);

  useEffect(() => {
    const selectedFilteredModel = (models || [])
      ?.find((m) => m.name === tab.task)
      ?.models?.find((m) => m.value === tab.model);

    setSelectedModel(selectedFilteredModel);
  }, [models, tab.task, tab.model]);

  const handleSendMessage = () => {
    if (!userPrompt.trim()) {
      toast.error("Please enter some prompt!");
      return;
    }

    textareaRef.current.style.height = "auto";

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
      chat: [
        ...tab.chats,
        {
          role: "user",
          content: userPrompt,
          createdAt: new Date().toISOString(),
          ...(!tab.webSearch && { allFiles: files }),
        },
      ]
        .slice(-20)
        .map((p) => ({ ...p, files: p.allFiles, allFiles: null })),
      web_search: tab.webSearch,
      user_id: user._id,
      session_id: tab.id,
      generate_image: tab.task === "Image Generation",
      ...(openAIKey && { key: openAIKey }),
      ...(tab?.projectId && {
        files: tab.projectFiles,
        prompt: tab.projectPrompt,
        project_id: tab.projectId,
      }),
    };

    updateTab(
      {
        id: uuid(),
        role: "user",
        createdAt: new Date().toISOString(),
        content: userPrompt,
        ...(tab.webSearch
          ? { allFiles: [] }
          : tab.isImageGenerate
          ? { allFiles: files.filter((f) => f.type === "image") }
          : { allFiles: files }),
      },
      tab.id,
      "CHAT"
    );

    setUserPrompt("");
    setFiles([]);
    updateTab({ userPrompt: null, files: [] }, tab.id);
    mutate({ data });
  };

  const isMobileDevice = () => {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isMobileDevice()) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e) => {
    setUserPrompt(e.target.value);
    updateTab({ userPrompt: e.target.value }, tab.id);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleUpload = async (files) => {
    setFileLoading(true);
    setShowUpload(false);
    await Promise.all(
      files.map(async (file) => {
        if (file.size > 10485760) {
          toast.error("The file size must be less than 10 MB");
          return;
        }

        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadFile({ data: formData });
        const url = res?.data?.data?.url;

        let text = await readAnyFile(file);
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
        updateTab(data, tab.id, "FILE");
      })
    ).finally(() => {
      setFileLoading(false);
    });
  };

  const handleImageUpload = async (files) => {
    setFileLoading(true);
    setShowImageUpload(false);
    await Promise.all(
      files.map(async (file) => {
        if (file.size > 5242880) {
          toast.error("The image size must be less than 5 MB");
          return;
        }
        let text = await getBase64(file);
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
        updateTab(data, tab.id, "FILE");
      })
    ).finally(() => {
      setFileLoading(false);
    });
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
          updateTab(data, tab.id, "FILE");
        };

        reader.readAsDataURL(file);
        event.preventDefault();
      }
    }
  };

  useEffect(() => {
    if (tab.id && !isMobileDevice()) {
      textareaRef.current?.focus();
    }
  }, [tab.id]);

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="max-w-5xl mx-auto">
        {!!files.length && !tab.webSearch && (
          <div className="w-full overflow-x-auto flex items-center gap-3 pb-2 hide-scrollbar">
            {tab.isImageGenerate
              ? files
                  .filter((f) => f.type === "image")
                  .map((file) => (
                    <DisplayChatFiles
                      key={file.id}
                      id={file.id}
                      data={file}
                      showRemove={true}
                    />
                  ))
              : files.map((file) => (
                  <DisplayChatFiles
                    key={file.id}
                    id={file.id}
                    data={file}
                    showRemove={true}
                  />
                ))}
          </div>
        )}

        {fileLoading && (
          <div className="text-xs py-1 flex items-center gap-1">
            <Loader size={10} className="animate-spin" />
            <span>Please wait uploading files...</span>
          </div>
        )}

        {showUpload ? (
          <div className="mb-4">
            <DocumentUpload
              onOpenChange={() => setShowUpload(false)}
              onUpload={handleUpload}
              fileLoading={fileLoading}
            />

            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setShowUpload(false)}
            >
              Cancel
            </Button>
          </div>
        ) : null}

        <div className="flex items-end">
          <div className="flex-1 relative border border-border rounded-lg">
            <Textarea
              onPaste={handlePaste}
              disabled={fileLoading}
              ref={textareaRef}
              placeholder="Message..."
              value={userPrompt}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              className="resize-none shadow-none !bg-background border-none min-h-[44px] max-h-[200px] pt-3 
             w-full max-w-full break-words whitespace-pre-wrap fixed-width-textarea"
              rows={1}
            />

            <div className="flex items-center justify-end gap-1 px-2 pb-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => printFn()}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={
                  files.length >= 5 || tab.webSearch || tab.isImageGenerate
                }
                className="h-8 w-8 rounded-full"
                onClick={() => {
                  if (
                    files.length >= 5 ||
                    tab.webSearch ||
                    tab.isImageGenerate
                  ) {
                    return;
                  }
                  setShowUpload((prev) => !prev);
                }}
              >
                <AttachmentIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                disabled={
                  files.length >= 5 ||
                  tab.webSearch ||
                  !selectedModel?.inputModalities?.includes("image")
                }
                onClick={() => {
                  if (
                    files.length >= 5 ||
                    tab.webSearch ||
                    !selectedModel?.inputModalities?.includes("image")
                  ) {
                    return;
                  }
                  setShowImageUpload(true);
                }}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full hidden ${
                  tab.isImageGenerate
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                    : ""
                }`}
                title="Generate image with AI"
                onClick={() => {
                  updateTab(
                    {
                      ...(!tab.isImageGenerate
                        ? { model: "dall-e-3", webSearch: false }
                        : { model: defaultModel }),
                      isImageGenerate: !tab.isImageGenerate,
                    },
                    tab.id
                  );
                }}
              >
                <Sparkle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full ${
                  tab.webSearch
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                    : ""
                }`}
                title="Search the internet"
                onClick={() =>
                  updateTab(
                    {
                      webSearch: !tab.webSearch,
                      isImageGenerate: false,
                      model: tab?.isImageGenerate ? defaultModel : tab.model,
                    },
                    tab.id
                  )
                }
              >
                <GlobeIcon className="h-4 w-4" />
              </Button>
              {tab.isConversation && streamId ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full flex-shrink-0"
                  onClick={() => {
                    stopStreaming({ data: { stream_id: streamId } });
                  }}
                >
                  <Square className="h-4 w-4 fill-muted-foreground" />
                </Button>
              ) : (
                <Button
                  variant={userPrompt.trim() ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-full flex-shrink-0"
                  onClick={handleSendMessage}
                  disabled={!userPrompt.trim()}
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ImageUpload
        open={showImageUpload}
        onOpenChange={setShowImageUpload}
        onUpload={handleImageUpload}
      />
    </div>
  );
}
