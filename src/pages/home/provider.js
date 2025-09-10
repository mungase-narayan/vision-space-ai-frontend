import { useContext, createContext } from "react";

export const ChatContext = createContext({
  userPrompt: "",
  setUserPrompt: () => {},
  updateTabs: () => {},
  tabId: "",
  editChat: () => {},
  files: [],
  setFiles: () => {},
  updateLastChat: () => {},
  tab: null,
  streamId: null,
  setStreamId: () => {},
});

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) throw Error("Context not found");
  return context;
};
