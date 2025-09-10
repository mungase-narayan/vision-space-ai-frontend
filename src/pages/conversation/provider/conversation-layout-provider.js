import { useContext, createContext } from "react";

export const ConversationLayoutContext = createContext({
  tabs: [],
  setTabs: () => {},
  refetchAIConversations: () => {},
});

export const useConversationLaout = () => {
  const context = useContext(ConversationLayoutContext);
  if (!context) throw Error("Context not found");
  return context;
};
