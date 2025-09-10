import useUserDelete from "../hooks/use-delete-user";

import { ConfirmDeleteButton } from "@/components";

const DeleteUser = ({ userId, refetchUsers }) => {
  const { deleteUser, isPending } = useUserDelete({ fn: () => refetchUsers() });

  return (
    <ConfirmDeleteButton
      onDelete={() => deleteUser({ data: { userId } })}
      itemName="User"
      isLoading={isPending}
    />
  );
};

export default DeleteUser;
