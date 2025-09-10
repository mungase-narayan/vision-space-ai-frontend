import { Loader2, UserX } from "lucide-react";

import { Loader, Pagination } from "@/components";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import useGetUsers from "./hooks/use-get-users";
import useFilters from "./hooks/use-filters";
import InputSearch from "@/components/shared/input-search";
import useInviteUser from "./hooks/use-invite-user";
import useChangeStatus from "./hooks/use-change-status";
import { formatDistanceToNow } from "date-fns";
import DeleteUser from "./components/delete-user";

const Users = () => {
  const { email, isVerified, setFilters, limit, page } = useFilters();
  const {
    users,
    hasNextPage,
    hasPrevPage,
    total,
    totalPages,
    isLoading,
    refetch,
  } = useGetUsers();

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row gap-4 mb-3">
        <div className="relative flex-1">
          <InputSearch
            text={email}
            fn={(value) =>
              setFilters({
                email: value,
                isVerified,
                page: 1,
                limit,
              })
            }
            placeholder="Search by email..."
          />
        </div>

        <Select
          value={isVerified}
          onValueChange={(value) =>
            setFilters({
              email,
              isVerified: value,
              page: 1,
              limit,
            })
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="verified">Active Users</SelectItem>
            <SelectItem value="unverified">Inactive Users</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-full py-4 flex-col">
          <Loader className="animate-spin" size={15} />
          <span>Fetching users please wait!</span>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {users?.length} of {total} users
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <UserX className="h-8 w-8" />
                        <p>No users found.</p>
                        {(email || isVerified !== "all") && (
                          <p className="text-xs">
                            Try adjusting your search or filter criteria.
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users?.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">
                        {user.fullName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user?.lastActiveAt
                          ? formatDistanceToNow(user?.lastActiveAt)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isVerified ? "default" : "secondary"}
                          className={
                            user.isVerified
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : ""
                          }
                        >
                          {user.isVerified ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right flex items-center justify-end">
                        <div className="flex">
                          {user.isVerified ? (
                            user.role === "Admin" ? (
                              <span></span>
                            ) : (
                              <ChangeStatus user={user} refetch={refetch} />
                            )
                          ) : (
                            <InviteUser user={user} refetch={refetch} />
                          )}
                        </div>
                        {user.role !== "Admin" && (
                          <DeleteUser
                            userId={user._id}
                            refetchUsers={refetch}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <div className="flex items-center justify-between mt-3">
        {email || isVerified !== "all" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilters({
                email: "",
                isVerified: "all",
                page: 1,
                limit: 10,
              });
            }}
          >
            Clear Filters
          </Button>
        ) : (
          <div></div>
        )}

        <Pagination
          limit={limit}
          totalPages={totalPages}
          page={page}
          setFilters={(filters) => {
            setFilters({ ...filters, email, isVerified });
          }}
          hasPrevPage={!hasPrevPage}
          hasNextPage={!hasNextPage}
        />
      </div>
    </div>
  );
};

const InviteUser = ({ user, refetch }) => {
  const { inviteUser, isPending } = useInviteUser({
    fn: () => refetch(),
  });

  return (
    <Button
      size="sm"
      onClick={() => inviteUser({ data: { userId: user._id } })}
      disabled={isPending}
      className="h-8"
    >
      {isPending && <Loader2 className="animate-spin" size={15} />}
      {user?.invitationCount > 0 ? "Invited" : "Invite"}
    </Button>
  );
};

const ChangeStatus = ({ user, refetch }) => {
  const { changeStatus, isPending } = useChangeStatus({
    fn: () => refetch(),
  });

  return (
    <Button
      size="sm"
      onClick={() =>
        changeStatus({ data: { userId: user._id, isVerified: false } })
      }
      disabled={isPending}
      className="h-8"
    >
      {isPending && <Loader2 className="animate-spin" size={15} />}
      {user?.isVerified ? "Deactivate" : "Activate"}
    </Button>
  );
};

export default Users;
