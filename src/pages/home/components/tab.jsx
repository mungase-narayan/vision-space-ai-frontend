import { useEffect, useState } from "react";

import Chats from "./chats";
import ChatInput from "./chat-input";
import { ChatContext } from "../provider";
import { SelectModel } from "./select-model";

const Tab = ({ tabId, updateTabs, tab, editChat, updateLastChat }) => {
  const [userPrompt, setUserPrompt] = useState("");
  const [files, setFiles] = useState([]);
  const [streamId, setStreamId] = useState(null);

  useEffect(() => {
    if (tab.userPrompt) setUserPrompt(tab.userPrompt);
    if (tab.files) setFiles(tab.files);
  }, [tab.chats]);

  return (
    <ChatContext.Provider
      value={{
        tab,
        userPrompt,
        setUserPrompt,
        editChat,
        updateTabs,
        tabId,
        files,
        setFiles,
        updateLastChat,
        streamId,
        setStreamId,
      }}
    >
      <div className="flex flex-col w-[95%] md:container mx-auto h-[calc(100vh_-115px)]">
        {!!tab.chats.length && <Chats />}
        <ChatInput />
      </div>
    </ChatContext.Provider>
  );
};

export default Tab;
