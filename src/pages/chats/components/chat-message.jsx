import React from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Bot, Copy, Download, Loader, Pencil, Sparkles, Zap } from "lucide-react";

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
    <div className={cn("py-3", isUser ? "bg-background" : "bg-gradient-to-br from-slate-50/80 to-slate-100/60 dark:from-slate-800/70 dark:to-slate-700/50")}>
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row gap-3">
        <div className="flex flex-row gap-2">
          {isUser ? (
            <Hint label={tab?.userId?.fullName || user?.fullName}>
              <Avatar className="h-8 w-8 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                <AvatarImage
                  src={
                    tab?.userId?.avatar?.url ||
                    (!tab?.userId && user?.avatar?.url)
                  }
                  alt="User"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-xs">
                  {tab?.userId?.fullName?.charAt(0) ||
                    user?.fullName?.charAt(0) ||
                    "U"}
                </AvatarFallback>
              </Avatar>
            </Hint>
          ) : (
            <div className="relative">
              <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-slate-300 dark:ring-slate-500">
                <AvatarFallback className="bg-gradient-to-br from-slate-600 via-slate-700 to-gray-700 dark:from-slate-500 dark:via-slate-600 dark:to-gray-600 text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-gradient-to-r from-slate-500 to-gray-600 dark:from-slate-400 dark:to-gray-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-2 w-2 text-white" />
              </div>
            </div>
          )}

          <div className="items-center gap-1.5 mb-0.5 flex sm:hidden">
            <span className="font-medium text-xs bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
              {isUser ? "You" : "AI"}
            </span>
            <span className="text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
              {format(chat?.createdAt || new Date(), "hh:mm a")}
            </span>
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="items-center gap-2 mb-2 hidden sm:flex">
            <span className="font-medium text-xs bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
              {isUser ? "You" : "AI Assistant"}
            </span>
          </div>

          {!!chat?.allFiles?.length && (
            <div className="flex items-center overflow-auto max-w-full gap-2 pb-2 hide-scrollbar">
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

          <div className={cn(
            "prose dark:prose-invert prose-sm max-w-none",
            !isUser && "bg-gradient-to-br from-slate-50/95 to-gray-50/90 dark:from-slate-800/60 dark:to-slate-700/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-200/70 dark:border-slate-600/60"
          )}>
            {isUser ? (
              <div className="flex flex-col">
                <p className="whitespace-pre-wrap break-words text-sm text-foreground leading-relaxed">
                  {chat.content}
                </p>
                <div className="flex items-center justify-end print:hidden mt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={tab.isConversation}
                    onClick={() => editChat(tab.id, chat.id)}
                    className={cn(
                      "h-7 w-7 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full",
                      tab.isConversation
                        ? "cursor-not-allowed opacity-50"
                        : "opacity-70 hover:opacity-100"
                    )}
                    aria-label="Edit message"
                  >
                    <Pencil size={12} />
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-7 w-7 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                  >
                    <Copy size={12} />
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

  const handleAfterPrint = React.useCallback(() => { }, []);
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
    <div className="w-full text-sm relative" ref={printRef}>
      {/* AI Response Content */}
      <div className="relative">
        <MDX content={chat.content} model={tab.model} />
      </div>

      {/* Action Buttons */}
      {isLast && tab.isConversation ? null : (
        <div className="flex items-center justify-end gap-1 print:hidden mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-600/50">
          <EditChatResponse chat={chat} tabId={tab.id} />
          <Button
            variant="ghost"
            onClick={handleCopy}
            className="h-7 w-7 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-slate-700 dark:hover:text-slate-200 rounded-full"
            title="Copy"
          >
            <Copy size={12} />
          </Button>
          <Button
            variant="ghost"
            onClick={printFn}
            className="h-7 w-7 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:text-gray-700 dark:hover:text-gray-200 rounded-full"
            title="Download"
          >
            <Download size={12} />
          </Button>
        </div>
      )}

      {/* Loading State */}
      {tab.isConversation && isLast && (
        <div className="flex items-center justify-start gap-2 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-600/50 print:hidden">
          <div className="relative">
            <Loader size={14} className="animate-spin text-slate-600 dark:text-slate-400" />
            <div className="absolute inset-0 rounded-full border border-slate-300 dark:border-slate-500 animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
              AI is thinking...
            </span>
            <span className="text-xs text-slate-600/70 dark:text-slate-300/70">
              Generating response...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
