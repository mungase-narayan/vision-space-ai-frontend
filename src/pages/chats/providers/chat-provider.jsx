import { useContext, createContext } from "react";

export const ChatContext = createContext({
  tab: null,
  userPrompt: "",
  setUserPrompt: () => {},

  files: [],
  setFiles: () => {},

  streamId: null,
  setStreamId: () => {},

  models: [],
});

export const useChatProvider = () => {
  const context = useContext(ChatContext);
  if (!context) throw Error("Context not found");
  return context;
};
