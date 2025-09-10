import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

const useFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const email = searchParams.get("email");
  const isVerified = searchParams.get("isVerified") ?? "all";
  const page = searchParams.get("page")
    ? parseInt(searchParams.get("page"))
    : 1;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit"))
    : 10;

  const setFilters = useCallback((filters) => {
    setSearchParams((params) => {
      if (filters?.email) params.set("email", filters.email);
      else params.delete("email");

      if (filters?.isVerified) params.set("isVerified", filters.isVerified);
      else params.delete("isVerified");

      if (filters.page) params.set("page", filters.page.toString());

      if (filters.limit) params.set("limit", filters.limit.toString());

      return params;
    });
  }, []);

  return {
    email,
    isVerified,
    page,
    limit,
    setFilters,
  };
};

export default useFilters;
