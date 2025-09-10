import { useContext, createContext } from "react";

export const AppContext = createContext({
  defaultModel: "gpt-4",
  refetchConfig: () => {},
  isDisplayAllModels: false,
});

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw Error("Context not found");
  return context;
};
