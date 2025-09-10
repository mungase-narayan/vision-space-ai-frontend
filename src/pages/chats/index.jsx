import { useReactToPrint } from "react-to-print";
import { useCallback, useEffect, useRef, useState } from "react";

import ChatMessage from "./components/chat-message";
import ChatInput from "./components/chat-input";
import { ChatContext } from "./providers/chat-provider";

const Chats = ({ tab }) => {
  const [userPrompt, setUserPrompt] = useState("");
  const [files, setFiles] = useState([]);
  const [streamId, setStreamId] = useState(null);

  const printRef = useRef(null);
  const canvasEl = useRef(null);

  const handleAfterPrint = useCallback(() => { }, []);
  const handleBeforePrint = useCallback(() => {
    return Promise.resolve();
  }, []);

  const printFn = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Report",
    onAfterPrint: handleAfterPrint,
    onBeforePrint: handleBeforePrint,
  });

  useEffect(() => {
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

  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tab?.chats?.length]);

  useEffect(() => {
    if (tab.userPrompt) setUserPrompt(tab.userPrompt);
    if (tab.files) setFiles(tab.files);
  }, [tab]);

  return (
    <ChatContext.Provider
      value={{
        tab,
        userPrompt,
        setUserPrompt,

        files,
        setFiles,

        streamId,
        setStreamId,

        printFn,
      }}
    >
      <div className="flex flex-col h-full" ref={printRef}>
        {tab?.chats?.length === 0 ? (
          tab?.projectId ? (
            <div className="flex-1 flex flex-col items-center pt-10 sm:justify-center p-4">
              <h2 className="text-xl font-semibold mb-4">
                Hello! Welcome to the "{tab?.projectName}" project chat.
              </h2>
              <p className="text-gray-500 mb-6 max-w-3xl text-center">
                Type your first message below to begin collaborating with your
                AI assistant
              </p>

              <p className="text-xs text-gray-500 print:hidden mt-2">
                Using {tab?.model}
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center pt-10 sm:justify-center p-4">
              <div className="max-w-3xl text-center">
                <h2 className="sm:text-2xl font-bold mb-2">
                  What's on your mind today?
                </h2>
                <p className="text-gray-500 mb-6 text-sm sm:text-base">
                  Ask me anything, upload documents, or request assistance with
                  tasks.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    "Explain quantum computing",
                    "Write a short story",
                    "Help me debug this code",
                    "Summarize this article",
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      className="p-3 text-xs sm:text-sm cursor-pointer text-left border rounded-lg hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/80"
                      onClick={() => {
                        setUserPrompt(suggestion);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="pb-20 overflow-y-auto flex-col flex flex-1 scrollbar-extra-thin">
            {[...(tab?.chats || [])]?.map((chat) => (
              <ChatMessage key={chat.id} chat={chat} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="sticky bottom-0 w-full print:hidden">
          <ChatInput />
        </div>
      </div>
    </ChatContext.Provider>
  );
};

export default Chats;
