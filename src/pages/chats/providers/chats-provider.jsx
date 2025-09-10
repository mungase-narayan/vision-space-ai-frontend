import { useContext, createContext } from "react";

export const ChatsContext = createContext({
  selectedTabId: null,
  setSelectedTabId: () => {},

  chats: [],
  setChats: () => {},

  tabs: [],
  setTabs: () => {},

  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},

  addTab: () => {},
  deleteTab: () => {},
  updateTab: () => {},
  copyTab: () => {},
  closeTab: () => {},
  closeAllTabs: () => {},

  pushTabToStack: () => {},
  removeTabFromStack: () => {},

  updateLastChat: () => {},
  editChat: () => {},
  updateChat: () => {},

  statics: [],
  totalChats: 0,
  messageCount: 0,
  isDeletingChat: false,

  refetchChats: () => {},

  projects: [],
  refetchProjects: () => {},

  projectsLoading: false,
});

export const useChatsProvider = () => {
  const context = useContext(ChatsContext);
  if (!context) throw Error("Context not found");
  return context;
};
