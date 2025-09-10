import { useContext, createContext } from "react";

export const ConversationContext = createContext({
  aiConversationId: null,
  aiConversation: null,
  refetchConversation: () => {},
  model: "",
  setModel: () => {},
  webSearch: false,
  setWebSearch: () => {},
  chats: [],
  setChats: () => {},
  files: [],
  setFiles: () => {},
  isConversation: false,
  setIsConversation: () => {},
  streamId: null,
  setStreamId: () => {},
  userPrompt: null,
  setUserPrompt: () => {},
  forCreating: true,
});

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) throw Error("Context not found");
  return context;
};
