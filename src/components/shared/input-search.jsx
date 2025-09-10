import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const InputSearch = ({ text, fn, placeholder, className }) => {
  const [localSearch, setLocalSearch] = useState(text);
  const debouncedSearch = useDebounce(localSearch);

  useEffect(() => {
    fn(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <Input
      className={cn("w-full sm:max-w-sm h-8 p-0 m-0 px-3 py-1.5", className)}
      type="text"
      placeholder={placeholder}
      value={localSearch}
      onChange={(e) => setLocalSearch(e.target.value)}
    />
  );
};

export default InputSearch;
