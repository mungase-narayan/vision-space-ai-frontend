import React from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Bot, Copy, Download, Loader, Pencil } from "lucide-react";

import { MDX } from "@/components";
import { useAuth } from "@/hooks";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useChatsProvider } from "../providers/chats-provider";
import { useReactToPrint } from "react-to-print";
import EditChatResponse from "./edit-chat-response";
import DisplayChatFiles from "./display-chat-files";
import { useChatProvider } from "../providers/chat-provider";
import Hint from "@/components/ui/hint";

export default function ChatMessage({ chat }) {
  const { user } = useAuth();
  const { editChat } = useChatsProvider();
  const { tab } = useChatProvider();
  const isUser = chat.role === "user";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chat.content);
      toast.success("Copied message");
    } catch (err) {
      console.log(err);
      toast.error("Error while copy message");
    }
  };

  return (
    <div className={cn("py-6", isUser ? "bg-background" : "bg-muted")}>
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row gap-4">
        <div className="flex flex-row gap-2">
          {isUser ? (
            <Hint label={tab?.userId?.fullName || user?.fullName}>
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage
                  src={
                    tab?.userId?.avatar?.url ||
                    (!tab?.userId && user?.avatar?.url)
                  }
                  alt="User"
                />
                <AvatarFallback>
                  {tab?.userId?.fullName?.charAt(0) ||
                    user?.fullName?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
            </Hint>
          ) : (
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-active text-white">
                <Bot />
              </AvatarFallback>
            </Avatar>
          )}

          <div className="items-center gap-2 mb-1 flex sm:hidden">
            <span className="font-medium text-sm">
              {isUser ? "You" : "Assistant"}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(chat?.createdAt || new Date(), "hh:mm a")}
            </span>
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="items-center gap-2 mb-1 hidden sm:flex">
            <span className="font-medium text-sm">
              {isUser ? "You" : "Assistant"}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(chat?.createdAt || new Date(), "hh:mm a")}
            </span>
          </div>

          {!!chat?.allFiles?.length && (
            <div className="flex items-center overflow-auto max-w-full gap-3 pb-2 hide-scrollbar">
              {chat.allFiles.map((file, i) => (
                <DisplayChatFiles
                  data={file}
                  key={i}
                  showRemove={false}
                  isUser={isUser}
                />
              ))}
            </div>
          )}

          <div className="prose dark:prose-invert prose-sm max-w-none">
            {isUser ? (
              <div className="flex flex-col">
                <p className="whitespace-pre-wrap break-words text-sm sm:text-base text-foreground">
                  {chat.content}
                </p>
                <div className="flex items-center justify-end print:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={tab.isConversation}
                    onClick={() => editChat(tab.id, chat.id)}
                    className={cn(
                      "transition-opacity duration-150",
                      tab.isConversation
                        ? "cursor-not-allowed opacity-50"
                        : "opacity-70 hover:opacity-100"
                    )}
                    aria-label="Edit message"
                  >
                    <Pencil size={14} />
                  </Button>

                  <Button variant="ghost" onClick={handleCopy}>
                    <Copy size={15} />
                  </Button>
                </div>
              </div>
            ) : (
              <AIResponse
                chat={chat}
                isLast={chat.id === tab.chats[tab.chats.length - 1].id}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const AIResponse = ({ chat, isLast }) => {
  const { tab } = useChatProvider();
  const printRef = React.useRef(null);
  const canvasEl = React.useRef(null);

  const handleAfterPrint = React.useCallback(() => {}, []);
  const handleBeforePrint = React.useCallback(() => {
    return Promise.resolve();
  }, []);

  const printFn = useReactToPrint({
    contentRef: printRef,
    documentTitle: "",
    onAfterPrint: handleAfterPrint,
    onBeforePrint: handleBeforePrint,
  });

  React.useEffect(() => {
    const ctx = canvasEl.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.arc(95, 50, 40, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = "rgb(200, 0, 0)";
      ctx.fillRect(85, 40, 20, 20);
      ctx.save();
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chat.content);
      toast.success("Copied response");
    } catch (err) {
      console.log(err);
      toast.error("Error while copy response");
    }
  };

  return (
    <div className="w-full text-sm sm:text-base" ref={printRef}>
      <MDX content={chat.content} model={tab.model} />
      {isLast && tab.isConversation ? null : (
        <div className="flex items-center justify-end gap-1 print:hidden mt-2">
          <EditChatResponse chat={chat} tabId={tab.id} />
          <Button variant="ghost" onClick={handleCopy}>
            <Copy size={15} />
          </Button>
          <Button variant="ghost" onClick={printFn}>
            <Download size={15} />
          </Button>
        </div>
      )}
      {tab.isConversation && isLast && (
        <div className="flex items-center justify-start gap-1 mt-2 print:hidden">
          <Loader size={15} className="animate-spin" />{" "}
          <span className="text-xs text-muted-foreground">
            Please wait, generating response...
          </span>
        </div>
      )}
    </div>
  );
};
