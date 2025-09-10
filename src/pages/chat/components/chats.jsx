import React from "react";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import { Copy, Download, Loader, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { MDX } from "@/components";
import Hint from "@/components/ui/hint";
import { Button } from "@/components/ui/button";

import ChatFiles from "./chat-files";
import EditResponse from "./edit-response";
import { usePrint } from "./print-provider";
import { useChatContext } from "../provider";

const Chats = () => {
  const { tab, editChat, tabId } = useChatContext();
  const { printRef } = usePrint();
  if (!tab?.chats.length) return null;

  return (
    <div
      ref={printRef}
      className="flex-1 p-2 w-[95%] lg:w-[816px] mx-auto overflow-y-auto flex flex-col-reverse gap-4 scrollbar-extra-thin"
    >
      {tab.isConversation && (
        <div className="flex items-center justify-center">
          <Loader size={15} className="animate-spin" />{" "}
          {tab.isImageGenerate ? (
            <span className="ml-2">Please wait, generating image...</span>
          ) : null}
        </div>
      )}
      {[...tab.chats].reverse().map((chat, i, arr) => (
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
                    <ChatFiles data={file} key={i} showRemove={false} />
                  ))}
                </div>
              )}
              <div className="whitespace-pre-wrap break-words text-base text-gray-700">
                {chat.content}
              </div>

              <div className="flex items-center justify-end">
                <button
                  disabled={tab.isConversation}
                  onClick={() => editChat(tabId, i)}
                  className={cn(
                    "cursor-pointer hover:bg-muted-foreground hover:text-white p-2 rounded-full print:hidden",
                    tab.isConversation && "cursor-not-allowed"
                  )}
                >
                  <Pencil size={12} />
                </button>
              </div>
            </div>
          ) : (
            <AIResponse
              chat={chat}
              model={tab.model}
              isLast={i === 0}
              isLoading={tab.isConversation}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const AIResponse = ({ chat, model, isLast, isLoading }) => {
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
      toast.error("Error while copy response");
    }
  };

  return (
    <div className={"w-[95%] md:w-[80%]"} ref={printRef}>
      <MDX content={chat.content} model={model} />
      {isLast && isLoading ? null : (
        <div className="flex items-center justify-start gap-1 print:hidden mt-3">
          <EditResponse chat={chat} />
          <Hint label="Copy" size="icon">
            <Button variant="ghost" onClick={handleCopy}>
              <Copy size={15} />
            </Button>
          </Hint>
          <Hint label="Download" size="icon">
            <Button variant="ghost" onClick={printFn}>
              <Download size={15} />
            </Button>
          </Hint>
        </div>
      )}
    </div>
  );
};

export default Chats;
