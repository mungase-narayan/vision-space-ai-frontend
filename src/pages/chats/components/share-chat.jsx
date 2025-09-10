import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import AddMemberToChat from "./add-member-to-chat";
import MemberChatCard from "./member-chat-card";

const ShareChat = ({ tab, title }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild classNamew="w-full">
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="cursor-pointer p-1 hover:bg-muted transition-all rounded-lg flex items-center w-full px-3 py-1 gap-2"
        >
          <Settings size={13} />
          <span className="text-sm">{title}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="min-w-[calc(80vw)]">
        <DialogHeader>
          <DialogTitle>{tab?.name}</DialogTitle>
          <DialogDescription>Manage Chat</DialogDescription>
        </DialogHeader>
        <div className="relative max-h-[calc(80vh)] min-h-[calc(80vh)] overflow-y-auto">
          {tab.isCreator && <AddMemberToChat aiConversationId={tab._id} />}
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-2 mt-3 w-full">
            {(tab?.assignee || [])
              .filter((m) => m._id === tab.userId)
              .map((member) => (
                <MemberChatCard
                  isCreator={tab.isCreator}
                  creatorId={tab.userId}
                  aiConversationId={tab._id}
                  member={member}
                  key={member._id}
                />
              ))}

            {(tab?.assignee || [])
              .filter((m) => m._id !== tab.userId)
              .map((member) => (
                <MemberChatCard
                  isCreator={tab.isCreator}
                  creatorId={tab.userId}
                  member={member}
                  aiConversationId={tab._id}
                  key={member._id}
                />
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareChat;
