import { useEffect } from "react";

const useUpdateDocumentTitle = ({ title }) => {
  useEffect(() => {
    document.title = title;
  }, []);
};

export default useUpdateDocumentTitle;
