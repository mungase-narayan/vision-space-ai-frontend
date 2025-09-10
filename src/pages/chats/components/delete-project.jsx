import React from "react";
import { ConfirmDeleteButton } from "@/components";

import { useDeleteProject } from "../hooks";
import { useChatsProvider } from "../providers/chats-provider";

const DeleteProject = ({ projectId }) => {
  const { refetchProjects } = useChatsProvider();
  const { mutate, isPending } = useDeleteProject({
    fn: () => refetchProjects(),
  });

  return (
    <ConfirmDeleteButton
      onDelete={() => mutate({ data: { projectId } })}
      itemName="Project"
      isLoading={isPending}
      text="Delete"
      className="cursor-pointer p-1 hover:bg-muted justify-start transition-all rounded-lg flex items-center px-3 py-1 gap-2"
    />
  );
};

export default DeleteProject;
