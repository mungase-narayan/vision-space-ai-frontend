import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

const useGetMemberFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const email = searchParams.get("email");
  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page"))
    : undefined;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit"))
    : undefined;

  const setFilters = useCallback((filters) => {
    setSearchParams((params) => {
      if (filters.email) params.set("email", filters.email);
      else params.delete("email");

      if (filters.page) params.set("page", filters.page.toString());
      if (filters.limit) params.set("limit", filters.limit.toString());

      return params;
    });
  }, []);

  return { page, limit, email, setFilters };
};

export default useGetMemberFilters;
