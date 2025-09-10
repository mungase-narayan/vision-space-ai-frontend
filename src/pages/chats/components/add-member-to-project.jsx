import { useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useShareProject } from "../hooks";
import { useChatsProvider } from "../providers/chats-provider";

import { useDebounce } from "@/hooks";
import useGetUsers from "@/pages/dashboard/admin/user-history/hooks/use-get-users";
import useFilters from "@/pages/dashboard/admin/user-history/hooks/use-filters";

const AddMemberToProject = ({ projectId }) => {
  const { refetchProjects } = useChatsProvider();

  const [open, setOpen] = useState(false);
  const { users } = useGetUsers({});
  const { mutate } = useShareProject({
    fn: () => {
      refetchProjects();
    },
  });
  const { email, setFilters } = useFilters();

  const [localSearch, setLocalSearch] = useState(email);
  const debouncedSearch = useDebounce(localSearch);

  useEffect(() => {
    setFilters({ email: debouncedSearch });
  }, [debouncedSearch]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal sm:w-[420px]"
        >
          Add users
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="sm:w-[420px] p-2">
        <Input
          placeholder="Search members..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="mb-2 w-full"
        />
        {users?.length === 0 ? (
          <p className="p-2 text-sm text-muted-foreground">No users found</p>
        ) : (
          users?.map((member) => (
            <DropdownMenuItem
              key={member._id}
              className="cursor-pointer w-full"
              onSelect={() => {
                mutate({
                  data: { memberId: member._id, projectId, isRemove: false },
                });
                setOpen(false);
              }}
            >
              {member.email}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddMemberToProject;
