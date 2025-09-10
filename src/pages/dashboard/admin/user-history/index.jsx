import { Loader, Pagination } from "@/components";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import useFilters from "./hooks/use-filters";
import useGetUsersHistory from "./hooks/use-get-users-history";

const UsersHistory = () => {
  const { email, isVerified, setFilters, limit, page } = useFilters();

  const { users, hasNextPage, hasPrevPage, total, totalPages, isLoading } =
    useGetUsersHistory();

  return (
    <div className="relative">
      {isLoading ? (
        <div className="flex items-center justify-center h-full py-4 flex-col">
          <Loader className="animate-spin" size={15} />
          <span>Fetching users please wait!</span>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Last 30 days history (Showing {users?.length} of {total} users)
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Chats</TableHead>
                  <TableHead>Messages</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">
                      {user?.user?.fullName}
                    </TableCell>
                    <TableCell>{user?.user?.email}</TableCell>
                    <TableCell>{user?.chatCount}</TableCell>
                    <TableCell>{user?.totalMessages}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <div className="flex items-center justify-center mt-3">
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

export default UsersHistory;
